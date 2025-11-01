'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import CustomerLayout from '@/components/CustomerLayout'
import { productAPI, cartAPI } from '@/lib/api'
import { FiShoppingCart, FiPackage, FiArrowLeft } from 'react-icons/fi'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { getAuthToken } from '@/lib/auth'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await productAPI.getById(params.id as string)
      setProduct(response.data.product)
    } catch (error: any) {
      console.error('Error fetching product:', error)
      if (error.response?.status === 404) {
        toast.error('Product not found')
        router.push('/customer/products')
      } else {
        toast.error('Failed to load product details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        toast.error('Please login to add items to cart')
        router.push('/customer/login')
        return
      }

      await cartAPI.add({ product_id: product.id, quantity })
      toast.success('Added to cart!')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart')
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </CustomerLayout>
    )
  }

  if (!product) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">
          <FiPackage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            href="/customer/products"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Products
          </Link>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Back Button */}
        <Link
          href="/customer/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 font-semibold transition-all duration-200 hover:gap-3"
        >
          <FiArrowLeft className="w-5 h-5" />
          Back to Products
        </Link>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 p-8 md:p-12">
            {/* Product Image */}
            <div className="relative group">
              {product.image_url ? (
                <div className="relative overflow-hidden rounded-2xl bg-gray-100">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    width={600}
                    height={400}
                    className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={product.image_url.includes('unsplash.com')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ) : (
                <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
                  <FiPackage className="w-32 h-32 text-gray-400" />
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient">{product.name}</h1>
                {product.category_name && (
                  <div className="inline-block mb-6">
                    <span className="badge badge-primary text-sm px-4 py-2">
                      {product.category_name}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-4 mb-8">
                  <span className="text-5xl font-extrabold text-gradient">₹{product.price}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-3 text-gray-800">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="bg-gray-50 rounded-xl p-6">
                <label htmlFor="quantity" className="block text-sm font-bold text-gray-800 mb-3">
                  Quantity
                </label>
                <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-6 py-3 hover:bg-primary-50 transition-colors font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 px-4 py-3 text-center border-0 focus:ring-2 focus:ring-primary-500 font-semibold text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-6 py-3 hover:bg-primary-50 transition-colors font-bold text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center gap-3 btn-primary text-lg"
                >
                  <FiShoppingCart className="w-6 h-6" />
                  Add to Cart
                </button>
              </div>

              {/* Product Info */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Product ID:</span>
                    <span className="ml-2 font-medium">{product.id}</span>
                  </div>
                  {product.category_name && (
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium">{product.category_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
