import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Subscription } from '../types';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Users, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { SubscriptionsTable } from '@/components/SubscriptionsTable';
import { SubscriptionDetailsDialog } from '@/components/modals/SubscriptionDetailsDialog';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string>('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    pendingSubscriptions: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.getSubscriptions();
      setSubscriptions(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getSubscriptionStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription stats');
    }
  };

  const handleViewSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsDetailsDialogOpen(true);
  };

  const handleSubscriptionUpdate = async () => {
    await fetchSubscriptions();
    await fetchStats();
  };

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const subscriptionMatch = subscriptionStatusFilter === 'ALL' || subscription.subscriptionStatus === subscriptionStatusFilter;
    const paymentMatch = paymentStatusFilter === 'ALL' || subscription.paymentStatus === paymentStatusFilter;
    
    const searchMatch = searchQuery === '' ||
      (subscription.user?.surname && subscription.user.surname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscription.user?.otherNames && subscription.user.otherNames.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscription.user?.email && subscription.user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscription.user?.studentId && subscription.user.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscription.user?.staffId && subscription.user.staffId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (subscription.plan?.name && subscription.plan.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return subscriptionMatch && paymentMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground mt-2">Manage and view all user subscriptions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
            <p className="text-xs text-muted-foreground">All time subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.activeSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">Currently active subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.expiredSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">Expired subscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {stats.pendingSubscriptions}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>
                  {filteredSubscriptions.length} subscription{filteredSubscriptions.length !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <select
                  value={subscriptionStatusFilter}
                  onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="ALL">All Payments</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by user name, email, ID, or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[calc(60vh-150px)] overflow-y-auto px-6 pb-6">
            <SubscriptionsTable 
              subscriptions={filteredSubscriptions} 
              onViewSubscription={handleViewSubscription}
            />
          </div>
        </CardContent>
      </Card>

      <SubscriptionDetailsDialog
        subscription={selectedSubscription}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onUpdate={handleSubscriptionUpdate}
      />
    </div>
  );
};

export default Subscriptions;
