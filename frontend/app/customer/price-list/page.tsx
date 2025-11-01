'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { pricingAPI } from '@/lib/api'

export default function PriceListPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPriceList()
  }, [])

  const fetchPriceList = async () => {
    try {
      const response = await pricingAPI.getAll()
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching price list:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Price List</h1>

        {loading ? (
          <div className="text-center py-12">Loading price list...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      {product.description && (
                        <div className="text-sm text-gray-500">{product.description.substring(0, 100)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                      ₹{product.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

