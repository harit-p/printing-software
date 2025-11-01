'use client'

import { useEffect, useState } from 'react'
import AdminLayout from '@/components/AdminLayout'
import { complaintAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null)
  const [responseText, setResponseText] = useState('')

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

  const handleStatusUpdate = async (complaintId: string, status: string) => {
    try {
      await complaintAPI.updateStatus(complaintId, status, responseText)
      toast.success('Complaint status updated!')
      setSelectedComplaint(null)
      setResponseText('')
      await fetchComplaints()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update complaint')
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
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Complaint List</h1>

        {loading ? (
          <div className="text-center py-12">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">No complaints</p>
          </div>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{complaint.subject}</h3>
                    <p className="text-gray-600 text-sm mt-1">#{complaint.complaint_number}</p>
                    <p className="text-gray-600 text-sm">Customer: {complaint.customer_name}</p>
                    {complaint.order_number && (
                      <p className="text-gray-600 text-sm">Order: #{complaint.order_number}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(complaint.status)}`}>
                    {complaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{complaint.description}</p>
                {complaint.response && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold mb-1">Response:</p>
                    <p className="text-gray-700">{complaint.response}</p>
                  </div>
                )}
                {selectedComplaint?.id === complaint.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter response..."
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(complaint.id.toString(), 'in_progress')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Mark In Progress
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(complaint.id.toString(), 'resolved')}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(complaint.id.toString(), 'closed')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                      >
                        Close
                      </button>
                      <button
                        onClick={() => {
                          setSelectedComplaint(null)
                          setResponseText('')
                        }}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedComplaint(complaint)
                        setResponseText(complaint.response || '')
                      }}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                    >
                      Respond
                    </button>
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
    </AdminLayout>
  )
}

