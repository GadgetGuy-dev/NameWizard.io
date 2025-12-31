import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import confetti from 'canvas-confetti';

const SubscriptionSuccessPage = () => {
  const [, navigate] = useLocation();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f97316', '#fb923c', '#fdba74', '#fed7aa']
    });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-900 border-green-600">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-white">Subscription Activated!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-400">
            Thank you for subscribing to NameWizard.io! Your account has been upgraded and you now have access to all the features included in your plan.
          </p>
          
          <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-400">What's next?</p>
            <ul className="text-sm text-left space-y-1 text-gray-300">
              <li>• Upload files and start renaming with AI</li>
              <li>• Access advanced AI models for better suggestions</li>
              <li>• Set up Magic Folders for automation</li>
              <li>• Connect cloud storage integrations</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 hover:bg-orange-700"
            data-testid="button-start-renaming"
          >
            Start Renaming Files
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            onClick={() => navigate('/subscription')}
            variant="outline"
            className="w-full border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
            data-testid="button-view-subscription"
          >
            View Subscription Details
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccessPage;