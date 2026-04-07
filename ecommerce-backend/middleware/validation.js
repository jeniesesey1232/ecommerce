import Joi from 'joi'

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false })
    
    if (error) {
      const errors = error.details.map(detail => detail.message)
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      })
    }
    
    next()
  }
}

// Validation schemas
export const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
      })
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  createProduct: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    price: Joi.number().min(0.01).max(999999).required(),
    category: Joi.string()
      .valid('Electronics', 'Clothing', 'Home', 'Sports', 'Books')
      .required(),
    image: Joi.string().uri().required(),
    stock: Joi.number().integer().min(0).max(9999).required()
  }),
  
  updateProduct: Joi.object({
    name: Joi.string().min(3).max(100),
    description: Joi.string().min(10).max(500),
    price: Joi.number().min(0.01).max(999999),
    category: Joi.string().valid('Electronics', 'Clothing', 'Home', 'Sports', 'Books'),
    image: Joi.string().uri(),
    stock: Joi.number().integer().min(0).max(9999)
  }),
  
  createOrder: Joi.object({
    shipping_address: Joi.string().min(10).max(500).required(),
    items: Joi.array()
      .items(
        Joi.object({
          id: Joi.string().required(),
          quantity: Joi.number().integer().min(1).max(99).required()
        })
      )
      .min(1)
      .required()
  }),
  
  addToCart: Joi.object({
    productId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).max(99).required()
  }),
  
  updateCartItem: Joi.object({
    quantity: Joi.number().integer().min(0).max(99).required()
  }),
  
  updateOrderStatus: Joi.object({
    status: Joi.string().valid('pending', 'payment', 'delivery', 'delivered').required()
  })
}
