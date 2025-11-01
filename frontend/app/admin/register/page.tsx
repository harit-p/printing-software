'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api'
import { setAuthToken } from '@/lib/auth'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'

interface FormErrors {
  name?: string
  email?: string
  phone?: string
  password?: string
}

export default function AdminRegister() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\D/g, ''))
  }

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
      return { valid: false, message: 'Password must be at least 6 characters' }
    }
    if (password.length > 50) {
      return { valid: false, message: 'Password must be less than 50 characters' }
    }
    return { valid: true }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const passwordValidation = validatePassword(formData.password)
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await authAPI.register({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        role: 'admin',
      })
      const { token, user } = response.data
      setAuthToken(token, user.role)
      toast.success('Admin account created successfully!')
      router.push('/admin/dashboard')
    } catch (error: any) {
      let errorMessage = 'Registration failed'
      
      if (error.response?.status === 400) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((e: any) => e.msg || e).join(', ')
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error.response?.status === 409 || error.response?.data?.error?.includes('already exists')) {
        errorMessage = 'An account with this email already exists. Please use a different email or try logging in.'
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message === 'Network Error') {
        errorMessage = 'Unable to connect to server. Please check your internet connection.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-full flex items-center justify-center mb-4">
              <FiShield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Admin Account
            </h2>
            <p className="text-gray-600">
              Set up your admin dashboard access
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className={`h-5 w-5 ${errors.name ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: undefined })
                  }}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 animate-slide-down">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className={`h-5 w-5 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    if (errors.email) setErrors({ ...errors, email: undefined })
                  }}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 animate-slide-down">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className={`h-5 w-5 ${errors.phone ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.phone
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                  placeholder="Enter 10-digit phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setFormData({ ...formData, phone: value })
                    if (errors.phone) setErrors({ ...errors, phone: undefined })
                  }}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 animate-slide-down">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className={`h-5 w-5 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                  placeholder="Enter password (min 6 characters)"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 animate-slide-down">{errors.password}</p>
              )}
              {!errors.password && formData.password && (
                <p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    <FiShield className="w-5 h-5" />
                    Create Admin Account
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/admin/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
