import React from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import { CheckIcon } from 'lucide-react';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '0',
      description: 'Basic file renaming for personal use',
      features: [
        'Upload up to 50 files per month',
        'Basic renaming patterns',
        'Manual file organization',
        'Standard support'
      ],
      cta: 'Get Started',
      ctaLink: '/auth',
      popular: false
    },
    {
      name: 'Pro',
      price: '9.99',
      description: 'Advanced features for power users',
      features: [
        'Upload up to 1,000 files per month',
        'AI-powered content analysis',
        'Batch processing',
        'OCR text extraction',
        'Custom naming patterns',
        'Priority support'
      ],
      cta: 'Upgrade Now',
      ctaLink: '/auth',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '29.99',
      description: 'Complete solution for teams and businesses',
      features: [
        'Unlimited file uploads',
        'Advanced AI content analysis',
        'Team collaboration features',
        'Custom integrations',
        'Audit logs and analytics',
        'Dedicated support manager'
      ],
      cta: 'Contact Sales',
      ctaLink: '/contact',
      popular: false
    }
  ];

  return (
    <MainLayout>
      <div className="py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Choose the plan that works best for your needs. All plans include our core features with different usage limits and capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`bg-zinc-900 border ${plan.popular ? 'border-orange-500' : 'border-zinc-800'} rounded-xl p-8 relative`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-zinc-400">/month</span>
              </div>
              <p className="text-zinc-400 mb-6">{plan.description}</p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-orange-500 mr-2 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a 
                href={plan.ctaLink} 
                className={`block text-center py-3 px-6 rounded-lg font-medium transition-colors ${
                  plan.popular 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'border border-orange-500 text-orange-500 hover:bg-orange-500/10'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Can I switch plans later?</h3>
              <p className="text-zinc-400">Yes, you can upgrade or downgrade your plan at any time. Changes will be applied immediately and your billing will be prorated accordingly.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Do you offer refunds?</h3>
              <p className="text-zinc-400">We offer a 14-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 14 days of purchase for a full refund.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-zinc-400">We accept all major credit cards, PayPal, and Apple Pay. Enterprise customers can also pay via invoice.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;