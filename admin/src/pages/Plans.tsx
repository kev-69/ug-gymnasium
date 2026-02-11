import React, { useEffect, useState } from 'react';
import api from '../services/api';
import type { Plan } from '../types';
import { UserRole } from '../types';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Check, Loader2 } from 'lucide-react';
import { PlanFormDialog } from '@/components/PlanFormDialog';

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    duration: string;
    targetRole: UserRole;
    features: string[];
    isActive: boolean;
  }>({
    name: '',
    description: '',
    price: '',
    duration: '',
    targetRole: UserRole.STUDENT,
    features: [''],
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.getPlans();
      setPlans(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      features: formData.features.filter((f) => f.trim() !== ''),
    };

    try {
      if (editingPlan) {
        await api.updatePlan(editingPlan.id, planData);
        toast.success('Plan updated successfully');
      } else {
        await api.createPlan(planData);
        toast.success('Plan created successfully');
      }
      fetchPlans();
      closeModal();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await api.deletePlan(id);
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const openModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price.toString(),
        duration: plan.duration.toString(),
        targetRole: plan.targetRole as UserRole,
        features: plan.features.length > 0 ? plan.features : [''],
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        targetRole: UserRole.STUDENT as UserRole,
        features: [''],
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlan(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans Management</h1>
          <p className="text-muted-foreground mt-2">Manage gym subscription plans</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.targetRole}</CardDescription>
                </div>
                <Badge variant={plan.isActive ? 'success' : 'destructive'}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              
              <div className="mb-4">
                <div className="text-3xl font-bold text-primary">{formatCurrency(plan.price)}</div>
                <div className="text-sm text-muted-foreground">{plan.duration} days</div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2">Features:</h4>
                <ul className="space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => openModal(plan)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleDelete(plan.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <PlanFormDialog
        open={showModal}
        onOpenChange={setShowModal}
        editingPlan={editingPlan}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        onClose={closeModal}
      />
    </div>
  );
};

export default Plans;
