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
      <div className="space-y-8 animate-slide-up">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gradient">Product Listing</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setEditingProduct(null)
              setFormData({ name: '', category_id: '', description: '', price: '', image_url: '', is_active: true })
            }}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : 'Add Product'}
          </button>
        </div>

        {showForm && (
          <div className="card p-8">
            <h2 className="text-2xl font-bold mb-6 text-gradient">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  required
                  className="input-field"
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="input-field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="input-field"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
                <input
                  type="url"
                  className="input-field"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span className="text-sm font-semibold text-gray-700">Active</span>
                </label>
              </div>
              <button
                type="submit"
                className="btn-primary"
              >
                {editingProduct ? 'Update Product' : 'Create Product'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-600">₹{product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id.toString())}
                        className="text-red-600 hover:text-red-700 font-medium hover:underline transition-colors"
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

