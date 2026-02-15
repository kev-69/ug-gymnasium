import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile, getSubscriptions, getTransactions } from '@/services/api';
import type { User, Subscription, Transaction } from '@/types';
import { SubscriptionStatus, PaymentStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  Loader2,
  User as UserIcon,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [profileRes, subscriptionsRes, transactionsRes] = await Promise.all([
        getProfile(),
        getSubscriptions(),
        getTransactions({ limit: 5 }),
      ]);

      setUser(profileRes.data.data);
      setSubscriptions(subscriptionsRes.data.data || []);
      setTransactions(transactionsRes.data.data || []);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load dashboard data';
      toast.error(errorMessage);
      
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const activeSubscription = subscriptions.find(
    (sub) => sub.subscriptionStatus === SubscriptionStatus.ACTIVE
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      [SubscriptionStatus.ACTIVE]: {
        label: 'Active',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle,
      },
      [SubscriptionStatus.EXPIRED]: {
        label: 'Expired',
        className: 'bg-red-100 text-red-800 border-red-200',
        icon: XCircle,
      },
      [SubscriptionStatus.PENDING]: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
      },
      [SubscriptionStatus.CANCELLED]: {
        label: 'Cancelled',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: XCircle,
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[SubscriptionStatus.PENDING];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      [PaymentStatus.COMPLETED]: {
        label: 'Completed',
        className: 'bg-green-100 text-green-800',
      },
      [PaymentStatus.PENDING]: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800',
      },
      [PaymentStatus.FAILED]: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[PaymentStatus.PENDING];

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getRemainingDaysColor = (days: number) => {
    if (days <= 7) return 'bg-red-100 border-red-200 text-red-800';
    if (days <= 30) return 'bg-yellow-100 border-yellow-200 text-yellow-800';
    return 'bg-green-100 border-green-200 text-green-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user.otherNames}!
          </h1>
          <p className="text-muted-foreground">
            Manage your gym membership and track your fitness journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Subscription */}
            {activeSubscription ? (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Current Subscription</h2>
                  {getStatusBadge(activeSubscription.subscriptionStatus)}
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{activeSubscription.plan.name}</h3>
                    {activeSubscription.plan.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {activeSubscription.plan.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {activeSubscription.startDate
                          ? formatDate(activeSubscription.startDate)
                          : 'Not started'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">End Date</p>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {activeSubscription.endDate
                          ? formatDate(activeSubscription.endDate)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {activeSubscription.endDate && (
                    <div
                      className={`p-6 rounded-lg border-2 ${getRemainingDaysColor(
                        getRemainingDays(activeSubscription.endDate)
                      )}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="h-6 w-6" />
                          <div>
                            <p className="text-2xl font-bold">
                              {getRemainingDays(activeSubscription.endDate)} days
                            </p>
                            <p className="text-sm font-medium">
                              remaining in your subscription
                            </p>
                          </div>
                        </div>
                        {getRemainingDays(activeSubscription.endDate) <= 7 && (
                          <div className="text-xs font-semibold px-2 py-1 bg-white rounded">
                            Expiring Soon!
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  {activeSubscription.plan.features && activeSubscription.plan.features.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Plan Features:</p>
                      <ul className="space-y-2">
                        {activeSubscription.plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="p-6">
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Subscription</h3>
                  <p className="text-muted-foreground mb-4">
                    Get started with a membership plan to access the gymnasium
                  </p>
                  <Link to="/plans">
                    <Button>Browse Plans</Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* All Subscriptions */}
            {subscriptions.length > 0 && (
              <Card className="p-6 max-h-[calc(60vh-200px)] overflow-y-auto px-6 pb-6">
                <h3 className="font-semibold mb-4">All Subscriptions</h3>
                <div className="space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{sub.plan.name}</p>
                        {getStatusBadge(sub.subscriptionStatus)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sub.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Info Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{user.surname} {user.otherNames}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{user.phone || 'N/A'}</span>
                </div>
                {user.studentId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student ID:</span>
                    <span className="font-medium">{user.studentId}</span>
                  </div>
                )}
                {user.staffId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff ID:</span>
                    <span className="font-medium">{user.staffId}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link to="/plans">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Browse Plans
                  </Button>
                </Link>
                {activeSubscription && (
                  <Link to="/plans">
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Renew Subscription
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Recent Transactions Card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Transactions</h2>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-3 p-6 max-h-[calc(60vh-200px)] overflow-y-auto px-6 pb-6">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {transaction.subscription?.plan?.name || 'Subscription Payment'}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.createdAt)} • {transaction.paymentReference}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold mb-1">
                          {formatCurrency(transaction.amount)}
                        </p>
                        {getPaymentStatusBadge(transaction.paymentStatus)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
