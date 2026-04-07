import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import axios from 'axios'
import { User } from '../db.js'

const router = express.Router()

// Validation helper
const validateEmail = (email) => {
  return validator.isEmail(email)
}

const validatePassword = (password) => {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)
}

const sanitizeInput = (input) => {
  return validator.trim(validator.escape(input))
}

router.post('/signup', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    email = sanitizeInput(email)

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and number' })
    }

    const existing = await User.findOne({ email })
    
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const hashedPassword = bcrypt.hashSync(password, 10)
    const newUser = new User({
      email,
      password: hashedPassword,
      role: 'user'
    })

    await newUser.save()

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: newUser._id, email: newUser.email, role: newUser.role }
    })
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' })
  }
})

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    email = sanitizeInput(email)

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const user = await User.findOne({ email })
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role }
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
})

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'Credential required' })
    }

    // Verify Google ID token with Google's API
    const googleResponse = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    )

    if (!googleResponse.data || !googleResponse.data.email) {
      return res.status(401).json({ error: 'Invalid Google token' })
    }

    const { email, email_verified, aud } = googleResponse.data

    // Verify the token was issued for this app (audience check)
    if (process.env.GOOGLE_CLIENT_ID && aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ error: 'Token not issued for this application' })
    }

    // Ensure email is verified
    if (!email_verified) {
      return res.status(401).json({ error: 'Email not verified by Google' })
    }

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        email,
        password: bcrypt.hashSync(Math.random().toString(36), 10), // Random password for OAuth users
        role: 'user'
      })
      await user.save()
    }

    const jwtToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token: jwtToken,
      user: { id: user._id, email: user.email, role: user.role }
    })
  } catch (error) {
    console.error('Google auth error:', error.message)
    res.status(401).json({ error: 'Google authentication failed' })
  }
})

export default router