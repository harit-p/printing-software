'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { productAPI, categoryAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    description: '',
    price: '',
    image_url: '',
    is_active: true,
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll()
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll()
      const flatten = (cats: any[]): any[] => {
        let result: any[] = []
        cats.forEach((cat) => {
          result.push(cat)
          if (cat.children) result = result.concat(flatten(cat.children))
        })
        return result
      }
      setCategories(flatten(response.data.categories || []))
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await productAPI.update(editingProduct.id.toString(), formData)
        toast.success('Product updated successfully!')
      } else {
        await productAPI.create(formData)
        toast.success('Product created successfully!')
      }
      setShowForm(false)
      setEditingProduct(null)
      setFormData({ name: '', category_id: '', description: '', price: '', image_url: '', is_active: true })
      await fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save product')
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category_id: product.category_id?.toString() || '',
      description: product.description || '',
      price: product.price.toString(),
      image_url: product.image_url || '',
      is_active: product.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await productAPI.delete(id)
      toast.success('Product deleted successfully!')
      await fetchProducts()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete product')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Product Listing</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingProduct(null)
              setFormData({ name: '', category_id: '', description: '', price: '', image_url: '', is_active: true })
            }}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">₹{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id.toString())}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
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

