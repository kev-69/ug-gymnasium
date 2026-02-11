import React from 'react';
import type { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface TransactionsTableProps {
  transactions: Transaction[];
  onViewTransaction: (transaction: Transaction) => void;
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

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ 
  transactions,
  onViewTransaction 
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell className="font-mono text-sm">
              {transaction.paymentReference}
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">
                  {transaction.subscription.user.surname} {transaction.subscription.user.otherNames}
                </div>
                <div className="text-sm text-muted-foreground">
                  {transaction.subscription.user.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{transaction.subscription.plan.name}</div>
                <div className="text-sm text-muted-foreground">
                  {transaction.subscription.plan.duration} days
                </div>
              </div>
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(transaction.amount)}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{transaction.paymentMethod}</Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(transaction.paymentStatus)}>
                {transaction.paymentStatus}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {formatDateTime(transaction.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewTransaction(transaction)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
