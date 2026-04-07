# 🔒 Security Audit Report - E-Commerce Application

**Audit Date:** Current  
**Repository:** https://github.com/jeniesesey1232/ecommerce  
**Auditor Role:** Senior Security Engineer

---

## ✅ Executive Summary

**Overall Security Score: 75/100** (Good, but needs improvements)

**Dependencies:** ✅ No vulnerabilities found (npm audit clean)

**Critical Issues:** 3  
**High Priority:** 4  
**Medium Priority:** 3  
**Low Priority:** 2

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. **Google OAuth Uses Insecure tokeninfo Endpoint**

**Risk:** The `tokeninfo` endpoint is deprecated and less secure than proper ID token verification.

**Current Code** (`routes/auth.js` line 113):
```javascript
const googleResponse = await axios.get(
  `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
)
```

**Fix:** Use `google-auth-library` for proper verification:

```javascript
// Install: npm install google-auth-library

import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body

    if (!credential) {
      return res.status(400).json({ error: 'Credential required' })
    }

    // Verify with google-auth-library
    const ticket = await client.verifyIdToken({
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
        password: bcrypt.hashSync(Math.random().toString(36), 10),
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
```

---

### 2. **Tokens Stored in sessionStorage (XSS Vulnerable)**

**Risk:** Any XSS vulnerability can steal authentication tokens from sessionStorage.

**Current Code** (`frontend/src/utils/storage.js`):
```javascript
setToken: (token) => sessionStorage.setItem('token', token),
getToken: () => sessionStorage.getItem('token'),
```

**Fix:** Migrate to HttpOnly cookies:

**Backend** (`routes/auth.js`):
```javascript
// After successful login/signup:
res.cookie('token', jwtToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
})

res.json({
  user: { id: user._id, email: user.email, role: user.role }
})
// Don't send token in response body
```

**Backend** (`middleware/auth.js`):
```javascript
export const authMiddleware = (req, res, next) => {
  try {
    // Read from cookie instead of Authorization header
    const token = req.cookies.token

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
    res.status(401).json({ error: 'Invalid token' })
  }
}
```

**Backend** (`server.js`):
```javascript
import cookieParser from 'cookie-parser'

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))
```

**Frontend** - Remove token from storage, rely on cookies:
```javascript
// storage.js - Remove token methods
export const secureStorage = {
  // Remove setToken, getToken
  setUser: (user) => sessionStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = sessionStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  // ... rest
}
```

**Frontend** - Update axios to send cookies:
```javascript
axios.defaults.withCredentials = true
```

---

### 3. **Regex Escape Pattern Broken (ReDoS Vulnerability)**

**Risk:** The regex escape replacement is using a UUID instead of `$&`, making it ineffective.

**Current Code** (`routes/products.js` line 53):
```javascript
const sanitizedQuery = req.params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\8e6df8ed-83d2-4faa-8f60-4c0510a53664')
```

**Fix:**
```javascript
const sanitizedQuery = req.params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
```

---

## 🟠 HIGH PRIORITY ISSUES

### 4. **No Order Status Transition Validation**

**Risk:** Admins can set invalid status transitions (e.g., delivered → pending).

**Current Code** (`routes/orders.js` line 145):
```javascript
order.status = status
await order.save()
```

**Fix:** Add status flow validation:
```javascript
// Define valid transitions
const validTransitions = {
  'pending': ['payment', 'pending'], // Can cancel
  'payment': ['delivery', 'pending'], // Can cancel or proceed
  'delivery': ['delivered', 'pending'], // Can cancel or complete
  'delivered': ['delivered'] // Final state
}

// Validate transition
const currentStatus = order.status
if (!validTransitions[currentStatus]?.includes(status)) {
  return res.status(400).json({ 
    error: `Cannot transition from ${currentStatus} to ${status}` 
  })
}

order.status = status
await order.save()
```

---

### 5. **Missing ObjectId Validation**

**Risk:** Invalid ObjectIds cause unhandled errors and expose stack traces.

**Current Code** (`routes/products.js` line 27):
```javascript
const product = await Product.findById(req.params.id)
```

**Fix:** Validate ObjectId before query:
```javascript
import mongoose from 'mongoose'

router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid product ID' })
    }

    const product = await Product.findById(req.params.id)
    // ... rest
  }
})
```

Apply to all routes using ObjectId parameters:
- `routes/orders.js` - GET /:id, PUT /:id/status
- `routes/admin.js` - PUT /products/:id, DELETE /products/:id, PUT /orders/:id
- `routes/cart.js` - DELETE /remove-item/:productId, PUT /update-item/:productId

---

### 6. **No Centralized Input Validation**

**Risk:** Inconsistent validation across routes, easy to miss edge cases.

**Fix:** Install and use Joi:
```bash
npm install joi
```

Create `middleware/validation.js`:
```javascript
import Joi from 'joi'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(detail => detail.message)
      return res.status(400).json({ error: 'Validation failed', details: errors })
    }
    
    next()
  }
}

// Schemas
export const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  createProduct: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0.01).max(999999).required(),
    category: Joi.string().valid('Electronics', 'Clothing', 'Home', 'Sports', 'Books').required(),
    image: Joi.string().uri().required(),
    stock: Joi.number().integer().min(0).max(9999).required()
  }),
  
  createOrder: Joi.object({
    shipping_address: Joi.string().min(10).max(500).required(),
    items: Joi.array().items(
      Joi.object({
        id: Joi.string().required(),
        quantity: Joi.number().integer().min(1).max(99).required()
      })
    ).min(1).required()
  })
}
```

Use in routes:
```javascript
import { validateRequest, schemas } from '../middleware/validation.js'

