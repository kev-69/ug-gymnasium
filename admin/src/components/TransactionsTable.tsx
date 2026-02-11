import React from 'react';
import type { Transaction } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface TransactionsTableProps {
  transactions: Transaction[];
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

export const TransactionsTable: React.FC<TransactionsTableProps> = ({ transactions }) => {
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
                  {transaction.user.surname} {transaction.user.otherNames}
                </div>
                <div className="text-sm text-muted-foreground">
                  {transaction.user.email}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div className="font-medium">{transaction.plan.name}</div>
                <div className="text-sm text-muted-foreground">
                  {transaction.plan.duration} days
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
          </TableRow>
        ))}
        {transactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
