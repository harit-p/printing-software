import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Pages that require authentication
const protectedCustomerPages = [
  '/customer/cart',
  '/customer/orders',
  '/customer/wallet',
  '/customer/complaints',
  '/customer/profile',
]

// Pages that require admin authentication
const protectedAdminPages = [
  '/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get current session tokens
  const token = request.cookies.get('token')?.value
  const role = request.cookies.get('role')?.value
  
  // Get role-specific tokens for fallback
  const customerToken = request.cookies.get('token_customer')?.value
  const adminToken = request.cookies.get('token_admin')?.value

  // Check if accessing protected customer page
  if (protectedCustomerPages.some(page => pathname.startsWith(page))) {
    // Allow if current session is customer OR customer token exists
    const hasCustomerAuth = (token && role === 'customer') || customerToken
    if (!hasCustomerAuth) {
      return NextResponse.redirect(new URL('/customer/login', request.url))
    }
    
    // If current session is not customer but customer token exists, update current session
    if (customerToken && role !== 'customer') {
      const response = NextResponse.next()
      response.cookies.set('token', customerToken, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: '/' })
      response.cookies.set('role', 'customer', { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: '/' })
      return response
    }
  }

  // Check if accessing admin pages
  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/register') {
    // Allow if current session is admin OR admin token exists
    const hasAdminAuth = (token && role === 'admin') || adminToken
    if (!hasAdminAuth) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    
    // If current session is not admin but admin token exists, update current session
    if (adminToken && role !== 'admin') {
      const response = NextResponse.next()
      response.cookies.set('token', adminToken, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: '/' })
      response.cookies.set('role', 'admin', { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), path: '/' })
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/admin/:path*',
  ],
}

