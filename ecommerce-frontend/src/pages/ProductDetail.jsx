import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [showNotification, setShowNotification] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = secureStorage.getToken()
    const user = secureStorage.getUser()
    setIsLoggedIn(!!token)
    setIsAdmin(user?.role === 'admin')
    
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/products/${id}`)
      setProduct(response.data.data || response.data)
    } catch (error) {
      console.error('Failed to fetch product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = secureStorage.getToken()
    if (!token) {
      // Redirect to login with return URL
      navigate('/login?redirect=/product/' + id)
      return
    }

    try {
      // Send to backend API
      const response = await axios.post(
        'http://localhost:5000/api/cart/add-item',
        {
          productId: product.id || product._id,
          quantity,
          price: product.price,
          name: product.name,
          image: product.image
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Update local cart for UI
      secureStorage.setCart(response.data.data || [])
      
      setShowNotification(true)
      setTimeout(() => {
        setShowNotification(false)
        navigate('/cart')
      }, 1500)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add item to cart')
    }
  }

  if (loading) {
    return (
      <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4" style={{ borderColor: '#111111' }}></div>
      </div>
    )
  }

  if (!product) return (
    <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }} className="flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#111111' }}>Product not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="text-white px-6 py-3 rounded-lg hover:opacity-80 transition font-semibold"
          style={{ backgroundColor: '#111111' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ backgroundColor: '#F5F5F5', minHeight: '100vh' }}>{/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-24 right-4 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in" style={{ backgroundColor: '#111111' }}>
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-white">Added to cart!</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 mb-8 font-medium transition hover:opacity-80"
          style={{ color: '#111111' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="rounded-xl shadow-sm overflow-hidden border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
            <div className="relative h-96 lg:h-[600px] w-full">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Gallery Thumbnails */}
            <div className="p-4 flex gap-2 overflow-x-auto" style={{ backgroundColor: '#F5F5F5' }}>
              <img src={product.image} alt="View 1" className="w-20 h-20 object-cover rounded border-2" style={{ borderColor: '#111111' }} />
              <img src={product.image} alt="View 2" className="w-20 h-20 object-cover rounded border" style={{ borderColor: '#E5E5E5' }} />
              <img src={product.image} alt="View 3" className="w-20 h-20 object-cover rounded border" style={{ borderColor: '#E5E5E5' }} />
              <img src={product.image} alt="View 4" className="w-20 h-20 object-cover rounded border" style={{ borderColor: '#E5E5E5' }} />
            </div>

            {/* Share and Favorite Section */}
            <div className="p-6 flex items-center justify-between" style={{ backgroundColor: '#FFFFFF', borderTopColor: '#E5E5E5', borderTopWidth: '1px' }}>
              <div className="flex items-center gap-4">
                <span style={{ color: '#111111' }} className="font-semibold">Share:</span>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition" style={{ backgroundColor: '#1f9cf0' }} title="Share on Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition" style={{ backgroundColor: '#4267B2' }} title="Share on Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:opacity-80 transition" style={{ backgroundColor: '#E1306C' }} title="Share on Pinterest">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" fill="white" />
                  </svg>
                </button>
              </div>
              <button className="flex items-center gap-2 hover:opacity-80 transition" style={{ color: '#111111' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="font-semibold">Favorite (349)</span>
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="rounded-xl shadow-sm p-8 flex-grow border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5E5' }}>
              <div className="mb-6">
                <span className="inline-block text-sm font-semibold px-4 py-1 rounded-full mb-4 uppercase tracking-wide" style={{ backgroundColor: '#111111', color: '#FFFFFF' }}>
                  {product.category}
                </span>
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#111111' }}>{product.name}</h1>
                <p className="text-lg leading-relaxed" style={{ color: '#333333' }}>{product.description}</p>
              </div>

              <div className="mb-8 pb-8" style={{ borderColor: '#E5E5E5', borderBottomWidth: '1px' }}>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-5xl font-bold" style={{ color: '#111111' }}>
                    ${product.price}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-4 py-2 rounded-full text-sm font-medium" style={{ 
                    backgroundColor: product.stock > 0 ? '#111111' : '#E5E5E5',
                    color: product.stock > 0 ? '#FFFFFF' : '#333333'
                  }}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {!isAdmin && isLoggedIn && (
                <>
                  <div className="mb-8">
                    <label className="block text-sm font-bold mb-3" style={{ color: '#111111' }}>Quantity</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-12 h-12 rounded-lg border-2 hover:opacity-80 transition font-bold"
                        style={{ borderColor: '#E5E5E5', color: '#111111' }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                        className="w-20 h-12 text-center rounded-lg font-bold text-lg focus:outline-none border-2"
                        style={{ borderColor: '#E5E5E5', color: '#111111' }}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="w-12 h-12 rounded-lg border-2 hover:opacity-80 transition font-bold"
                        style={{ borderColor: '#E5E5E5', color: '#111111' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full text-white py-4 rounded-xl font-bold text-lg hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: '#111111' }}
                  >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </>
              )}

              {!isLoggedIn && (
                <div className="rounded-xl p-6 text-center border-2" style={{ backgroundColor: '#F5F5F5', borderColor: '#E5E5E5' }}>
                  <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#111111' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <p className="font-semibold mb-4" style={{ color: '#111111' }}>Please login to add items to cart</p>
                  <button
                    onClick={() => navigate('/login?redirect=/product/' + id)}
                    className="text-white px-8 py-3 rounded-lg hover:opacity-80 transition font-semibold"
                    style={{ backgroundColor: '#111111' }}
                  >
                    Login to Continue
                  </button>
                </div>
              )}

              {isAdmin && (
                <div className="rounded-lg p-4 text-center border" style={{ backgroundColor: '#F5F5F5', borderColor: '#E5E5E5', color: '#111111' }}>
                  <p className="font-medium">Admin users cannot add items to cart</p>
                </div>
              )}

              <div className="mt-8 pt-8" style={{ borderColor: '#E5E5E5', borderTopWidth: '1px' }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: '#111111' }}>Product Details</h3>
                <ul className="space-y-3" style={{ color: '#111111' }}>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#111111' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Category: <strong>{product.category}</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#111111' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Product ID: <strong>{product.id}</strong></span>
                  </li>
                  <li className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#111111' }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Free shipping on orders over $50</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
