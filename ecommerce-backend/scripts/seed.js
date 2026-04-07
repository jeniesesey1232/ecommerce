import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  created_at: { type: Date, default: Date.now }
})

const Product = mongoose.model('Product', productSchema)

const products = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life',
    price: 99.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    stock: 50
  },
  {
    name: 'USB-C Cable',
    description: 'Durable USB-C charging cable with fast charging support',
    price: 12.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop',
    stock: 200
  },
  {
    name: 'Premium T-Shirt',
    description: 'Comfortable 100% cotton t-shirt available in multiple colors',
    price: 19.99,
    category: 'Clothing',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    stock: 100
  },
  {
    name: 'JavaScript Book',
    description: 'Learn JavaScript from basics to advanced concepts with practical examples',
    price: 29.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=500&fit=crop',
    stock: 30
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand for better ergonomics',
    price: 49.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop',
    stock: 40
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with customizable switches',
    price: 129.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1587829191301-4b5556b1047e?w=500&h=500&fit=crop',
    stock: 25
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision tracking',
    price: 34.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
    stock: 60
  },
  {
    name: 'Monitor Stand',
    description: 'Adjustable monitor stand with storage drawer',
    price: 59.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&h=500&fit=crop',
    stock: 35
  }
]

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    console.log('Clearing existing products...')
    await Product.deleteMany({})

    console.log('Seeding products...')
    await Product.insertMany(products)

    console.log('✅ Seeded 8 products successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Seed error:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seed()
