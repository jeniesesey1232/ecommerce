import express from 'express'
import mongoose from 'mongoose'
import { Product, Order, User } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import { validateRequest, schemas } from '../middleware/validation.js'

const router = express.Router()

// Helper to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id)

// Get all products (admin)
router.get('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const products = await Product.find()
    res.json({ data: products })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Create product
router.post('/products', authMiddleware, adminMiddleware, validateRequest(schemas.createProduct), async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body

    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      category,
      image,
      stock: parseInt(stock)
    })

    await product.save()
    res.json({ data: product, message: 'Product created' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' })
  }
})

// Update product
router.put('/products/:id', authMiddleware, adminMiddleware, validateRequest(schemas.updateProduct), async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const { name, description, price, category, image, stock } = req.body

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (description) updateData.description = description.trim()
    if (price) updateData.price = parseFloat(price)
    if (category) updateData.category = category
    if (image) updateData.image = image
    if (stock !== undefined) updateData.stock = parseInt(stock)

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ data: product, message: 'Product updated' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' })
  }
})

// Delete product
router.delete('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// Get all orders (admin)
router.get('/orders', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 })
    res.json({ data: orders })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// Update order status (admin can override transitions)
router.put('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Validate ObjectId
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid order ID' })
    }

    const { status } = req.body

    if (!['pending', 'payment', 'delivery', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Admin can override, but still validate reasonable transitions
    const validTransitions = {
      'pending': ['payment', 'pending', 'delivery'], // Admin can skip to delivery
      'payment': ['delivery', 'pending', 'delivered'], // Admin can skip to delivered
      'delivery': ['delivered', 'pending'], // Admin can revert or complete
      'delivered': ['delivered'] // Final state, even admin can't change
    }

    const currentStatus = order.status
    if (!validTransitions[currentStatus]?.includes(status)) {
      return res.status(400).json({ 
        error: `Cannot transition from ${currentStatus} to ${status}. Delivered orders are final.` 
      })
    }

    order.status = status
    await order.save()

    res.json({ data: order, message: 'Order updated' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' })
  }
})

// Get dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])

    res.json({
      data: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router
