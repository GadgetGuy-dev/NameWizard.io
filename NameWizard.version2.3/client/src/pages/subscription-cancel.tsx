import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';

const SubscriptionCancelPage = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-900 border-zinc-700">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
            <XCircle className="h-10 w-10 text-gray-500" />
          </div>
          <CardTitle className="text-2xl text-white">Checkout Cancelled</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-400">
            Your checkout was cancelled and you have not been charged. Your current plan remains unchanged.
          </p>
          
          <div className="bg-zinc-800 rounded-lg p-4 space-y-2">
            <p className="text-sm text-gray-400">No worries! You can:</p>
            <ul className="text-sm text-left space-y-1 text-gray-300">
              <li>• Continue using your current plan</li>
              <li>• Come back and upgrade anytime</li>
              <li>• Contact support if you have questions</li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/subscription')}
              className="w-full bg-orange-600 hover:bg-orange-700"
              data-testid="button-try-again"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full border-zinc-700 text-gray-400 hover:text-white hover:bg-zinc-800"
              data-testid="button-back-home"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCancelPage;