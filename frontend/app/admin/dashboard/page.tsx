'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { adminAPI } from '@/lib/api'
import { FiShoppingBag, FiUsers, FiPackage, FiAlertCircle, FiTrendingUp } from 'react-icons/fi'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await adminAPI.getDashboard()
      setDashboard(response.data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">Loading dashboard...</div>
      </AdminLayout>
    )
  }

  const stats = dashboard?.stats
  const recentOrders = dashboard?.recent_orders || []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-2xl font-bold mt-1">{stats?.orders?.total_orders || 0}</p>
              </div>
              <FiShoppingBag className="w-12 h-12 text-primary-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Customers</p>
                <p className="text-2xl font-bold mt-1">{stats?.customers?.total_customers || 0}</p>
              </div>
              <FiUsers className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Products</p>
                <p className="text-2xl font-bold mt-1">{stats?.products?.total_products || 0}</p>
              </div>
              <FiPackage className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Complaints</p>
                <p className="text-2xl font-bold mt-1">{stats?.complaints?.pending_complaints || 0}</p>
              </div>
              <FiAlertCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats?.orders?.pending_orders || 0}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats?.orders?.in_production_orders || 0}</p>
              <p className="text-sm text-gray-600">In Production</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats?.orders?.completed_orders || 0}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center col-span-2">
              <p className="text-2xl font-bold text-primary-600">₹{stats?.orders?.total_revenue || 0}</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recent orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.order_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">₹{order.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

