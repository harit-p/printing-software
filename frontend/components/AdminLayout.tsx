'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { clearAuth } from '@/lib/auth'
import Cookies from 'js-cookie'
import {
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiList,
  FiLogOut,
  FiSettings,
  FiTrendingUp,
} from 'react-icons/fi'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Check if admin token exists (even if current session is different)
    const checkAuth = () => {
      const adminToken = Cookies.get('token_admin')
      const currentToken = Cookies.get('token')
      const currentRole = Cookies.get('role')
      
      // If we have admin token but current session is not admin, switch it
      if (adminToken && currentRole !== 'admin') {
        Cookies.set('token', adminToken, { expires: 7, path: '/' })
        Cookies.set('role', 'admin', { expires: 7, path: '/' })
      }
    }
    
    checkAuth()
    
    // Check periodically for cookie changes
    const interval = setInterval(checkAuth, 1000)
    
    return () => {
      clearInterval(interval)
    }
  }, [pathname])

  const handleLogout = () => {
    clearAuth()
    router.push('/admin/login')
  }

  const menuItems = [
    { href: '/admin/categories', label: 'Categories', icon: FiList },
    { href: '/admin/products', label: 'Products', icon: FiPackage },
    { href: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { href: '/admin/orders-progress', label: 'Orders Progress', icon: FiTrendingUp },
    { href: '/admin/transactions', label: 'Transactions', icon: FiDollarSign },
    { href: '/admin/customers', label: 'Customers', icon: FiUsers },
    { href: '/admin/complaints', label: 'Complaints', icon: FiList },
    { href: '/admin/pricing', label: 'Price Listing', icon: FiSettings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/admin/dashboard" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer">
              PrintShop Admin
            </Link>
            <nav className="hidden md:flex space-x-4">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <FiLogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

