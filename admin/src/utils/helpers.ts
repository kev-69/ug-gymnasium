export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount: number) => {
  return `GH₵ ${amount.toFixed(2)}`;
};

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    EXPIRED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
