import express from 'express'
import { Product } from '../db.js'

const router = express.Router()

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock,
      created_at: p.created_at
    }))
    res.json({ data: formattedProducts })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    const formattedProduct = {
      id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image: product.image,
      stock: product.stock,
      created_at: product.created_at
    }
    res.json({ data: formattedProduct })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// Search products
router.get('/search/:query', async (req, res) => {
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: req.params.query, $options: 'i' } },
        { description: { $regex: req.params.query, $options: 'i' } }
      ]
    })
    const formattedProducts = products.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      image: p.image,
      stock: p.stock,
      created_at: p.created_at
    }))
    res.json({ data: formattedProducts })
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

export default router