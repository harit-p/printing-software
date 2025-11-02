'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { complaintAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function ComplaintsPage() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ subject: '', description: '', order_id: '' })

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll()
      setComplaints(response.data.complaints || [])
    } catch (error) {
      console.error('Error fetching complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const dataToSend: any = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
      }
      
      if (formData.order_id && formData.order_id.trim()) {
        const orderIdNum = parseInt(formData.order_id.trim())
        if (!isNaN(orderIdNum)) {
          dataToSend.order_id = orderIdNum
        }
      }
      
      await complaintAPI.create(dataToSend)
      toast.success('Complaint submitted successfully!')
      setShowForm(false)
      setFormData({ subject: '', description: '', order_id: '' })
      await fetchComplaints()
    } catch (error: any) {
      console.error('Complaint submission error:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'Failed to submit complaint'
      
      if (error.response?.status === 400) {
        if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors.map((e: any) => e.msg || e).join(', ')
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error
        }
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      toast.error(errorMessage)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      open: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Complaints</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            {showForm ? 'Cancel' : 'New Complaint'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Register New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order ID (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.order_id}
                  onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Submit Complaint
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No complaints yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                    <p className="text-gray-600 text-sm mt-1">#{complaint.complaint_number}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{complaint.description}</p>
                {complaint.response && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Response:</p>
                    <p className="text-gray-700">{complaint.response}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-4">
                  Submitted on {format(new Date(complaint.created_at), 'MMM dd, yyyy hh:mm a')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}

