import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, ChevronLeft } from 'lucide-react';
import { Link } from 'wouter';

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'month',
      description: 'Perfect for trying out NameWizard',
      features: [
        'Up to 100 file renames per month',
        'Basic AI models (GPT-3.5)',
        'Standard renaming patterns',
        'Email support',
        'Basic file organization'
      ],
      limitations: [
        'Limited to 100 files/month',
        'No OCR processing',
        'Basic AI models only'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29.99',
      period: 'month',
      description: 'Best for professionals and power users',
      features: [
        'Unlimited file renaming',
        'Advanced AI models (GPT-4o, Claude)',
        'OCR text extraction',
        'Magic folder organization',
        'Custom naming patterns',
        'Batch processing',
        'Priority support',
        'Cloud storage integration',
        'Advanced analytics'
      ],
      limitations: [],
      buttonText: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99.99',
      period: 'month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team collaboration tools',
        'Advanced security controls',
        'Custom integrations',
        'API access',
        'Dedicated account manager',
        '24/7 phone support',
        'Custom training',
        'SLA guarantees'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <a className="inline-flex items-center text-orange-500 hover:text-orange-400">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </a>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your <span className="text-orange-500">NameWizard</span> Plan
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your file organization with AI-powered renaming. Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`bg-gray-800 border-gray-700 relative ${
                plan.popular ? 'border-orange-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-600 text-white px-3 py-1">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-orange-400">{plan.price}</span>
                  <span className="text-gray-400">/{plan.period}</span>
                </div>
                <CardDescription className="text-gray-400 mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium">What's included:</h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.limitations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-gray-400 font-medium">Limitations:</h4>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-500 text-sm">• {limitation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-orange-600 hover:bg-orange-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Yes! Pro plans include a 14-day free trial. No credit card required to start.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">How secure is my data?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Your files are processed securely and never stored permanently. All data is encrypted in transit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;