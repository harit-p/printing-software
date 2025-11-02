'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import CustomerLayout from '@/components/CustomerLayout'
import { productAPI, categoryAPI } from '@/lib/api'
import Link from 'next/link'
import { FiShoppingCart, FiPackage } from 'react-icons/fi'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { cartAPI } from '@/lib/api'

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const categoryIdFromUrl = searchParams.get('category_id')
    if (categoryIdFromUrl) {
      setSelectedCategory(categoryIdFromUrl)
    } else {
      setSelectedCategory('')
    }
    fetchCategories()
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchTerm])

  useEffect(() => {
    const categoryIdFromUrl = searchParams.get('category_id')
    if (categoryIdFromUrl && categoryIdFromUrl !== selectedCategory) {
      setSearchTerm('')
    }
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll()
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (selectedCategory) {
        params.category_id = selectedCategory
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      console.log('Fetching products with params:', params) // Debug log
      const response = await productAPI.getAll(params)
      console.log('Products fetched:', response.data.products?.length || 0) // Debug log
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async (productId: string) => {
    try {
      await cartAPI.add({ product_id: productId, quantity: 1 })
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart')
    }
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-extrabold text-gradient">Products</h1>
          {selectedCategory && (
            <span className="badge badge-primary">
              {categories.find(c => c.id === selectedCategory)?.name || 'Filtered'}
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="card p-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            className="input-field md:w-64"
            value={selectedCategory}
            onChange={(e) => {
              const categoryId = e.target.value
              setSelectedCategory(categoryId)
              if (categoryId) {
                router.push(`/customer/products?category_id=${categoryId}`)
              } else {
                router.push('/customer/products')
              }
            }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 animate-pulse h-64 rounded-lg" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card text-center py-16">
            <FiPackage className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="card card-hover overflow-hidden group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative overflow-hidden bg-gray-100">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      unoptimized={product.image_url.includes('unsplash.com')}
                    />
                  ) : (
                    <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <FiPackage className="w-20 h-20 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary-600 transition-colors line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-extrabold text-gradient">₹{product.price}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/customer/products/${product.id}`}
                      className="flex-1 text-center btn-secondary py-2.5 text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product.id)}
                      className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-2.5 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold transform hover:scale-105"
                    >
                      <FiShoppingCart className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <CustomerLayout>
        <div className="text-center py-12">Loading products...</div>
      </CustomerLayout>
    }>
      <ProductsContent />
    </Suspense>
  )
}

