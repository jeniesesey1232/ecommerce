import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { secureStorage } from '../utils/storage'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  const checkAuthStatus = () => {
    const token = secureStorage.getToken()
    const user = secureStorage.getUser()
    setIsLoggedIn(!!token)
    setIsAdmin(user?.role === 'admin')
  }

  const updateCartCount = () => {
    const cart = secureStorage.getCart()
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0))
  }

  useEffect(() => {
    checkAuthStatus()
    updateCartCount()

    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkAuthStatus)
    
    // Check auth status periodically
    const interval = setInterval(checkAuthStatus, 1000)

    return () => {
      window.removeEventListener('storage', checkAuthStatus)
      clearInterval(interval)
    }
  }, [])

  const handleLogout = () => {
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
          <div className="md:hidden py-4 border-t" style={{ borderColor: '#E5E5E5' }}>
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-white hover:opacity-80 font-medium transition">Home</Link>
              
              {isLoggedIn && !isAdmin && (
                <>
                  <Link to="/cart" className="text-white hover:opacity-80 font-medium transition flex items-center space-x-2">
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="text-white text-xs font-bold px-2 py-1 rounded-full" style={{ backgroundColor: '#111111' }}>{cartCount}</span>
                    )}
                  </Link>
                  <Link to="/profile" className="text-white hover:opacity-80 font-medium transition flex items-center space-x-2">
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
                    className="text-white px-6 py-2 rounded-lg hover:opacity-80 transition font-medium text-left"
                    style={{ backgroundColor: '#333333' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-white hover:opacity-80 font-medium transition">Login</Link>
                  <Link to="/signup" className="text-white px-6 py-2 rounded-lg hover:shadow-lg transition font-medium text-center" style={{ backgroundColor: '#111111' }}>
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
