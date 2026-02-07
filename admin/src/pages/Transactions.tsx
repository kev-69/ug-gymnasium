import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Transaction } from '../types';
import { PaymentStatus } from '../types';
import { formatCurrency, formatDateTime, getStatusColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, statusFilter]);

  const fetchTransactions = async () => {
    try {
      const response = await api.getTransactions();
      setTransactions(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((txn) => txn.paymentStatus === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const totalRevenue = filteredTransactions
    .filter((txn) => txn.paymentStatus === PaymentStatus.COMPLETED)
    .reduce((sum, txn) => sum + txn.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-2">View all payment transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Total Transactions</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">{filteredTransactions.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {filteredTransactions.filter((t) => t.paymentStatus === PaymentStatus.COMPLETED).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="ALL">All Status</option>
            <option value={PaymentStatus.COMPLETED}>Completed</option>
            <option value={PaymentStatus.PENDING}>Pending</option>
            <option value={PaymentStatus.FAILED}>Failed</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredTransactions.length}</span> of{' '}
          <span className="font-semibold">{transactions.length}</span> transactions
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{txn.paymentReference}</div>
                    {txn.paystackReference && (
                      <div className="text-xs text-gray-500">PSK: {txn.paystackReference}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {txn.subscription?.user ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {txn.subscription.user.surname} {txn.subscription.user.otherNames}
                        </div>
                        <div className="text-xs text-gray-500">{txn.subscription.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {txn.subscription?.plan ? (
                      <div className="text-sm text-gray-900">{txn.subscription.plan.name}</div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{formatCurrency(txn.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{txn.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(txn.paymentStatus)}`}>
                      {txn.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{formatDateTime(txn.createdAt)}</div>
                    {txn.paidAt && (
                      <div className="text-xs text-gray-500">Paid: {formatDateTime(txn.paidAt)}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
