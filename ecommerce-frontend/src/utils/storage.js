// Secure storage utility
// sessionStorage: Cleared when browser closes (more secure for auth tokens)
// localStorage: Persists (only for non-sensitive data like cart)

// Clean up old localStorage auth data on app load
const cleanupOldData = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('userRole')
  localStorage.removeItem('users')
}

cleanupOldData()

export const secureStorage = {
  // Auth data - user info only (token is in HttpOnly cookie)
  setUser: (user) => sessionStorage.setItem('user', JSON.stringify(user)),
  getUser: () => {
    const user = sessionStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },
  setUserRole: (role) => sessionStorage.setItem('userRole', role),
  getUserRole: () => sessionStorage.getItem('userRole'),
  
  // Cart data - stored in localStorage (non-sensitive)
  setCart: (cart) => localStorage.setItem('cart', JSON.stringify(cart)),
  getCart: () => {
    const cart = localStorage.getItem('cart')
    return cart ? JSON.parse(cart) : []
  },
  
  // Orders data - stored in localStorage (non-sensitive)
  setOrders: (orders) => localStorage.setItem('orders', JSON.stringify(orders)),
  getOrders: () => {
    const orders = localStorage.getItem('orders')
    return orders ? JSON.parse(orders) : []
  },
  
  // Clear all auth data on logout
  clearAuth: () => {
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('userRole')
  },
  
  // Clear everything
  clearAll: () => {
    sessionStorage.clear()
    localStorage.clear()
  }
}
