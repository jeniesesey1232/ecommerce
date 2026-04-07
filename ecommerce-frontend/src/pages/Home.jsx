import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Home() {
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({ category: '', minPrice: 0, maxPrice: 10000, search: '' })
  const [loading, setLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    if (!hasInitialized) {
      fetchProducts()
      setHasInitialized(true)
    }
  }, [hasInitialized])

  useEffect(() => {
    if (hasInitialized) {
      fetchProducts()
    }
  }, [filters, hasInitialized])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.category) params.category = filters.category
      if (filters.search) params.search = filters.search
      if (filters.minPrice) params.minPrice = filters.minPrice
      if (filters.maxPrice !== 10000) params.maxPrice = filters.maxPrice

      const response = await axios.get(`${API_URL}/products`, { params })
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="text-white py-24" style={{ backgroundColor: '#111111' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-6xl font-bold mb-6 leading-tight" style={{ color: '#FFFFFF' }}>Find Everything You Need</h1>
            <p className="text-sm mb-4" style={{ color: '#E5E5E5' }}>Demo Live - Portfolio Information in Footer</p>
            <p className="text-xl mb-10" style={{ color: '#E5E5E5' }}>Quality products, competitive prices, and fast delivery - all in one place</p>
            <div className="relative max-w-2xl">
              <input
                type="text"
                placeholder="Search for products..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-6 py-5 pr-32 rounded-xl text-gray-800 text-lg shadow-2xl focus:outline-none focus:ring-4"
                style={{ borderColor: '#E5E5E5' }}
              />
              <button 
                onClick={() => fetchProducts()}
                className="absolute right-2 top-2 text-white px-8 py-3 rounded-lg hover:opacity-80 transition font-semibold" 
                style={{ backgroundColor: '#111111' }}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="border-b" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold" style={{ color: '#111111' }}>1000+</div>
              <div className="mt-1" style={{ color: '#333333' }}>Products</div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#111111' }}>50k+</div>
              <div className="mt-1" style={{ color: '#333333' }}>Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#111111' }}>24/7</div>
              <div className="mt-1" style={{ color: '#333333' }}>Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold" style={{ color: '#111111' }}>Free</div>
              <div className="mt-1" style={{ color: '#333333' }}>Shipping</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="p-8 rounded-xl shadow-sm mb-10 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: '#111111' }}>Browse Products</h2>
            <span style={{ color: '#333333' }}>{products.length} items found</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#111111' }}>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition"
                style={{ borderColor: '#E5E5E5', color: '#111111' }}
              >
                <option value="">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#111111' }}>Min Price ($)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition"
                style={{ borderColor: '#E5E5E5', color: '#111111' }}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#111111' }}>Max Price ($)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 transition"
                style={{ borderColor: '#E5E5E5', color: '#111111' }}
              />
            </div>
            <div className="flex items-end">
              <button 
                onClick={() => setFilters({ category: '', minPrice: 0, maxPrice: 10000, search: '' })}
                className="w-full py-3 rounded-lg hover:opacity-80 transition font-semibold"
                style={{ backgroundColor: '#F5F5F5', color: '#111111', borderColor: '#E5E5E5' }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Mobile List View */}
            <div className="md:hidden space-y-4">
              {products && products.length > 0 ? products.map((product) => (
                <Link key={product.id || product._id} to={`/product/${product.id || product._id}`} className="group">
                  <div className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border flex gap-4 p-4" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
                    <div className="relative w-24 h-24 flex-shrink-0 rounded overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#111111' }}>{product.category}</span>
                        <h3 className="font-bold text-sm group-hover:opacity-80 transition line-clamp-1" style={{ color: '#111111' }}>{product.name}</h3>
                        <p className="text-xs line-clamp-1" style={{ color: '#333333' }}>{product.description}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold" style={{ color: '#111111' }}>${product.price}</span>
                        <span className="text-white text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: '#111111' }}>
                          {product.stock} in stock
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-20">
                  <p style={{ color: '#333333' }}>No products available</p>
                </div>
              )}
            </div>

            {/* Desktop Grid View */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products && products.length > 0 ? products.map((product) => (
                <Link key={product.id || product._id} to={`/product/${product.id || product._id}`} className="group">
                  <div className="rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border h-full flex flex-col" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
                    <div className="relative h-72 overflow-hidden" style={{ backgroundColor: '#F5F5F5' }}>
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: '#111111' }}>
                        {product.stock} in stock
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#111111' }}>{product.category}</span>
                      </div>
                      <h3 className="font-bold text-xl mb-3 group-hover:opacity-80 transition line-clamp-1" style={{ color: '#111111' }}>{product.name}</h3>
                      <p className="text-sm mb-4 line-clamp-2 flex-1" style={{ color: '#333333' }}>{product.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: '#E5E5E5' }}>
                        <span className="text-3xl font-bold" style={{ color: '#111111' }}>${product.price}</span>
                        <button className="text-white px-4 py-2 rounded-lg hover:opacity-80 transition font-semibold text-sm" style={{ backgroundColor: '#111111' }}>
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full text-center py-20">
                  <p style={{ color: '#333333' }}>No products available</p>
                </div>
              )}
            </div>
          </>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-32 rounded-xl" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="text-7xl mb-6 text-gray-300 flex justify-center">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold mb-3" style={{ color: '#111111' }}>No products found</h3>
            <p className="text-lg mb-6" style={{ color: '#333333' }}>Try adjusting your search or filters</p>
            <button 
              onClick={() => setFilters({ category: '', minPrice: 0, maxPrice: 10000, search: '' })}
              className="text-white px-8 py-3 rounded-lg hover:opacity-80 transition font-semibold"
              style={{ backgroundColor: '#111111' }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
