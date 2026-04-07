import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL

// Input validation utilities
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const validateName = (name) => name.trim().length >= 2
const validateAddress = (address) => address.trim().length >= 5
const validateZip = (zip) => /^[0-9a-zA-Z\s\-]{3,}$/.test(zip)

export default function Checkout() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  })

  useEffect(() => {
    const token = secureStorage.getToken()
    const user = secureStorage.getUser()
    
    if (!token) {
      setIsLoggedIn(false)
    } else {
      setIsLoggedIn(true)
      // Pre-fill email if logged in
      if (user?.email) {
        setFormData(prev => ({ ...prev, email: user.email }))
      }
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!validateEmail(formData.email)) newErrors.email = 'Invalid email'
    if (!validateName(formData.name)) newErrors.name = 'Name must be at least 2 characters'
    if (!validateAddress(formData.address)) newErrors.address = 'Address must be at least 5 characters'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    if (!validateZip(formData.zip)) newErrors.zip = 'Invalid ZIP code'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const token = secureStorage.getToken()
      
      // Fetch cart from API
      const cartResponse = await axios.get(
        `${API_URL}/cart/my-cart`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const cart = cartResponse.data.data || []
      
      if (cart.length === 0) {
        setErrors({ submit: 'Cart is empty' })
        setLoading(false)
        return
      }

      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`

      // Create order on backend
      const response = await axios.post(
        `${API_URL}/orders/create`,
        { 
          shipping_address: shippingAddress,
          items: cart,
          total
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const order = response.data.data
      
      // Clear cart via API
      await axios.delete(
        `${API_URL}/cart/clear`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      navigate(`/order-confirmation/${order._id || order.id}`)
    } catch (error) {
      setErrors({ submit: error.response?.data?.error || 'Checkout failed. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = secureStorage.getToken()
        if (token) {
          const response = await axios.get(
            `${API_URL}/cart/my-cart`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          setCart(response.data.data || [])
        }
      } catch (error) {
        console.error('Error fetching cart:', error)
      }
    }
    fetchCart()
  }, [])

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  // Show login prompt if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <div className="bg-amber-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to complete your purchase</p>
          
          <div className="space-y-3">
            <Link 
              to="/login" 
              state={{ from: '/checkout' }}
              className="block w-full text-white py-3 rounded-lg font-semibold hover:shadow-lg transition text-center"
              style={{ backgroundColor: '#111111' }}
            >
              Login to Continue
            </Link>
            <Link 
              to="/signup" 
              state={{ from: '/checkout' }}
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Create Account
            </Link>
            <Link 
              to="/cart" 
              className="block text-emerald-600 hover:text-emerald-700 font-medium mt-4"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Checkout Form */}
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Shipping Information</h2>
              
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{errors.submit}</span>
                </div>
              )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-2">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition ${errors.name ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                />
                {errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Street Address</label>
                <input
                  type="text"
                  name="address"
                  placeholder="123 Main St, Apt 4B"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition ${errors.address ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                />
                {errors.address && <p className="text-red-500 text-sm mt-2">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition ${errors.city ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition ${errors.state ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                  />
                  {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">ZIP</label>
                  <input
                    type="text"
                    name="zip"
                    placeholder="10001"
                    value={formData.zip}
                    onChange={handleChange}
                    className={`w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 transition ${errors.zip ? 'border-red-500' : 'border-gray-200 focus:border-emerald-500'}`}
                  />
                  {errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip}</p>}
                </div>
              </div>
            </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              style={{ backgroundColor: '#111111' }}
            >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Processing...</span>
              </span>
            ) : 'Complete Purchase'}
          </button>
        </form>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-4">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Summary</h2>
          <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span className="font-semibold text-emerald-600">Free</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t border-gray-200 pt-4 text-gray-900">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
