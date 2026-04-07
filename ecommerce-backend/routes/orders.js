import express from 'express'
import validator from 'validator'
import { Order, Cart, Product } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get user's orders
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user.userId }).sort({ created_at: -1 })
    res.json({ data: orders })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Get order by ID (with authorization check)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }
    
    // Check if user owns this order or is admin
    if (order.user_id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    res.json({ data: order })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

// Create order
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { shipping_address, items, total } = req.body

    // Validate shipping address
    if (!shipping_address || typeof shipping_address !== 'string') {
      return res.status(400).json({ error: 'Valid shipping address required' })
    }

    if (shipping_address.length < 5 || shipping_address.length > 500) {
      return res.status(400).json({ error: 'Shipping address must be 5-500 characters' })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    if (!total || typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ error: 'Invalid total amount' })
    }

    // Validate each item and verify products exist
    let calculatedTotal = 0
    for (const item of items) {
      const product = await Product.findById(item.id)
      if (!product) {
        return res.status(400).json({ error: `Product ${item.id} not found` })
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` })
      }
      calculatedTotal += product.price * item.quantity
    }

    // Verify total matches calculated amount (prevent price manipulation)
    if (Math.abs(calculatedTotal - total) > 0.01) {
      return res.status(400).json({ error: 'Order total mismatch' })
    }

    // Decrease stock for each item
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.id,
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
    }

    // Create order
    const order = new Order({
      user_id: req.user.userId,
      items,
      total,
      shipping_address: validator.escape(shipping_address),
      status: 'pending'
    })

    await order.save()

    res.json({ data: order, message: 'Order created successfully' })
  } catch (error) {
    console.error('Order creation error:', error)
    res.status(500).json({ error: 'Failed to create order' })
  }
})

// Update order status (admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'payment', 'delivery', 'delivered']

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json({ data: order, message: 'Order status updated successfully' })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({ error: 'Failed to update order status' })
  }
})

export default router
