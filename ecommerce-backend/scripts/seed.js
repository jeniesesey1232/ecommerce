import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

const products = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 99.99,
    category: 'electronics',
    stock: 50
  },
  {
    name: 'USB-C Cable',
    description: 'Durable USB-C charging cable',
    price: 12.99,
    category: 'electronics',
    stock: 200
  },
  {
    name: 'T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 19.99,
    category: 'clothing',
    stock: 100
  },
  {
    name: 'JavaScript Book',
    description: 'Learn JavaScript from basics to advanced',
    price: 29.99,
    category: 'books',
    stock: 30
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable aluminum laptop stand',
    price: 49.99,
    category: 'electronics',
    stock: 40
  }
]

async function seed() {
  try {
    console.log('Clearing existing products...')
    await prisma.product.deleteMany({})

    console.log('Seeding products...')
    await prisma.product.createMany({ data: products })

    console.log('Seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
