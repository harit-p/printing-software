'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { productAPI, categoryAPI } from '@/lib/api'
import Link from 'next/link'
import { FiShoppingCart, FiPackage } from 'react-icons/fi'
import Image from 'next/image'

export default function CustomerHome() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll({ limit: 8 }).catch(() => ({ data: { products: [] } })),
          categoryAPI.getAll().catch(() => ({ data: { categories: [] } })),
        ])
        setProducts(productsRes.data?.products || [])
        setCategories(categoriesRes.data?.categories || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <CustomerLayout>
      <div className="space-y-12 animate-fade-in">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-slide-up">
              Welcome to <span className="text-yellow-300">PrintShop</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-2xl">
              Your one-stop solution for all printing needs. High-quality prints, fast delivery, and exceptional service.
            </p>
            <Link
              href="/customer/products"
              className="inline-flex items-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              <FiPackage className="w-6 h-6" />
              Browse Products
            </Link>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        </div>

        {/* Categories */}
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gradient">Shop by Category</h2>
            <Link href="/customer/categories" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              View All <span>→</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-40 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category, index) => (
                <Link
                  key={category.id}
                  href={`/customer/products?category_id=${category.id}`}
                  className="group card card-hover p-6 text-center transform transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <FiPackage className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{category.name}</h3>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Products */}
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gradient">Featured Products</h2>
            <Link href="/customer/products" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1">
              View All <span>→</span>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse h-80 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <div 
                  key={product.id} 
                  className="card card-hover overflow-hidden group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative overflow-hidden bg-gray-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        priority={index < 4}
                        unoptimized={product.image_url.includes('unsplash.com')}
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <FiPackage className="w-20 h-20 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FiShoppingCart className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-gray-800 group-hover:text-primary-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-extrabold text-gradient">₹{product.price}</span>
                      <Link
                        href={`/customer/products/${product.id}`}
                        className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-5 py-2 rounded-lg font-semibold hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}

