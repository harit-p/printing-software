'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { categoryAPI } from '@/lib/api'
import Link from 'next/link'
import { FiPackage } from 'react-icons/fi'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const renderCategoryTree = (categories: any[], parentId: number | null = null, level: number = 0) => {
    return categories
      .filter((cat) => cat.parent_id === parentId)
      .map((category, index) => (
        <div key={category.id} className={`${level > 0 ? 'ml-8' : ''}`}>
          <Link
            href={`/customer/products?category_id=${category.id}`}
            className="group block card p-6 mb-3 transition-all duration-300 hover:scale-[1.02]"
            style={{ animationDelay: `${(level * 10 + index) * 0.1}s` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiPackage className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <span className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </span>
                {level === 0 && (
                  <p className="text-sm text-gray-500 mt-1">Click to browse products</p>
                )}
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          {category.children && category.children.length > 0 && (
            <div className="mt-2">{renderCategoryTree(category.children, category.id, level + 1)}</div>
          )}
        </div>
      ))
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 animate-fade-in">
        <h1 className="text-4xl font-extrabold text-gradient">Product Categories</h1>
        <p className="text-gray-600 text-lg">Browse our wide range of printing categories</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-32 animate-pulse"></div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="card text-center py-16">
            <FiPackage className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">No categories available</p>
          </div>
        ) : (
          <div className="space-y-4">{renderCategoryTree(categories)}</div>
        )}
      </div>
    </CustomerLayout>
  )
}