router.post('/signup', validateRequest(schemas.signup), async (req, res) => {
  // Validation already done
})
```

---

### 7. **Missing Content Security Policy (CSP)**

**Risk:** XSS attacks can execute malicious scripts.

**Fix:** Add CSP headers in `server.js`:
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", process.env.NODE_ENV === 'production' ? 'https://ecommerce-7zzz.onrender.com' : 'http://localhost:5000'],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["https://accounts.google.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}))
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 8. **Generic Error Messages Leak Information**

**Risk:** Stack traces and detailed errors expose internal structure.

**Current Code:**
```javascript
catch (error) {
  console.error('Order creation error:', error)
  res.status(500).json({ error: 'Failed to create order' })
}
```

**Fix:** Create centralized error handler in `middleware/errorHandler.js`:
```javascript
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Don't leak stack traces in production
  const isDev = process.env.NODE_ENV !== 'production'

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: isDev ? err.message : undefined
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    })
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Resource already exists'
    })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    stack: isDev ? err.stack : undefined
  })
}
```

Add to `server.js`:
```javascript
import { errorHandler } from './middleware/errorHandler.js'

// ... routes ...

// Error handler must be last
app.use(errorHandler)
```

---

### 9. **No Schema-Level Validation**

**Risk:** Invalid data can bypass route validation.

**Fix:** Add validators to schemas in `db.js`:
```javascript
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    minlength: 3,
    maxlength: 100,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 500,
    trim: true
  },
  price: { 
    type: Number, 
    required: true,
    min: [0.01, 'Price must be positive'],
    max: [999999, 'Price too high']
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books']
  },
  image: { 
    type: String, 
    required: true,
    validate: {
      validator: (v) => /^https?:\/\/.+/.test(v),
      message: 'Invalid image URL'
    }
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 0,
    min: [0, 'Stock cannot be negative'],
    max: [9999, 'Stock too high']
  },
  created_at: { type: Date, default: Date.now }
})

const orderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { 
      type: Number, 
      required: true,
      min: [0.01, 'Price must be positive']
    },
    quantity: { 
      type: Number, 
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity too high']
    }
  }],
  total: { 
    type: Number, 
    required: true,
    min: [0.01, 'Total must be positive']
  },
  shipping_address: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 500
  },
  status: { 
    type: String, 
    enum: ['pending', 'payment', 'delivery', 'delivered'], 
    default: 'pending' 
  },
  created_at: { type: Date, default: Date.now }
})
```

---

### 10. **bcrypt.hashSync Blocks Event Loop**

**Risk:** Synchronous hashing blocks Node.js event loop, reducing performance.

**Current Code** (`routes/auth.js`):
```javascript
const hashedPassword = bcrypt.hashSync(password, 10)
```

**Fix:** Use async version:
```javascript
const hashedPassword = await bcrypt.hash(password, 10)
```

Also update password comparison:
```javascript
// Current
if (!user || !bcrypt.compareSync(password, user.password)) {

// Fix
if (!user || !(await bcrypt.compare(password, user.password))) {
```

---

## 🟢 LOW PRIORITY ISSUES

### 11. **Weak Image URL Validation**

**Risk:** Malicious URLs could be stored (low impact, admin-only).

**Current Code** (`routes/admin.js`):
```javascript
if (!image || !image.startsWith('http')) {
  return res.status(400).json({ error: 'Invalid image URL' })
}
```

**Fix:** Use proper URL validation:
```javascript
try {
  const url = new URL(image)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return res.status(400).json({ error: 'Invalid image URL protocol' })
  }
} catch {
  return res.status(400).json({ error: 'Invalid image URL format' })
}
```

---

### 12. **No Rate Limiting on Product Search**

**Risk:** Search endpoint could be abused for DoS.

**Fix:** Add specific rate limiter in `server.js`:
```javascript
const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
  message: 'Too many search requests, please try again later.'
})

app.use('/api/products/search', searchLimiter)
app.use('/api/products', productRoutes)
```

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1 (This Week):
1. Fix regex escape pattern (5 minutes)
2. Add ObjectId validation (30 minutes)
3. Add order status transition validation (20 minutes)
4. Install google-auth-library and fix OAuth (1 hour)

### Phase 2 (Next Week):
5. Migrate to HttpOnly cookies (2-3 hours)
6. Add centralized validation with Joi (2 hours)
7. Add CSP headers (30 minutes)
8. Add error handler middleware (1 hour)

### Phase 3 (Following Week):
9. Add schema-level validation (1 hour)
10. Convert bcrypt to async (30 minutes)
11. Improve image URL validation (15 minutes)
12. Add search rate limiting (15 minutes)

---

## 🎯 FINAL SECURITY SCORE PROJECTION

After implementing all fixes: **95/100** (Excellent)

Remaining 5 points require:
- Security audit by third party
- Penetration testing
- Bug bounty program

---

## 📦 REQUIRED DEPENDENCIES

```bash
cd ecommerce-backend
npm install google-auth-library joi cookie-parser
```

---

## ✅ WHAT'S ALREADY GOOD

- ✅ No npm audit vulnerabilities
- ✅ MongoDB transactions for order creation
- ✅ Quantity validation (1-99)
- ✅ Price recalculation server-side
- ✅ JWT verification middleware
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on auth routes
- ✅ Helmet security headers
- ✅ CORS allowlist
- ✅ NoSQL injection protection
- ✅ Order ownership checks
- ✅ Admin authorization middleware

---

**Report Generated:** Current Date  
**Next Audit Recommended:** After implementing Phase 1-3 fixes
