import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    // Read from cookie instead of Authorization header
    const token = req.cookies.token

    // Debug logging in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth check:', {
        hasCookie: !!token,
        cookies: Object.keys(req.cookies),
        origin: req.headers.origin
      })
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Auth error:', error.message)
    }
    res.status(401).json({ error: 'Invalid token' })
  }
}

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
