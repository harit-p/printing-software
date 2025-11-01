'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { cartAPI, orderAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<any>({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get()
      setCart(response.data)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) {
      await handleRemove(itemId)
      return
    }
    try {
      await cartAPI.update(itemId, { quantity })
      await fetchCart()
      toast.success('Cart updated')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update cart')
    }
  }

  const handleRemove = async (itemId: string) => {
    try {
      await cartAPI.remove(itemId)
      await fetchCart()
      toast.success('Item removed from cart')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove item')
    }
  }

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Cart is empty')
      return
    }

    setCheckingOut(true)
    try {
      const response = await orderAPI.create({
        payment_method: 'wallet',
        items: cart.items,
      })
      toast.success('Order placed successfully!')
      router.push(`/customer/orders/${response.data.order.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to place order')
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">Loading cart...</div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-gradient">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="card text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some products to get started</p>
            <Link href="/customer/products" className="btn-primary inline-flex items-center gap-2">
              Browse Products
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item: any, index: number) => (
                <div 
                  key={item.id} 
                  className="card p-6 hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex gap-6">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{item.product_name}</h3>
                      <p className="text-gray-600 mb-4">₹{item.price} each</p>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-10 h-10 rounded-lg bg-white border-2 border-gray-300 hover:bg-primary-50 hover:border-primary-500 transition-all font-bold text-gray-700 hover:text-primary-600"
                          >
                            −
                          </button>
                          <span className="w-16 text-center font-bold text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-10 h-10 rounded-lg bg-white border-2 border-gray-300 hover:bg-primary-50 hover:border-primary-500 transition-all font-bold text-gray-700 hover:text-primary-600"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-2xl font-extrabold text-gradient">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                        <button
                          onClick={() => handleRemove(item.id)}
                          className="ml-auto px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-all hover:scale-105"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card p-8 h-fit sticky top-24">
              <h2 className="text-2xl font-extrabold mb-6 text-gradient">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-bold">₹{parseFloat(cart.total).toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-extrabold text-gray-800">Total</span>
                    <span className="text-3xl font-extrabold text-gradient">₹{parseFloat(cart.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="btn-primary w-full text-lg py-4"
              >
                {checkingOut ? (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Order...
                  </>
                ) : (
                  'Proceed to Checkout'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

