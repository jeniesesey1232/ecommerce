import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

// Debug logging
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
console.log('URI starts with mongodb:', process.env.MONGODB_URI?.startsWith('mongodb'))

// Connect to MongoDB with longer timeout
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

// Define schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now }
})

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema)
const Product = mongoose.model('Product', productSchema)

// Clear existing data
await User.deleteMany({})
await Product.deleteMany({})

// Create admin user
const hashedPassword = bcrypt.hashSync('admin123', 10)
await User.create({
  email: 'admin@shophub.com',
  password: hashedPassword,
  role: 'admin'
})

// Create sample products
const products = [
  { name: 'Wireless Headphones', description: 'High-quality wireless headphones with noise cancellation', price: 99.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', stock: 50 },
  { name: 'USB-C Cable', description: 'Durable USB-C charging cable', price: 12.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500', stock: 200 },
  { name: 'Cotton T-Shirt', description: 'Comfortable cotton t-shirt', price: 19.99, category: 'clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', stock: 100 },
  { name: 'JavaScript Book', description: 'Learn JavaScript from basics to advanced', price: 29.99, category: 'books', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500', stock: 30 },
  { name: 'Laptop Stand', description: 'Adjustable aluminum laptop stand', price: 49.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', stock: 40 },
  { name: 'Smart Watch', description: 'Fitness tracking smartwatch', price: 199.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', stock: 25 },
  { name: 'Backpack', description: 'Durable travel backpack', price: 59.99, category: 'clothing', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', stock: 60 },
  { name: 'Coffee Maker', description: 'Automatic coffee machine', price: 89.99, category: 'electronics', image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500', stock: 35 }
]

await Product.insertMany(products)

console.log('✅ Database initialized successfully!')
console.log('📦 8 products added')
console.log('👤 Admin user created: admin@shophub.com / admin123')

mongoose.connection.close()