import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Plan, User, Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPlans: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, plansRes, transactionsRes] = await Promise.all([
          api.getUsers(),
          api.getPlans(),
          api.getTransactions(),
        ]);

        const users = usersRes.data as User[];
        const plans = plansRes.data as Plan[];
        const transactions = transactionsRes.data as Transaction[];

        const completedTransactions = transactions.filter(
          (t) => t.paymentStatus === 'COMPLETED'
        );
        const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalUsers: users.length,
          totalPlans: plans.length,
          totalTransactions: transactions.length,
          totalRevenue,
          loading: false,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'blue' },
    { label: 'Active Plans', value: stats.totalPlans, icon: '📋', color: 'green' },
    { label: 'Transactions', value: stats.totalTransactions, icon: '💰', color:'purple' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: '💵', color: 'yellow' },
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your gym management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow-md p-6 border-l-4"
            style={{ borderLeftColor: `var(--color-${stat.color}-500, #3B82F6)` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/plans"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-gray-900">Manage Plans</h3>
            <p className="text-sm text-gray-600 mt-1">Create and edit subscription plans</p>
          </a>
          <a
            href="/users"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-gray-900">View Users</h3>
            <p className="text-sm text-gray-600 mt-1">Browse all registered users</p>
          </a>
          <a
            href="/transactions"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-900">Transactions</h3>
            <p className="text-sm text-gray-600 mt-1">View payment history</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
