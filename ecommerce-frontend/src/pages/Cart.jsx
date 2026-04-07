import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL

export default function Cart() {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_URL}/cart/my-cart`)
      setCart(response.data.data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }

    try {
      setUpdating(true)
      const response = await axios.put(
        `${API_URL}/cart/update-item/${productId}`,
        { quantity: newQuantity }
      )
      setCart(response.data.data || [])
    } catch (error) {
      console.error('Error updating cart:', error)
    } finally {
      setUpdating(false)
    }
  }

  const removeItem = async (productId) => {
    try {
      setUpdating(true)
      const response = await axios.delete(
        `${API_URL}/cart/remove-item/${productId}`
      )
      setCart(response.data.data || [])
    } catch (error) {
      console.error('Error removing from cart:', error)
    } finally {
      setUpdating(false)
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const savings = cart.reduce((sum, item) => sum + (item.price * 0.1 * item.quantity), 0) // Mock 10% savings

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4" style={{ borderColor: '#111111' }}></div>
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#F5F5F5' }}>
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#111111' }}>
              <span className="text-white text-2xl">0</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#111111' }}>Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8 text-lg">Looks like you haven't added anything to your cart yet. Start shopping to fill it up!</p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white px-8 py-4 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg transform hover:scale-105"
            style={{ backgroundColor: '#111111' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#111111' }}>Shopping Cart</h1>
          <p className="text-gray-600">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map(item => (
              <div 
                key={item.productId} 
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border"
                style={{ borderColor: '#E5E5E5' }}
              >
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Product Image */}
                  <Link 
                    to={`/product/${item.productId}`}
                    className="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden group"
                  >
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <Link 
                        to={`/product/${item.productId}`}
                        className="font-bold text-xl mb-2 hover:opacity-70 transition block"
                        style={{ color: '#111111' }}
                      >
                        {item.name}
                      </Link>
                      <p className="text-2xl font-bold mb-4" style={{ color: '#111111' }}>
                        ${item.price}
                        <span className="text-sm font-normal text-gray-500 ml-2">each</span>
                      </p>
                    </div>

                    {/* Quantity Controls & Remove */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-600">Quantity:</span>
                        <div className="flex items-center border-2 rounded-lg overflow-hidden" style={{ borderColor: '#E5E5E5' }}>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={updating}
                            className="px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50 font-bold"
                            style={{ color: '#111111' }}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            disabled={updating}
                            className="w-16 text-center py-2 border-x-2 focus:outline-none font-semibold disabled:opacity-50"
                            style={{ borderColor: '#E5E5E5', color: '#111111' }}
                          />
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={updating}
                            className="px-4 py-2 hover:bg-gray-50 transition disabled:opacity-50 font-bold"
                            style={{ color: '#111111' }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Subtotal</p>
                          <p className="text-2xl font-bold" style={{ color: '#111111' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={updating}
                          className="text-red-600 hover:text-red-800 transition disabled:opacity-50 p-2 hover:bg-red-50 rounded-lg"
                          title="Remove item"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white p-8 rounded-xl shadow-sm border" style={{ borderColor: '#E5E5E5' }}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#111111' }}>Order Summary</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b" style={{ borderColor: '#E5E5E5' }}>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                  <span className="font-semibold" style={{ color: '#111111' }}>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-600">Estimated Tax</span>
                  <span className="font-semibold" style={{ color: '#111111' }}>$0.00</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-6 pb-6 border-b" style={{ borderColor: '#E5E5E5' }}>
                <span className="text-2xl font-bold" style={{ color: '#111111' }}>Total</span>
                <div className="text-right">
                  <span className="text-3xl font-bold" style={{ color: '#111111' }}>${total.toFixed(2)}</span>
                  <p className="text-sm text-green-600 font-medium mt-1">You save ${savings.toFixed(2)}</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 mb-4"
                style={{ backgroundColor: '#111111' }}
              >
                Proceed to Checkout
              </button>

              <Link 
                to="/" 
                className="block text-center text-gray-600 hover:text-gray-900 transition font-medium"
              >
                ← Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 pt-8 border-t space-y-3" style={{ borderColor: '#E5E5E5' }}>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
