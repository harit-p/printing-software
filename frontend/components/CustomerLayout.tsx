'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { clearAuth, isAuthenticated, getAuthRole, getAuthToken, switchSession } from '@/lib/auth'
import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { FiShoppingCart, FiPackage, FiUser, FiHelpCircle, FiLogOut, FiList, FiDollarSign, FiFileText, FiLogIn, FiUserPlus } from 'react-icons/fi'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [cartCount, setCartCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check auth status on mount and when pathname changes
    const checkAuth = () => {
      // Check if customer token exists (even if current session is different)
      const customerToken = Cookies.get('token_customer')
      const currentToken = Cookies.get('token')
      const currentRole = Cookies.get('role')
      
      // If we have customer token but current session is not customer, switch it
      if (customerToken && currentRole !== 'customer') {
        Cookies.set('token', customerToken, { expires: 7, path: '/' })
        Cookies.set('role', 'customer', { expires: 7, path: '/' })
      }
      
      setIsLoggedIn(!!customerToken || !!(currentToken && currentRole === 'customer'))
    }
    checkAuth()
    
    // Listen for storage/cookie changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth()
    }
    
    // Check periodically for cookie changes
    const interval = setInterval(checkAuth, 1000)
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [pathname])

  useEffect(() => {
    // Fetch cart count only if logged in
    const fetchCartCount = async () => {
      if (!isLoggedIn) return
      try {
        const token = getAuthToken()
        if (token) {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (response.ok) {
            const data = await response.json()
            setCartCount(data.items?.length || 0)
          }
        }
      } catch (error) {
        console.error('Error fetching cart count:', error)
      }
    }
    fetchCartCount()
  }, [isLoggedIn])

  const handleLogout = () => {
    clearAuth()
    setIsLoggedIn(false)
    router.push('/customer/home')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/customer/home" className="text-3xl font-extrabold text-gradient hover:scale-105 transition-transform duration-200 cursor-pointer">
              PrintShop
            </Link>
            <nav className="hidden md:flex space-x-4 items-center">
              {/* Public menu items - always visible */}
              <Link
                href="/customer/products"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/customer/products'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`}
              >
                <FiPackage className="w-4 h-4" />
                <span>Products</span>
              </Link>
              <Link
                href="/customer/categories"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/customer/categories'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`}
              >
                <FiList className="w-4 h-4" />
                <span>Categories</span>
              </Link>
              <Link
                href="/customer/price-list"
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === '/customer/price-list'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                }`}
              >
                <FiList className="w-4 h-4" />
                <span>Price List</span>
              </Link>

              {/* Authenticated menu items - only show when logged in */}
              {isLoggedIn ? (
                <>
                  <Link
                    href="/customer/cart"
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === '/customer/cart'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Cart</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    href="/customer/orders"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === '/customer/orders'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <FiFileText className="w-4 h-4" />
                    <span>My Orders</span>
                  </Link>
                  <Link
                    href="/customer/wallet"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === '/customer/wallet'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <FiDollarSign className="w-4 h-4" />
                    <span>Add Money</span>
                  </Link>
                  <Link
                    href="/customer/complaints"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === '/customer/complaints'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <FiHelpCircle className="w-4 h-4" />
                    <span>Complaints</span>
                  </Link>
                  <Link
                    href="/customer/profile"
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === '/customer/profile'
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:scale-105 transition-all duration-200"
                  >
                    <FiLogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/customer/login"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  >
                    <FiLogIn className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                  <Link
                    href="/customer/register"
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <FiUserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </nav>
            {/* Mobile menu button */}
            <button className="md:hidden text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  )
}

