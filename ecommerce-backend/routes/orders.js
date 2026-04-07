import express from 'express'
import mongoose from 'mongoose'
import mongoSanitize from 'express-mongo-sanitize'
import { Order, Product } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Sanitize all inputs
router.use(mongoSanitize())

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.userId }).sort({ created_at: -1 })
    res.json({ data: orders })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get order by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const order = await Order.findById(req.params.id)
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Check if user owns this order or is admin
    const isAdmin = req.user.role === 'admin'
    const isOwner = order.user_id.toString() === req.user.userId.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({ data: order })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// Create order
router.post('/create', authMiddleware, async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { shipping_address, items } = req.body

    if (!shipping_address) {
      await session.abortTransaction()
      return res.status(400).json({ error: 'Shipping address required' })
    }

    if (!items || items.length === 0) {
      await session.abortTransaction()
      return res.status(400).json({ error: 'Cart is empty' })
    }

    // Validate and recalculate prices from database (prevent price manipulation)
    let calculatedTotal = 0
    const validatedItems = []

    for (const item of items) {
      // Get product ID (handle both 'id' and 'productId' fields)
      const productId = item.productId || item.product_id || item.id
      
      if (!productId) {
        await session.abortTransaction()
        return res.status(400).json({ error: 'Invalid item: missing product ID' })
      }

      // Validate quantity is positive integer
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
        await session.abortTransaction()
        return res.status(400).json({ error: `Invalid quantity for product ${productId}` })
      }

      const product = await Product.findById(productId).session(session)
      
      if (!product) {
        await session.abortTransaction()
        return res.status(400).json({ error: `Product ${productId} not found` })
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction()
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      }

      // Use price from database, not from client
      const itemTotal = product.price * item.quantity
      calculatedTotal += itemTotal

      validatedItems.push({
        product_id: product._id,
        name: product.name,
        price: product.price, // Use DB price
        quantity: item.quantity
      })

      // Decrease stock atomically within transaction
      const updateResult = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      )

      if (!updateResult) {
        await session.abortTransaction()
        return res.status(400).json({ error: `Stock changed for ${product.name}, please try again` })
      }
    }

    // Create order with validated data
    const order = new Order({
      user_id: req.user.userId,
      items: validatedItems,
      total: calculatedTotal, // Use calculated total
      shipping_address,
      status: 'pending'
    })

    await order.save({ session })
    await session.commitTransaction()

    res.json({ data: order, message: 'Order created successfully' })
  } catch (error) {
    await session.abortTransaction()
    console.error('Order creation error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  } finally {
    session.endSession()
  }
})

// Update order status
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const { status } = req.body
    const validStatuses = ['pending', 'payment', 'delivery', 'delivered']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Only admin or order owner can update status
    const isAdmin = req.user.role === 'admin'
    const isOwner = order.user_id.toString() === req.user.userId.toString()

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Regular users can only cancel (set to pending)
    if (!isAdmin && status !== 'pending') {
      return res.status(403).json({ error: 'Only admins can change order status' })
    }

    // Validate status transitions (prevent invalid flows)
    const validTransitions = {
      'pending': ['payment', 'pending'],
      'payment': ['delivery', 'pending'],
      'delivery': ['delivered', 'pending'],
      'delivered': ['delivered'] // Final state
    }

    const currentStatus = order.status
    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${currentStatus} to ${status}` 
      })
    }

    order.status = status
    await order.save()

    res.json({ data: order, message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router
