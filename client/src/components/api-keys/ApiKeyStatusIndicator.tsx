import React from 'react';

interface ApiKeyStatusIndicatorProps {
  status: 'active' | 'inactive' | 'problem';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ApiKeyStatusIndicator: React.FC<ApiKeyStatusIndicatorProps> = ({
  status,
  showLabel = true,
  size = 'md',
}) => {
  // Determine colors based on status
  const colors = {
    active: {
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      dot: 'bg-green-500',
    },
    inactive: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      dot: 'bg-red-500',
    },
    problem: {
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
      dot: 'bg-yellow-500',
    },
  };

  // Determine size classes
  const sizeClasses = {
    sm: {
      container: 'px-1.5 py-0.5 text-[10px]',
      dot: 'w-1.5 h-1.5 mr-1',
    },
    md: {
      container: 'px-2 py-1 text-xs',
      dot: 'w-2 h-2 mr-1.5',
    },
    lg: {
      container: 'px-2.5 py-1.5 text-sm',
      dot: 'w-2.5 h-2.5 mr-2',
    },
  };

  const { bg, text, dot } = colors[status];
  const { container, dot: dotSize } = sizeClasses[size];

  return (
    <div className={`inline-flex items-center rounded-full font-medium ${container} ${bg} ${text}`}>
      <span className={`inline-block rounded-full ${dotSize} ${dot}`}></span>
      {showLabel && <span className="capitalize">{status}</span>}
    </div>
  );
};

export default ApiKeyStatusIndicator;