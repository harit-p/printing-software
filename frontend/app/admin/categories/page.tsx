'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { categoryAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', parent_id: '', level: 1, image_url: '', is_active: true })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await categoryAPI.create(formData)
      toast.success('Category created successfully!')
      setShowForm(false)
      setFormData({ name: '', parent_id: '', level: 1, image_url: '', is_active: true })
      await fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create category')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await categoryAPI.delete(id)
      toast.success('Category deleted successfully!')
      await fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete category')
    }
  }

  const getAllCategoriesFlat = (cats: any[]): any[] => {
    let result: any[] = []
    cats.forEach((cat) => {
      result.push(cat)
      if (cat.children && cat.children.length > 0) {
        result = result.concat(getAllCategoriesFlat(cat.children))
      }
    })
    return result
  }

  const flatCategories = categories.length > 0 ? getAllCategoriesFlat(categories) : []

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Categories</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancel' : 'Add Category'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Add Category / Sub Category</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category (Optional)</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.parent_id}
                  onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                >
                  <option value="">None (Top Level)</option>
                  {flatCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} (Level {cat.level})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level (1-4)</label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (Optional)</label>
                <input
                  type="url"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Create Category
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading categories...</div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flatCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{category.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Level {category.level}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(category.id.toString())}
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

