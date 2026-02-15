import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlanById, createSubscription, initializePayment } from '@/services/api';
import type { Plan } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';
import {
  Loader2,
  Check,
  CreditCard,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const Subscribe = () => {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MOBILE_MONEY'>('CARD');

  useEffect(() => {
    if (!planId) {
      toast.error('Invalid plan');
      navigate('/plans');
      return;
    }

    fetchPlan();
  }, [planId]);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const response = await getPlanById(planId!);
      setPlan(response.data.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch plan details';
      toast.error(errorMessage);
      navigate('/plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!plan) return;

    setProcessing(true);

    try {
      // Step 1: Create subscription
      const subscriptionResponse = await createSubscription({ planId: plan.id });
      const { transaction } = subscriptionResponse.data.data;

      // Step 2: Initialize payment with Paystack
      const paymentResponse = await initializePayment({
        transactionId: transaction.id,
        paymentMethod,
      });

      const { authorizationUrl } = paymentResponse.data.data;

      // Step 3: Redirect to Paystack
      toast.success('Redirecting to payment gateway...');
      window.location.href = authorizationUrl;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to initialize payment';
      toast.error(errorMessage);
      
      // If user already has active subscription, redirect to dashboard
      if (error.response?.status === 400) {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/plans')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Plans
          </Button>
          <h1 className="text-3xl font-bold">Complete Your Subscription</h1>
          <p className="text-muted-foreground mt-2">Review your selection and proceed to payment</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Details Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b">
                  <div>
                    <h3 className="text-lg font-medium">{plan.name}</h3>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    )}
                    <div className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {plan.targetRole}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(plan.price)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plan.duration} day{plan.duration !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Features */}
                {plan.features && plan.features.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment Method Card */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select your preferred payment method</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Payment */}
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <CreditCard className={`h-6 w-6 ${paymentMethod === 'CARD' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-left">
                      <p className="font-medium">Card</p>
                      <p className="text-xs text-muted-foreground">Debit/Credit Card</p>
                    </div>
                    {paymentMethod === 'CARD' && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>

                  {/* Mobile Money */}
                  <button
                    onClick={() => setPaymentMethod('MOBILE_MONEY')}
                    className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-all ${
                      paymentMethod === 'MOBILE_MONEY'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Smartphone className={`h-6 w-6 ${paymentMethod === 'MOBILE_MONEY' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-left">
                      <p className="font-medium">Mobile Money</p>
                      <p className="text-xs text-muted-foreground">MTN, Telecel, AirtelTigo</p>
                    </div>
                    {paymentMethod === 'MOBILE_MONEY' && (
                      <Check className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </button>
                </div>
              </div>
            </Card>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 border">
              <ShieldCheck className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Secure Payment</p>
                <p className="text-muted-foreground">
                  Your payment is processed securely through Paystack. We never store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan Price</span>
                  <span className="font-medium">{formatCurrency(plan.price)}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(plan.price)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                onClick={handleSubscribe}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                By proceeding, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
