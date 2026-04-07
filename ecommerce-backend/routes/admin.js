import express from 'express'
import { Product, Order, User } from '../db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

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
router.post('/products', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body

    // Validate inputs
    if (!name || name.trim().length < 3 || name.length > 100) {
      return res.status(400).json({ error: 'Name must be 3-100 characters' })
    }
    if (!description || description.trim().length < 10 || description.length > 500) {
      return res.status(400).json({ error: 'Description must be 10-500 characters' })
    }
    if (!price || isNaN(price) || price <= 0 || price > 999999) {
      return res.status(400).json({ error: 'Invalid price (0.01-999999)' })
    }
    if (!category || !['Electronics', 'Clothing', 'Home', 'Sports', 'Books'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    if (!image || !image.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid image URL' })
    }
    if (stock === undefined || isNaN(stock) || stock < 0 || stock > 9999) {
      return res.status(400).json({ error: 'Invalid stock (0-9999)' })
    }

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
router.put('/products/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body

    // Validate inputs
    if (name && (name.trim().length < 3 || name.length > 100)) {
      return res.status(400).json({ error: 'Name must be 3-100 characters' })
    }
    if (description && (description.trim().length < 10 || description.length > 500)) {
      return res.status(400).json({ error: 'Description must be 10-500 characters' })
    }
    if (price && (isNaN(price) || price <= 0 || price > 999999)) {
      return res.status(400).json({ error: 'Invalid price (0.01-999999)' })
    }
    if (category && !['Electronics', 'Clothing', 'Home', 'Sports', 'Books'].includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }
    if (image && !image.startsWith('http')) {
      return res.status(400).json({ error: 'Invalid image URL' })
    }
    if (stock !== undefined && (isNaN(stock) || stock < 0 || stock > 9999)) {
      return res.status(400).json({ error: 'Invalid stock (0-9999)' })
    }

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
      { new: true }
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

// Update order status
router.put('/orders/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body

    if (!['pending', 'payment', 'delivery', 'delivered'].includes(status)) {
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
