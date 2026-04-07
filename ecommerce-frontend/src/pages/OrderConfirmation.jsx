import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

const API_URL = import.meta.env.VITE_API_URL

export default function OrderConfirmation() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = secureStorage.getToken()
        const response = await axios.get(
          `${API_URL}/orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setOrder(response.data.data)
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-600 mx-auto"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-8">
        <div className="text-5xl mb-4">✓</div>
        <h1 className="text-3xl font-bold text-green-600 mb-4">Order Confirmed!</h1>
        <p className="text-gray-600 mb-2">Thank you for your purchase.</p>
        <p className="text-gray-600 mb-6">Order ID: <span className="font-mono font-bold">{order._id || orderId}</span></p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Order Details</h2>
        <div className="space-y-4">
          <div className="flex justify-between pb-4 border-b">
            <span className="font-medium">Order Date:</span>
            <span>{new Date(order.created_at || order.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between pb-4 border-b">
            <span className="font-medium">Total Amount:</span>
            <span className="text-lg font-bold">${order.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pb-4 border-b">
            <span className="font-medium">Status:</span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
              {order.status}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Items Ordered</h2>
        <div className="space-y-3">
          {order.items && order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between pb-3 border-b last:border-b-0">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
        <div className="text-gray-600 space-y-1">
          <p>{order.shipping_address || order.shippingAddress}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Link to="/profile" className="block w-full text-white py-3 rounded-lg font-bold hover:opacity-80 text-center transition" style={{ backgroundColor: '#111111' }}>
          View Order Status
        </Link>
        <Link to="/" className="block w-full text-blue-600 hover:underline text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  )
}
