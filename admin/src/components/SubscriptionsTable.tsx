import React from 'react';
import type { Subscription } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  onViewSubscription: (subscription: Subscription) => void;
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

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({ 
  subscriptions,
  onViewSubscription 
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subscriptions.map((subscription) => (
          <TableRow key={subscription.id}>
            <TableCell>
              <div>
                <div className="font-medium">
                  {subscription.user?.surname} {subscription.user?.otherNames}
                </div>
                <div className="text-sm text-muted-foreground">
                  {subscription.user?.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{subscription.plan?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {subscription.plan?.duration} days - {formatCurrency(subscription.plan?.price || 0)}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getSubscriptionStatusVariant(subscription.subscriptionStatus)}>
                {subscription.subscriptionStatus}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getPaymentStatusVariant(subscription.paymentStatus)}>
                {subscription.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {subscription.startDate ? formatDateTime(subscription.startDate) : '-'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {subscription.endDate ? formatDateTime(subscription.endDate) : '-'}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(subscription.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewSubscription(subscription)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {subscriptions.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No subscriptions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
