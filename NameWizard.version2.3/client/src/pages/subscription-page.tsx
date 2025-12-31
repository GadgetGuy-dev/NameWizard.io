import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import { 
  ChevronLeft, 
  CreditCard, 
  Check, 
  Crown, 
  Zap, 
  Star,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Link } from 'wouter';

interface Plan {
  id: string;
  name: string;
  planType: 'free' | 'credits_low' | 'credits_high' | 'unlimited';
  monthlyPrice: number;
  yearlyPrice?: number;
  features: string[];
  popular?: boolean;
  icon: typeof Star;
  color: string;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    planType: 'free',
    monthlyPrice: 0,
    features: [
      '5 file renames per day',
      'Basic AI models (GPT-3.5)',
      'Standard file types',
      'Basic naming patterns'
    ],
    icon: Star,
    color: 'gray'
  },
  {
    id: 'basic',
    name: 'Basic',
    planType: 'credits_low',
    monthlyPrice: 19,
    features: [
      '100 file renames per day',
      'GPT-4o & Claude models',
      'OCR for images',
      'Custom naming templates',
      'Cloud storage integration'
    ],
    icon: Zap,
    color: 'blue'
  },
  {
    id: 'pro',
    name: 'Pro',
    planType: 'credits_high',
    monthlyPrice: 49,
    features: [
      '500 file renames per day',
      'All AI models (best quality first)',
      'Priority OCR processing',
      'Magic Folders automation',
      'Batch processing',
      'Priority support'
    ],
    popular: true,
    icon: Crown,
    color: 'purple'
  },
  {
    id: 'unlimited',
    name: 'Unlimited',
    planType: 'unlimited',
    monthlyPrice: 99,
    yearlyPrice: 1188,
    features: [
      'Unlimited file renames',
      'All AI models (highest quality)',
      'Unlimited OCR processing',
      'Advanced Magic Folders',
      'Job queue priority',
      'API access',
      'Dedicated support',
      '14 months for price of 12 (annual)'
    ],
    icon: Sparkles,
    color: 'orange'
  }
];

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  free: 'Free',
  credits_low: 'Basic',
  credits_high: 'Pro',
  unlimited: 'Unlimited'
};

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const currentPlanType = (user as any)?.planType || 'free';
  const isGodAdmin = user?.role === 'god_admin';

  const checkoutMutation = useMutation({
    mutationFn: async ({ planType, interval }: { planType: string; interval: string }) => {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planType, interval })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create checkout session');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Checkout Error',
        description: error.message,
        variant: 'destructive'
      });
      setLoadingPlan(null);
    }
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to open billing portal');
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Portal Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleSubscribe = (plan: Plan) => {
    if (plan.planType === 'free') return;
    if (plan.planType === currentPlanType) return;
    
    setLoadingPlan(plan.id);
    checkoutMutation.mutate({ 
      planType: plan.planType, 
      interval: billingInterval 
    });
  };

  const handleManageSubscription = () => {
    portalMutation.mutate();
  };

  const getPlanButtonText = (plan: Plan) => {
    if (loadingPlan === plan.id) return 'Processing...';
    if (plan.planType === 'free') return 'Current Plan';
    if (plan.planType === currentPlanType) return 'Current Plan';
    
    const currentPlanIndex = PLANS.findIndex(p => p.planType === currentPlanType);
    const targetPlanIndex = PLANS.findIndex(p => p.id === plan.id);
    
    if (targetPlanIndex > currentPlanIndex) {
      return `Upgrade to ${plan.name}`;
    } else {
      return `Switch to ${plan.name}`;
    }
  };

  const isPlanDisabled = (plan: Plan) => {
    if (loadingPlan) return true;
    if (plan.planType === 'free') return true;
    if (plan.planType === currentPlanType) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <a className="inline-flex items-center text-orange-500 hover:text-orange-400" data-testid="link-back-home">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Home
            </a>
          </Link>
          <h1 className="text-3xl font-bold">Plans & Billing</h1>
        </div>

        {isGodAdmin && (
          <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border-amber-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-400" />
                <div>
                  <p className="font-semibold text-amber-200">God Admin Account</p>
                  <p className="text-sm text-amber-300/80">You have full access to all features regardless of plan.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-orange-500" />
              Current Plan: {isGodAdmin ? 'God' : PLAN_DISPLAY_NAMES[currentPlanType]}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {(user as any)?.stripeSubscriptionId 
                ? 'Manage your subscription and billing through Stripe.'
                : 'Choose a plan that fits your needs.'}
            </CardDescription>
          </CardHeader>
          {(user as any)?.stripeSubscriptionId && (
            <CardContent>
              <Button 
                onClick={handleManageSubscription}
                disabled={portalMutation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="button-manage-subscription"
              >
                {portalMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            </CardContent>
          )}
        </Card>

        <div className="flex justify-center mb-6">
          <div className="bg-zinc-900 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                billingInterval === 'monthly' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              data-testid="button-monthly-billing"
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition flex items-center gap-2 ${
                billingInterval === 'yearly' 
                  ? 'bg-orange-600 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              data-testid="button-yearly-billing"
            >
              Yearly
              <Badge className="bg-green-600 text-white text-xs">Save 17%</Badge>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.planType === currentPlanType;
            const price = billingInterval === 'yearly' && plan.yearlyPrice 
              ? Math.round(plan.yearlyPrice / 12) 
              : plan.monthlyPrice;
            
            return (
              <Card 
                key={plan.id}
                className={`relative bg-zinc-900 border-2 transition-all ${
                  plan.popular 
                    ? 'border-purple-500 shadow-lg shadow-purple-500/20' 
                    : isCurrentPlan
                      ? 'border-orange-500'
                      : 'border-zinc-800 hover:border-zinc-700'
                }`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-5 w-5 ${
                      plan.color === 'gray' ? 'text-gray-400' :
                      plan.color === 'blue' ? 'text-blue-400' :
                      plan.color === 'purple' ? 'text-purple-400' :
                      'text-orange-400'
                    }`} />
                    <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                  </div>
                  
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">
                      ${price}
                    </span>
                    {plan.monthlyPrice > 0 && (
                      <span className="text-gray-400">/mo</span>
                    )}
                  </div>
                  
                  {billingInterval === 'yearly' && plan.yearlyPrice && (
                    <p className="text-sm text-green-400">
                      ${plan.yearlyPrice}/year (14 months included)
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handleSubscribe(plan)}
                    disabled={isPlanDisabled(plan)}
                    className={`w-full ${
                      isCurrentPlan 
                        ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                        : plan.popular
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                    data-testid={`button-subscribe-${plan.id}`}
                  >
                    {loadingPlan === plan.id && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {getPlanButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-white mb-1">Can I change plans anytime?</h4>
              <p className="text-sm text-gray-400">Yes, you can upgrade or downgrade at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">What happens when I reach my daily limit?</h4>
              <p className="text-sm text-gray-400">You'll be notified and can upgrade to continue, or wait until the next day for your limit to reset.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Is annual billing worth it?</h4>
              <p className="text-sm text-gray-400">Annual billing gives you 14 months for the price of 12, saving you 17% compared to monthly billing.</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-1">Can I cancel my subscription?</h4>
              <p className="text-sm text-gray-400">Yes, you can cancel anytime from the Stripe billing portal. You'll retain access until the end of your billing period.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;