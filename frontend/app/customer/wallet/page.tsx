'use client'

import { useEffect, useState } from 'react'
import CustomerLayout from '@/components/CustomerLayout'
import { walletAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>({ balance: 0 })
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingMoney, setAddingMoney] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('upi')

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [])

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.get()
      setWallet(response.data.wallet || { balance: 0 })
    } catch (error) {
      console.error('Error fetching wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await walletAPI.getTransactions()
      setTransactions(response.data.transactions || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  const handleAddMoney = async () => {
    const amountNum = parseFloat(amount)
    if (!amountNum || amountNum < 1) {
      toast.error('Please enter a valid amount')
      return
    }

    setAddingMoney(true)
    try {
      const response = await walletAPI.addMoney(amountNum, paymentMethod)
      toast.success('Money added successfully!')
      setAmount('')
      await fetchWallet()
      await fetchTransactions()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add money')
    } finally {
      setAddingMoney(false)
    }
  }

  if (loading) {
    return (
      <CustomerLayout>
        <div className="text-center py-12">Loading...</div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Wallet</h1>

        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-semibold mb-2">Current Balance</h2>
          <p className="text-4xl font-bold">₹{parseFloat(wallet.balance || 0).toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Add Money</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="netbanking">Net Banking</option>
              </select>
            </div>
            <button
              onClick={handleAddMoney}
              disabled={addingMoney}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              {addingMoney ? 'Processing...' : 'Add Money'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Transaction History</h2>
          {transactions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b pb-3">
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{format(new Date(transaction.created_at), 'MMM dd, yyyy hh:mm a')}</p>
                  </div>
                  <p className={`font-bold ${transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}

