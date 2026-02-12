import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Transaction } from '../types';
import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { TransactionStats } from '@/components/TransactionStats';
import { TransactionsTable } from '@/components/TransactionsTable';
import { TransactionDetailsDialog } from '@/components/modals/TransactionDetailsDialog';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

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

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsDialogOpen(true);
  };

  const filteredTransactions = transactions.filter((transaction) => {
    return statusFilter === 'ALL' || transaction.paymentStatus === statusFilter;
  });

  const stats = {
    totalRevenue: transactions
      .filter((t) => t.paymentStatus === 'COMPLETED')
      .reduce((sum, t) => sum + t.amount, 0),
    totalTransactions: transactions.length,
    completedTransactions: transactions.filter((t) => t.paymentStatus === 'COMPLETED').length,
  };

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
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-2">View payment transactions and history</p>
      </div>

      <TransactionStats
        totalRevenue={stats.totalRevenue}
        totalTransactions={stats.totalTransactions}
        completedTransactions={stats.completedTransactions}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <TransactionsTable 
            transactions={filteredTransactions} 
            onViewTransaction={handleViewTransaction}
          />
        </CardContent>
      </Card>

      <TransactionDetailsDialog
        transaction={selectedTransaction}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
};

export default Transactions;
