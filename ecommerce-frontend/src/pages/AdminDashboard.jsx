import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0 })
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('products')
  const [editingStock, setEditingStock] = useState({})
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    image: '',
    stock: ''
  })
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'delete' })
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '' })

  useEffect(() => {
    const token = secureStorage.getToken()
    const userRole = secureStorage.getUserRole()
    
    if (!token || userRole !== 'admin') {
      navigate('/login')
      return
    }

    fetchData()
  }, [navigate])

  const fetchData = async () => {
    try {
      const token = secureStorage.getToken()
      const config = { headers: { Authorization: `Bearer ${token}` } }

      const [statsRes, productsRes, ordersRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/admin/orders', config)
      ])

      setStats(statsRes.data.data || statsRes.data)
      setProducts(productsRes.data.data || productsRes.data)
      setOrders(ordersRes.data.data || ordersRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        secureStorage.clearAuth()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleStockUpdate = async (productId) => {
    try {
      const token = secureStorage.getToken()
      const newStock = editingStock[productId]
      
      const product = products.find(p => p.id === productId)
      await axios.put(
        `http://localhost:5000/api/admin/products/${productId}`,
        { ...product, stock: parseInt(newStock) },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setProducts(products.map(p => 
        p.id === productId ? { ...p, stock: parseInt(newStock) } : p
      ))
      setEditingStock({ ...editingStock, [productId]: undefined })
    } catch (error) {
      console.error('Error updating stock:', error)
      setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to update stock' })
    }
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    try {
      const token = secureStorage.getToken()
      await axios.post(
        'http://localhost:5000/api/admin/products',
        newProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setShowAddProduct(false)
      setNewProduct({ name: '', description: '', price: '', category: 'Electronics', image: '', stock: '' })
      fetchData()
    } catch (error) {
      console.error('Error adding product:', error)
      setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to add product' })
    }
  }

  const handleEditProduct = async (e) => {
    e.preventDefault()
    try {
      const token = secureStorage.getToken()
      await axios.put(
        `http://localhost:5000/api/admin/products/${editingProduct.id}`,
        editingProduct,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      setEditingProduct(null)
      fetchData()
    } catch (error) {
      console.error('Error updating product:', error)
      setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to update product' })
    }
  }

  const handleDeleteProduct = async (productId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      type: 'delete',
      onConfirm: async () => {
        try {
          const token = secureStorage.getToken()
          await axios.delete(
            `http://localhost:5000/api/admin/products/${productId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
          setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, type: 'delete' })
          fetchData()
        } catch (error) {
          console.error('Error deleting product:', error)
          setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to delete product' })
        }
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#111111' }}>Admin Dashboard</h1>
          <p style={{ color: '#333333' }}>Manage your products, orders, and inventory</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-emerald-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Products</div>
            <div className="text-4xl font-bold text-gray-900">{stats.totalProducts}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Orders</div>
            <div className="text-4xl font-bold text-gray-900">{stats.totalOrders}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600 mb-1">Total Revenue</div>
            <div className="text-4xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl mb-6 border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-8 py-4 font-semibold transition-all duration-300 ${
                  activeTab === 'products'
                    ? 'border-b-3 border-emerald-500 text-emerald-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Products
                </div>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-8 py-4 font-semibold transition-all duration-300 ${
                  activeTab === 'orders'
                    ? 'border-b-3 border-emerald-500 text-emerald-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Orders
                </div>
              </button>
            </nav>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
                <button
                  onClick={() => {
                    setShowAddProduct(!showAddProduct)
                    setEditingProduct(null)
                  }}
                  className="text-white px-6 py-3 rounded-xl hover:opacity-80 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold flex items-center gap-2"
                  style={{ backgroundColor: '#111111' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAddProduct ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
                  </svg>
                  {showAddProduct ? 'Cancel' : 'Add Product'}
                </button>
              </div>

              {/* Add Product Modal */}
              {showAddProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in modal-backdrop" onClick={() => setShowAddProduct(false)}>
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 p-6 rounded-t-2xl" style={{ backgroundColor: '#111111' }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          Add New Product
                        </h3>
                        <button onClick={() => setShowAddProduct(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <form onSubmit={handleAddProduct} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Product Name</label>
                          <input type="text" placeholder="Enter product name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Price ($)</label>
                          <input type="number" step="0.01" placeholder="0.00" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                          <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Home</option>
                            <option>Sports</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Stock Quantity</label>
                          <input type="number" placeholder="0" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                          <input type="url" placeholder="https://example.com/image.jpg" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                          <textarea placeholder="Enter product description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" rows="4" required />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="submit" className="flex-1 text-white px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold" style={{ backgroundColor: '#111111' }}>Add Product</button>
                        <button type="button" onClick={() => setShowAddProduct(false)} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}


              {/* Edit Product Modal */}
              {editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in modal-backdrop" onClick={() => setEditingProduct(null)}>
                  <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 p-6 rounded-t-2xl" style={{ backgroundColor: '#111111' }}>
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                          Edit Product
                        </h3>
                        <button onClick={() => setEditingProduct(null)} className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <form onSubmit={handleEditProduct} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Product Name</label>
                          <input type="text" placeholder="Enter product name" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Price ($)</label>
                          <input type="number" step="0.01" placeholder="0.00" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Category</label>
                          <select value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            <option>Electronics</option>
                            <option>Clothing</option>
                            <option>Home</option>
                            <option>Sports</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Stock Quantity</label>
                          <input type="number" placeholder="0" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Image URL</label>
                          <input type="url" placeholder="https://example.com/image.jpg" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" required />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Description</label>
                          <textarea placeholder="Enter product description" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" rows="4" required />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button type="submit" className="flex-1 text-white px-8 py-3 rounded-xl hover:opacity-80 transition-all duration-300 transform hover:-translate-y-0.5 font-semibold" style={{ backgroundColor: '#111111' }}>Update Product</button>
                        <button type="button" onClick={() => setEditingProduct(null)} className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-300 font-semibold">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}


              {/* Products Table */}
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Price</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-emerald-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl mr-4 shadow-md" />
                            <span className="font-semibold text-gray-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">{product.category}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-bold text-lg">${product.price}</td>
                        <td className="px-6 py-4">
                          {editingStock[product.id] !== undefined ? (
                            <div className="flex items-center gap-2">
                              <input type="number" value={editingStock[product.id]} onChange={(e) => setEditingStock({ ...editingStock, [product.id]: e.target.value })} className="w-20 border rounded px-2 py-1" />
                              <button onClick={() => handleStockUpdate(product.id)} className="text-emerald-600 hover:text-emerald-700 text-sm">Save</button>
                              <button onClick={() => setEditingStock({ ...editingStock, [product.id]: undefined })} className="text-gray-600 hover:text-gray-700 text-sm">Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => setEditingStock({ ...editingStock, [product.id]: product.stock })} className="text-gray-900 hover:text-emerald-600">{product.stock}</button>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? 'bg-red-100 text-red-800' : product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {product.stock === 0 ? 'Out of Stock' : product.stock < 10 ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3">
                            <button onClick={() => { setEditingProduct(product); setShowAddProduct(false); }} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-sm font-semibold border border-blue-300 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button onClick={() => handleDeleteProduct(product.id)} className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 text-sm font-semibold border border-red-300 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Management</h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Order ID</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Customer</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Total</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {orders.map((order) => (
                      <tr key={order._id || order.id} className="hover:bg-emerald-50 transition-colors duration-200">
                        <td className="px-6 py-4 font-bold text-gray-900">#{order._id || order.id}</td>
                        <td className="px-6 py-4 text-gray-700">{order.email}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-gray-900 font-bold text-lg">${order.total.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <select 
                            value={order.status} 
                            onChange={async (e) => {
                              try {
                                const token = secureStorage.getToken()
                                await axios.put(
                                  `http://localhost:5000/api/orders/${order._id || order.id}/status`,
                                  { status: e.target.value },
                                  { headers: { Authorization: `Bearer ${token}` } }
                                )
                                fetchData()
                              } catch (error) {
                                console.error('Error updating status:', error)
                                setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to update status' })
                              }
                            }}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 cursor-pointer transition ${
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                              order.status === 'payment' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                              order.status === 'delivery' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                              'bg-green-100 text-green-800 border-green-300'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="payment">Payment</option>
                            <option value="delivery">Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#111111' }}>{confirmModal.title}</h3>
              <p className="mb-6" style={{ color: '#333333' }}>{confirmModal.message}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmModal.onConfirm()
                  }}
                  className="flex-1 text-white px-6 py-3 rounded-lg hover:opacity-80 transition font-semibold"
                  style={{ backgroundColor: '#111111' }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmModal({ isOpen: false, title: '', message: '', onConfirm: null, type: 'delete' })}
                  className="flex-1 px-6 py-3 rounded-lg hover:opacity-80 transition font-semibold"
                  style={{ backgroundColor: '#F5F5F5', color: '#111111' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        {alertModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#111111' }}>{alertModal.title}</h3>
              <p className="mb-6" style={{ color: '#333333' }}>{alertModal.message}</p>
              <button
                onClick={() => setAlertModal({ isOpen: false, title: '', message: '' })}
                className="w-full text-white px-6 py-3 rounded-lg hover:opacity-80 transition font-semibold"
                style={{ backgroundColor: '#111111' }}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
