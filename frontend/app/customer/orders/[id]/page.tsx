'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { orderAPI } from '@/lib/api'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

export function generateStaticParams() {
  return []
}

export default function OrderDetailsPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchOrder()
    }
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getById(params.id as string)
      setOrder(response.data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
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
        <div className="text-center py-12">Loading order details...</div>
      </CustomerLayout>
    )
  }

  if (!order) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">Order not found</div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-2">Order Information</h3>
              <p className="text-gray-600">Order Number: {order.order_number}</p>
              <p className="text-gray-600">Placed on: {format(new Date(order.created_at), 'MMM dd, yyyy hh:mm a')}</p>
              <p className="text-gray-600">Payment Status: {order.payment_status}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <p className="text-gray-600">Name: {order.customer_name}</p>
              <p className="text-gray-600">Email: {order.customer_email}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity} × ₹{item.price}</p>
                  </div>
                  <p className="font-semibold">₹{item.total}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-xl font-bold">Total</span>
              <span className="text-xl font-bold text-primary-600">₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}

