import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import type { Plan, User, Transaction } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, Receipt, DollarSign, ArrowRight, Loader2 } from 'lucide-react';

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
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
    { label: 'Active Plans', value: stats.totalPlans, icon: CreditCard, color: 'text-green-600 dark:text-green-400' },
    { label: 'Transactions', value: stats.totalTransactions, icon: Receipt, color:'text-purple-600 dark:text-purple-400' },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-yellow-600 dark:text-yellow-400' },
  ];

  const quickActions = [
    { 
      href: '/plans', 
      icon: CreditCard, 
      title: 'Manage Plans', 
      description: 'Create and edit subscription plans',
      color: 'hover:border-blue-500 dark:hover:border-blue-400'
    },
    { 
      href: '/users', 
      icon: Users, 
      title: 'View Users', 
      description: 'Browse all registered users',
      color: 'hover:border-green-500 dark:hover:border-green-400'
    },
    { 
      href: '/transactions', 
      icon: Receipt, 
      title: 'Transactions', 
      description: 'View payment history',
      color: 'hover:border-purple-500 dark:hover:border-purple-400'
    },
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Overview of your gym management system</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your gym operations efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className={`group relative overflow-hidden rounded-lg border p-6 transition-all hover:shadow-md ${action.color}`}
                >
                  <div className="flex items-start justify-between">
                    <Icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="font-semibold mt-4">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
