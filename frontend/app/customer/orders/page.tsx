'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { orderAPI } from '@/lib/api'
import Link from 'next/link'
import { format } from 'date-fns'

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll()
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_production: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">Loading orders...</div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
            <Link href="/customer/products" className="text-primary-600 hover:text-primary-700">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/customer/orders/${order.id}`}
                className="block bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Placed on {format(new Date(order.created_at), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-gray-600 text-sm">{order.items?.length || 0} items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">₹{order.total_amount}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

