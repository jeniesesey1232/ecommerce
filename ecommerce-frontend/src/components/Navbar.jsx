import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { secureStorage } from '../utils/storage'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`)
      const user = response.data.user
      secureStorage.setUser(user)
      secureStorage.setUserRole(user.role)
      setIsLoggedIn(true)
      setIsAdmin(user.role === 'admin')
    } catch (error) {
      setIsLoggedIn(false)
      setIsAdmin(false)
      secureStorage.clearAuth()
    }
  }

  const updateCartCount = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/cart/my-cart`)
      const cart = response.data.data || []
      const count = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (error) {
      console.error('Error fetching cart count:', error)
      setCartCount(0)
    }
  }

  useEffect(() => {
    checkAuthStatus()
    updateCartCount()

    // Check auth status and cart periodically
    const interval = setInterval(() => {
      checkAuthStatus()
      updateCartCount()
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`)
    } catch (error) {
      console.error('Logout error:', error)
    }
    secureStorage.clearAuth()
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <nav className="shadow-md sticky top-0 z-50 border-b" style={{ backgroundColor: '#111111', borderColor: '#333333' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#111111' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">ShopHub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:opacity-80 font-medium transition">Home</Link>
            
            {isLoggedIn && !isAdmin && (
              <>
                <Link to="/cart" className="text-white hover:opacity-80 font-medium transition flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#111111' }}>{cartCount}</span>
                  )}
                </Link>
                <Link to="/profile" className="text-white hover:opacity-80 font-medium transition flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Profile</span>
                </Link>
              </>
            )}
            
            {isLoggedIn ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="text-white hover:opacity-80 font-medium transition">
                    Admin Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="text-white px-6 py-2 rounded-lg hover:opacity-80 transition font-medium"
                  style={{ backgroundColor: '#333333' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:opacity-80 font-medium transition">Login</Link>
                <Link to="/signup" className="text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium" style={{ backgroundColor: '#111111' }}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:opacity-80"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-64 shadow-2xl transform transition-transform duration-300"
              style={{ backgroundColor: '#111111' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-xl font-bold text-white">Menu</span>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:opacity-80"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex flex-col space-y-4">
                  <Link 
                    to="/" 
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Home
                  </Link>
                  
                  {isLoggedIn && !isAdmin && (
                    <>
                      <Link 
                        to="/cart" 
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Cart
                        </div>
                        {cartCount > 0 && (
                          <span className="bg-white text-xs font-bold px-2 py-1 rounded-full" style={{ color: '#111111' }}>{cartCount}</span>
                        )}
                      </Link>
                      <Link 
                        to="/profile" 
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                    </>
                  )}
                  
                  {isLoggedIn ? (
                    <>
                      {isAdmin && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsOpen(false)}
                          className="text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition flex items-center gap-3"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Dashboard
                        </Link>
                      )}
                      <button 
                        onClick={() => { handleLogout(); setIsOpen(false); }} 
                        className="text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium text-left transition flex items-center gap-3 w-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        onClick={() => setIsOpen(false)}
                        className="text-white hover:bg-gray-800 px-4 py-3 rounded-lg font-medium transition flex items-center gap-3"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Login
                      </Link>
                      <Link 
                        to="/signup" 
                        onClick={() => setIsOpen(false)}
                        className="bg-white px-4 py-3 rounded-lg font-medium text-center transition hover:bg-gray-100 flex items-center justify-center gap-3"
                        style={{ color: '#111111' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
