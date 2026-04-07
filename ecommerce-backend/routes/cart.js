import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import mongoose from 'mongoose'

const router = express.Router()

// Get MongoDB connection
const getDB = () => mongoose.connection

// Get user's cart
router.get('/my-cart', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id
    const db = getDB()
    
    const cartsCollection = db.collection('carts')
    let cart = await cartsCollection.findOne({ userId: userId.toString() })

    if (!cart) {
      await cartsCollection.insertOne({ userId: userId.toString(), items: [] })
      cart = await cartsCollection.findOne({ userId: userId.toString() })
    }

    res.json({ data: cart.items || [] })
  } catch (error) {
    console.error('Error fetching cart:', error)
    res.status(500).json({ error: 'Failed to fetch cart' })
  }
})

// Add item to cart
router.post('/add-item', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id
    const userIdStr = userId.toString()
    const { productId, quantity, price, name, image } = req.body

    const db = getDB()
    const cartsCollection = db.collection('carts')
    let cart = await cartsCollection.findOne({ userId: userIdStr })

    if (!cart) {
      await cartsCollection.insertOne({ userId: userIdStr, items: [] })
      cart = await cartsCollection.findOne({ userId: userIdStr })
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.productId === productId)

    if (existingItem) {
      // Update quantity
      await cartsCollection.updateOne(
        { userId: userIdStr, 'items.productId': productId },
        { $inc: { 'items.$.quantity': quantity } }
      )
    } else {
      // Add new item
      await cartsCollection.updateOne(
        { userId: userIdStr },
        { $push: { items: { productId, quantity, price, name, image } } }
      )
    }

    const updatedCart = await cartsCollection.findOne({ userId: userIdStr })
    res.json({ data: updatedCart.items })
  } catch (error) {
    console.error('Error adding to cart:', error)
    res.status(500).json({ error: 'Failed to add item to cart' })
  }
})

// Remove item from cart
router.delete('/remove-item/:productId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id
    const userIdStr = userId.toString()
    const productId = req.params.productId

    const db = getDB()
    const cartsCollection = db.collection('carts')
    
    await cartsCollection.updateOne(
      { userId: userIdStr },
      { $pull: { items: { productId } } }
    )

    const updatedCart = await cartsCollection.findOne({ userId: userIdStr })
    res.json({ data: updatedCart.items || [] })
  } catch (error) {
    console.error('Error removing from cart:', error)
    res.status(500).json({ error: 'Failed to remove item from cart' })
  }
})

// Update cart item quantity
router.put('/update-item/:productId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id
    const userIdStr = userId.toString()
    const productId = req.params.productId
    const { quantity } = req.body

    const db = getDB()
    const cartsCollection = db.collection('carts')
    const cart = await cartsCollection.findOne({ userId: userIdStr })

    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' })
    }

    const cartItem = cart.items.find(item => item.productId === productId)

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not in cart' })
    }

    if (quantity <= 0) {
      await cartsCollection.updateOne(
        { userId: userIdStr },
        { $pull: { items: { productId } } }
      )
    } else {
      await cartsCollection.updateOne(
        { userId: userIdStr, 'items.productId': productId },
        { $set: { 'items.$.quantity': quantity } }
      )
    }

    const updatedCart = await cartsCollection.findOne({ userId: userIdStr })
    res.json({ data: updatedCart.items || [] })
  } catch (error) {
    console.error('Error updating cart:', error)
    res.status(500).json({ error: 'Failed to update cart' })
  }
})

// Clear cart
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id
    const userIdStr = userId.toString()

    const db = getDB()
    const cartsCollection = db.collection('carts')
    await cartsCollection.updateOne(
      { userId: userIdStr },
      { $set: { items: [] } }
    )

    res.json({ data: [] })
  } catch (error) {
    console.error('Error clearing cart:', error)
    res.status(500).json({ error: 'Failed to clear cart' })
  }
})

export default router
