import mongoose from 'mongoose'

// Connect to MongoDB
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      ssl: true,
      retryWrites: true,
      w: 'majority'
    })
    console.log('✅ MongoDB connected')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      message: 'Invalid email format'
    }
  },
  password: { 
    type: String, 
    required: true,
    minlength: [8, 'Password must be at least 8 characters']
  },
  role: { 
    type: String, 
    enum: {
      values: ['user', 'admin'],
      message: '{VALUE} is not a valid role'
    }, 
    default: 'user' 
  },
  created_at: { type: Date, default: Date.now }
})

// Product Schema
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  price: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0'],
    max: [999999, 'Price cannot exceed 999999']
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: {
      values: ['Electronics', 'Clothing', 'Home', 'Sports', 'Books'],
      message: '{VALUE} is not a valid category'
    }
  },
  image: { 
    type: String, 
    required: [true, 'Image URL is required'],
    validate: {
      validator: (v) => /^https?:\/\/.+/.test(v),
      message: 'Invalid image URL format'
    }
  },
  stock: { 
    type: Number, 
    required: [true, 'Stock is required'],
    default: 0,
    min: [0, 'Stock cannot be negative'],
    max: [9999, 'Stock cannot exceed 9999']
  },
  created_at: { type: Date, default: Date.now }
})

// Cart Schema
const cartSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required']
  },
  product_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Product ID is required']
  },
  quantity: { 
    type: Number, 
    required: [true, 'Quantity is required'],
    default: 1,
    min: [1, 'Quantity must be at least 1'],
    max: [99, 'Quantity cannot exceed 99']
  },
  created_at: { type: Date, default: Date.now }
})

// Order Schema
const orderSchema = new mongoose.Schema({
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required']
  },
  items: [{
    product_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product',
      required: [true, 'Product ID is required']
    },
    name: { 
      type: String, 
      required: [true, 'Product name is required']
    },
    price: { 
      type: Number, 
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than 0']
    },
    quantity: { 
      type: Number, 
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [99, 'Quantity cannot exceed 99']
    }
  }],
  total: { 
    type: Number, 
    required: [true, 'Total is required'],
    min: [0.01, 'Total must be greater than 0']
  },
  shipping_address: { 
    type: String, 
    required: [true, 'Shipping address is required'],
    trim: true,
    minlength: [10, 'Shipping address must be at least 10 characters'],
    maxlength: [500, 'Shipping address cannot exceed 500 characters']
  },
  status: { 
    type: String, 
    enum: {
      values: ['pending', 'payment', 'delivery', 'delivered'],
      message: '{VALUE} is not a valid status'
    }, 
    default: 'pending' 
  },
  created_at: { type: Date, default: Date.now }
})

export const User = mongoose.model('User', userSchema)
export const Product = mongoose.model('Product', productSchema)
export const Cart = mongoose.model('Cart', cartSchema)
export const Order = mongoose.model('Order', orderSchema)
