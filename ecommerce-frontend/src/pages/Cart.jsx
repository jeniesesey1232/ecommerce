import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

export default function Cart() {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const token = secureStorage.getToken()
      if (!token) {
        navigate('/login')
        return
      }

      const response = await axios.get('http://localhost:5000/api/cart/my-cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCart(response.data.data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
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
      const token = secureStorage.getToken()
      const response = await axios.put(
        `http://localhost:5000/api/cart/update-item/${productId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCart(response.data.data || [])
    } catch (error) {
      console.error('Error updating cart:', error)
    }
  }

  const removeItem = async (productId) => {
    try {
      const token = secureStorage.getToken()
      const response = await axios.delete(
        `http://localhost:5000/api/cart/remove-item/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCart(response.data.data || [])
    } catch (error) {
      console.error('Error removing from cart:', error)
    }
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading cart...</p>
      </div>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <Link to="/" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map(item => (
            <div key={item.productId} className="bg-white p-4 rounded-lg shadow mb-4 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
              </div>
              <div className="flex-grow">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <p className="text-gray-600">${item.price}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                  className="border rounded px-2 py-1 w-16"
                />
                <span className="font-bold w-24 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-100 p-6 rounded-lg h-fit lg:sticky lg:top-4">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full text-white py-3 rounded-lg font-bold hover:opacity-80 transition"
            style={{ backgroundColor: '#111111' }}
          >
            Proceed to Checkout
          </button>
          <Link to="/" className="block text-center text-blue-600 hover:underline mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
