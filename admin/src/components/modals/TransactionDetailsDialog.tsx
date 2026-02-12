import React from 'react';
import type { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const getStatusVariant = (status: string) => {
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

export const TransactionDetailsDialog: React.FC<TransactionDetailsDialogProps> = ({
  transaction,
  open,
  onOpenChange,
}) => {
  if (!transaction) return null;

//   const renderMetadata = (metadata: any) => {
//     if (!metadata) return <p className="text-sm text-muted-foreground">No metadata available</p>;

//     try {
//       const data = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
//       return (
//         <div className="space-y-2">
//           {Object.entries(data).map(([key, value]) => (
//             <div key={key} className="flex justify-between py-2 border-b last:border-0">
//               <span className="text-sm font-medium capitalize">
//                 {key.replace(/_/g, ' ')}:
//               </span>
//               <span className="text-sm text-muted-foreground">
//                 {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
//               </span>
//             </div>
//           ))}
//         </div>
//       );
//     } catch (e) {
//       return (
//         <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
//           {JSON.stringify(metadata, null, 2)}
//         </pre>
//       );
//     }
//   };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            <Badge variant={getStatusVariant(transaction.paymentStatus)}>
              {transaction.paymentStatus}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Reference: {transaction.paymentReference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                  <Badge variant="outline" className="mt-1">
                    {transaction.paymentMethod}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Payment Reference</p>
                  <p className="text-sm font-mono">{transaction.paymentReference}</p>
                </div>
                {transaction.paystackReference && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paystack Reference</p>
                    <p className="text-sm font-mono">{transaction.paystackReference}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p className="text-sm">{formatDateTime(transaction.createdAt)}</p>
                </div>
                {transaction.paidAt && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paid At</p>
                    <p className="text-sm">{formatDateTime(transaction.paidAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">
                    {transaction.subscription.user.surname} {transaction.subscription.user.otherNames}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-sm">{transaction.subscription.user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Role</p>
                  <Badge variant="outline">{transaction.subscription.user.role}</Badge>
                </div>
                {(transaction.subscription.user.studentId || transaction.subscription.user.staffId) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                    <p className="text-sm">
                      {transaction.subscription.user.studentId || transaction.subscription.user.staffId}
                    </p>
                  </div>
                )}
              </div>

              {transaction.subscription.user.phone && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-sm">{transaction.subscription.user.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plan Name</p>
                  <p className="text-sm font-medium">{transaction.subscription.plan.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Duration</p>
                  <p className="text-sm">{transaction.subscription.plan.duration} day (s)</p>
                </div>
              </div>

              {transaction.subscription.plan.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm">{transaction.subscription.plan.description}</p>
                </div>
              )}

              {transaction.subscription.plan.features && transaction.subscription.plan.features.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                  <ul className="list-disc list-inside space-y-1">
                    {transaction.subscription.plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          {/* {transaction.metadata && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Metadata</CardTitle>
                <CardDescription>Additional information from payment provider</CardDescription>
              </CardHeader>
              <CardContent>{renderMetadata(transaction.metadata)}</CardContent>
            </Card>
          )} */}
        </div>
      </DialogContent>
    </Dialog>
  );
};
