import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '', avatar: '' })
  const navigate = useNavigate()

  useEffect(() => {
    const token = secureStorage.getToken()
    if (!token) {
      navigate('/login')
      return
    }

    const userData = secureStorage.getUser()
    
    if (userData?.role === 'admin') {
      navigate('/admin')
      return
    }
    
    setUser(userData)
    fetchOrders(token)
  }, [navigate])

  const handleEditProfile = () => {
    const nameFromEmail = user?.email?.split('@')[0] || 'User'
    setEditForm({ 
      name: user?.name || nameFromEmail, 
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    })
    setIsEditingProfile(true)
  }

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editForm }
    secureStorage.setUser(updatedUser)
    setUser(updatedUser)
    setIsEditingProfile(false)
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditForm({ ...editForm, avatar: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const fetchOrders = async (token) => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(response.data.data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusSteps = (status) => {
    const steps = [
      { 
        name: 'Payment', 
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        ),
        completed: ['payment', 'pending', 'delivery', 'delivered'].includes(status) 
      },
      { 
        name: 'Processing', 
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        ),
        completed: ['pending', 'delivery', 'delivered'].includes(status) 
      },
      { 
        name: 'Shipping', 
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/><path d="M20 8h-3V4c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14h2a3 3 0 003 3 3 3 0 003-3h6a3 3 0 003 3 3 3 0 003-3h2v-5l-3-4z" />
          </svg>
        ),
        completed: ['delivery', 'delivered'].includes(status) 
      },
      { 
        name: 'Delivered', 
        icon: (
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
          </svg>
        ),
        completed: status === 'delivered' 
      }
    ]
    return steps
  }

  const getTabLabel = (status) => {
    switch(status) {
      case 'payment': return 'To Pay'
      case 'pending': return 'To Ship'
      case 'delivery': return 'To Receive'
      case 'delivered': return 'Completed'
      default: return 'All'
    }
  }

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab)

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
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-10">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center shadow-lg border-4 border-gray-200">
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div className="mb-4">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user?.name || user?.email?.split('@')[0] || 'User'}</h1>
                {/* Edit Button */}
                <button
                  onClick={handleEditProfile}
                  className="px-3 py-1 rounded-lg hover:opacity-80 transition font-semibold flex items-center space-x-1 text-xs h-8"
                  style={{ backgroundColor: '#111111', color: '#FFFFFF' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span style={{ color: '#FFFFFF' }}>Edit</span>
                </button>
              </div>
              <p className="text-gray-600 mb-1">{user?.email}</p>
              {user?.phone && <p className="text-gray-600">{user?.phone}</p>}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
              
              <div className="space-y-4 mb-6">
                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Picture</label>
                  <div className="flex items-center space-x-4">
                    {editForm.avatar ? (
                      <img 
                        src={editForm.avatar} 
                        alt="Preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center border-2 border-gray-200">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-80 transition font-semibold"
                  style={{ backgroundColor: '#111111' }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Purchases Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Purchases</h2>

        {/* Tabs */}
        <div className="bg-white rounded-t-xl border-b border-gray-200 flex overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'payment', label: 'To Pay' },
            { id: 'pending', label: 'To Ship' },
            { id: 'delivery', label: 'To Receive' },
            { id: 'delivered', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-semibold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-emerald-600 border-emerald-600'
                  : 'text-gray-600 border-transparent hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 p-16 text-center">
            <div className="text-6xl mb-4 text-gray-300 flex justify-center">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">You don't have any {activeTab !== 'all' ? getTabLabel(activeTab).toLowerCase() : 'orders'}</p>
            <a href="/" className="inline-block text-white px-8 py-3 rounded-lg hover:opacity-80 transition font-semibold" style={{ backgroundColor: '#111111' }}>
              Browse Products
            </a>
          </div>
        ) : (
          <div className="space-y-6 bg-white rounded-b-xl shadow-sm border border-gray-200 border-t-0 p-6">
            {filteredOrders.map(order => (
              <div key={order._id || order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Order #{order._id || order.id}</h3>
                    <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-600">{order.items?.length || 0} item(s)</p>
                  </div>
                </div>

                {/* Status Timeline - Shopee Style */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center justify-between relative">
                    {getStatusSteps(order.status).map((step, idx) => {
                      const steps = getStatusSteps(order.status)
                      const isLast = idx === steps.length - 1
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 relative">
                          {/* Connector Line */}
                          {!isLast && (
                            <div className={`absolute top-8 left-1/2 w-full h-1 ${
                              step.completed ? 'bg-emerald-500' : 'bg-gray-300'
                            }`} style={{ width: 'calc(100% - 2rem)' }}></div>
                          )}
                          
                          {/* Step Circle */}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mb-3 transition-all relative z-10 ${
                            step.completed 
                              ? 'bg-emerald-100 border-4 border-emerald-500 shadow-lg text-emerald-600' 
                              : 'bg-gray-100 border-4 border-gray-300 text-gray-400'
                          }`}>
                            {step.icon}
                          </div>
                          
                          {/* Step Name */}
                          <p className={`text-sm font-semibold text-center ${
                            step.completed ? 'text-emerald-600' : 'text-gray-500'
                          }`}>
                            {step.name}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-4">Items</h4>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}
