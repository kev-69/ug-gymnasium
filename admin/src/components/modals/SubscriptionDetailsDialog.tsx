import React, { useState } from 'react';
import type { Subscription } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, User, CreditCard, Calendar, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';

interface SubscriptionDetailsDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const getSubscriptionStatusVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'EXPIRED':
      return 'destructive';
    case 'CANCELLED':
      return 'outline';
    default:
      return 'outline';
  }
};

const getPaymentStatusVariant = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
      return 'destructive';
    default:
      return 'outline';
  }
};

export const SubscriptionDetailsDialog: React.FC<SubscriptionDetailsDialogProps> = ({
  subscription,
  open,
  onOpenChange,
  onUpdate,
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  if (!subscription) return null;

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) {
      return;
    }

    setIsCancelling(true);
    try {
      await api.updateSubscriptionStatus(subscription.id, 'CANCELLED');
      toast.success('Subscription cancelled successfully');
      onOpenChange(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Subscription Details
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge variant={getSubscriptionStatusVariant(subscription.subscriptionStatus)}>
              {subscription.subscriptionStatus}
            </Badge>
            <Badge variant={getPaymentStatusVariant(subscription.paymentStatus)}>
              {subscription.paymentStatus}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Subscription Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={getSubscriptionStatusVariant(subscription.subscriptionStatus)} className="mt-1">
                    {subscription.subscriptionStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Status</p>
                  <Badge variant={getPaymentStatusVariant(subscription.paymentStatus)} className="mt-1">
                    {subscription.paymentStatus}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-sm font-medium">
                    {subscription.startDate ? formatDateTime(subscription.startDate) : 'Not started'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-sm font-medium">
                    {subscription.endDate ? formatDateTime(subscription.endDate) : 'Not set'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{formatDateTime(subscription.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                  <p className="text-sm">{formatDateTime(subscription.updatedAt)}</p>
                </div>
              </div>

              <Separator />
            </CardContent>
          </Card>

          {/* User Information */}
          {subscription.user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm font-medium">
                      {subscription.user.surname} {subscription.user.otherNames}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm">{subscription.user.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                    <Badge variant="outline">{subscription.user.role}</Badge>
                  </div>
                  {subscription.user.phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p className="text-sm">{subscription.user.phone}</p>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Plan Information */}
          {subscription.plan && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
                    <p className="text-sm font-medium">{subscription.plan.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Price</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(subscription.plan.price)}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Duration</p>
                    <p className="text-sm">{subscription.plan.duration} days</p>
                  </div>
                  {subscription.plan.description && (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Description</p>
                      <p className="text-sm">{subscription.plan.description}</p>
                    </div>
                  </>
                )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {subscription.subscriptionStatus !== 'CANCELLED' && subscription.subscriptionStatus !== 'EXPIRED' && (
          <DialogFooter className="mt-6">
            <Button 
              onClick={handleCancelSubscription} 
              variant="destructive"
              disabled={isCancelling}
            >
              {isCancelling ? (
                'Cancelling...'
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
