import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function PageHeader({ icon, title, description, children }: PageHeaderProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="text-orange-500">{icon}</div>
        <div>
          <h1 className="text-3xl font-bold text-orange-500">{title}</h1>
          <p className="text-zinc-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        {children}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="text-zinc-400 hover:text-orange-400 hover:bg-zinc-800"
          data-testid="button-close-page"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
