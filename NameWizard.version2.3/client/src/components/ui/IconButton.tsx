import React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
  onClick?: () => void;
}

const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  children, 
  variant = 'default', 
  className = '',
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors',
        variant === 'default' 
          ? 'bg-orange-500 text-white hover:bg-orange-600' 
          : 'border border-orange-500 text-orange-500 hover:bg-orange-500/10',
        className
      )}
    >
      <span className="mr-2">{icon}</span>
      {children}
    </button>
  );
};

export default IconButton;