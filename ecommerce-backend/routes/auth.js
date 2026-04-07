import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { OAuth2Client } from 'google-auth-library'
import { User } from '../db.js'

const router = express.Router()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

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

    const hashedPassword = await bcrypt.hash(password, 10)
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
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
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

    // Verify with google-auth-library (more secure than tokeninfo)
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    
    // Verify issuer
    if (payload.iss !== 'accounts.google.com' && payload.iss !== 'https://accounts.google.com') {
      return res.status(401).json({ error: 'Invalid token issuer' })
    }

    // Verify email is verified
    if (!payload.email_verified) {
      return res.status(401).json({ error: 'Email not verified by Google' })
    }

    const email = payload.email

    // Find or create user
    let user = await User.findOne({ email })

    if (!user) {
      user = new User({
        email,
        password: await bcrypt.hash(Math.random().toString(36), 10),
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