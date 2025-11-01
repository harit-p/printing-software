'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { orderAPI } from '@/lib/api'
import { FiTrendingUp } from 'react-icons/fi'

export default function OrdersProgressPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll()
      const inProgressOrders = (response.data.orders || []).filter(
        (o: any) => o.status === 'confirmed' || o.status === 'in_production'
      )
      setOrders(inProgressOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProgressPercentage = (status: string) => {
    const progress: any = {
      pending: 0,
      confirmed: 25,
      in_production: 75,
      completed: 100,
      cancelled: 0,
    }
    return progress[status] || 0
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <FiTrendingUp className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold">Orders Progress</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No orders in progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                    <p className="text-gray-600 text-sm">Customer: {order.customer_name}</p>
                    <p className="text-gray-600 text-sm">Items: {order.items?.length || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">₹{order.total_amount}</p>
                    <p className="text-sm text-gray-500">{order.status.replace('_', ' ').toUpperCase()}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-primary-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Pending</span>
                  <span>Confirmed</span>
                  <span>In Production</span>
                  <span>Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

