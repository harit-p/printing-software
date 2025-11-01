'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { pricingAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminPricingPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [newPrice, setNewPrice] = useState('')

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

  const handleEditPrice = (product: any) => {
    setEditingProduct(product)
    setNewPrice(product.price.toString())
  }

  const handleSavePrice = async () => {
    if (!editingProduct || !newPrice || parseFloat(newPrice) < 0) {
      toast.error('Please enter a valid price')
      return
    }

    try {
      await pricingAPI.update(editingProduct.id.toString(), parseFloat(newPrice))
      toast.success('Price updated successfully!')
      setEditingProduct(null)
      setNewPrice('')
      await fetchPriceList()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update price')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Price Listing</h1>

        {loading ? (
          <div className="text-center py-12">Loading price list...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.category_name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct?.id === product.id ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-32 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary-600">₹{product.price}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {editingProduct?.id === product.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleSavePrice}
                            className="text-green-600 hover:text-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(null)
                              setNewPrice('')
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditPrice(product)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

