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
      <div className="space-y-8 animate-slide-up">
        <h1 className="text-4xl font-bold text-gradient">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card card-hover p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold mt-2 text-gradient">{stats?.orders?.total_orders || 0}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiShoppingBag className="w-8 h-8 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="card card-hover p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Customers</p>
                <p className="text-3xl font-bold mt-2 text-gradient">{stats?.customers?.total_customers || 0}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiUsers className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card card-hover p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Products</p>
                <p className="text-3xl font-bold mt-2 text-gradient">{stats?.products?.total_products || 0}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiPackage className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card card-hover p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Complaints</p>
                <p className="text-3xl font-bold mt-2 text-gradient">{stats?.complaints?.pending_complaints || 0}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FiAlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-gradient">Order Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-3xl font-bold text-yellow-600">{stats?.orders?.pending_orders || 0}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-3xl font-bold text-purple-600">{stats?.orders?.in_production_orders || 0}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">In Production</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-shadow duration-200">
              <p className="text-3xl font-bold text-green-600">{stats?.orders?.completed_orders || 0}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Completed</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl hover:shadow-md transition-shadow duration-200 md:col-span-2">
              <p className="text-3xl font-bold text-primary-600">₹{stats?.orders?.total_revenue || 0}</p>
              <p className="text-sm text-gray-700 font-medium mt-1">Total Revenue</p>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-gradient">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No recent orders</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{order.order_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">₹{order.total_amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 font-medium">
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

