import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = secureStorage.getToken()
    if (!token) {
      navigate('/login')
      return
    }

    const userData = secureStorage.getUser()
    
    // Redirect admin users to admin dashboard
    if (userData?.role === 'admin') {
      navigate('/admin')
      return
    }
    
    // Redirect regular users to profile page
    navigate('/profile')
  }, [navigate])

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/my-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'payment': return 'bg-blue-100 text-blue-800'
      case 'delivery': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'payment': return '💳'
      case 'delivery': return '🚚'
      case 'delivered': return '✅'
      default: return '📦'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not logged in</h2>
          <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">Go to Login</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-semibold">Email</h3>
            </div>
            <p className="text-xl font-bold text-gray-900 break-all">{user.email}</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-semibold">Total Orders</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-gray-600 text-sm font-semibold">Total Spent</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <a href="/" className="inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition font-semibold">
                Browse Products
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Order ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Items</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id} className="hover:bg-emerald-50 transition-colors duration-200">
                      <td className="px-6 py-4 font-bold text-gray-900">#{order.id}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-600">{order.items?.length || 0} item(s)</td>
                      <td className="px-6 py-4 font-bold text-gray-900">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getStatusIcon(order.status)}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
