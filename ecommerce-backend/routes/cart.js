import express from 'express'
import { Cart, Product } from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Get cart for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.find({ user_id: req.user.userId }).populate('product_id')
    res.json({ data: cart })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// Add to cart
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity } = req.body

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'Product ID and quantity required' })
    }

    const product = await Product.findById(product_id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    let cartItem = await Cart.findOne({ user_id: req.user.userId, product_id })
    
    if (cartItem) {
      cartItem.quantity += quantity
      await cartItem.save()
    } else {
      cartItem = new Cart({
        user_id: req.user.userId,
        product_id,
        quantity
      })
      await cartItem.save()
    }

    res.json({ data: cartItem, message: 'Added to cart' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to cart' })
  }
})

// Update cart item
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' })
    }

    const cartItem = await Cart.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    )

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' })
    }

    res.json({ data: cartItem })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// Remove from cart
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id)
    res.json({ message: 'Removed from cart' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove from cart' })
  }
})

// Clear cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await Cart.deleteMany({ user_id: req.user.userId })
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

export default router
