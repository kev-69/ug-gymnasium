import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getPlans, getSubscriptions } from '@/services/api';
import { UserRole, SubscriptionStatus } from '@/types';
import type { Plan, User } from '@/types';
import { formatCurrency } from '@/utils/helpers';
import { Search, Check, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  useEffect(() => {
    // Check if user is logged in and get their role
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user: User = JSON.parse(userStr);
        setIsAuthenticated(true);
        setRoleFilter(user.role); // Set filter to user's role
        checkActiveSubscription();
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    fetchPlans();
  }, []);

  const checkActiveSubscription = async () => {
    try {
      const response = await getSubscriptions();
      const subscriptions = response.data.data || [];
      const active = subscriptions.some(
        (sub: any) => sub.subscriptionStatus === SubscriptionStatus.ACTIVE
      );
      setHasActiveSubscription(active);
    } catch (error) {
      console.error('Error checking subscriptions:', error);
    }
  };

  const handlePlanClick = (planId: string) => {
    if (!isAuthenticated) {
      // Store plan ID for after registration
      localStorage.setItem('selectedPlanId', planId);
      navigate('/register');
    } else if (hasActiveSubscription) {
      // User already has active subscription
      navigate('/dashboard');
      toast.error('You already have an active subscription');
    } else {
      // Proceed to checkout
      navigate(`/subscribe/${planId}`);
    }
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await getPlans({ isActive: true });
      setPlans(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to fetch plans');
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter((plan) => {
    const roleMatch = roleFilter === 'ALL' || plan.targetRole === roleFilter;
    const searchMatch =
      searchQuery === '' ||
      plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (plan.description && plan.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return roleMatch && searchMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Membership Plans</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose the perfect plan that fits your needs. All plans include access to our
          state-of-the-art facilities and equipment.
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Browse Plans</CardTitle>
              <CardDescription>
                {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''} available
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                disabled={isAuthenticated}
                className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="ALL">All Roles</option>
                <option value={UserRole.STUDENT}>Students</option>
                <option value={UserRole.STAFF}>Staff</option>
                <option value={UserRole.PUBLIC}>Public</option>
              </select>

              {/* Search */}
              <div className="relative w-full sm:min-w-62.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search plans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No plans found matching your criteria</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <Card key={plan.id} className="flex flex-col border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                    {plan.targetRole}
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-base">
                  {plan.description || 'Transform your fitness journey with this plan'}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-muted-foreground">
                      / {plan.duration} day{plan.duration !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-6">
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={() => handlePlanClick(plan.id)}
                >
                  {isAuthenticated ? 'Subscribe Now' : 'Get Started'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center">
        <Card className="bg-muted/50 border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Need Help Choosing?</CardTitle>
            <CardDescription className="text-base">
              Our team is here to help you find the perfect plan for your fitness goals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg">Contact Us</Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline">Learn More</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Plans;
