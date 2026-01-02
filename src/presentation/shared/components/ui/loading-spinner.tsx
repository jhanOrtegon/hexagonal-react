import React from 'react';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
}: LoadingSpinnerProps): React.JSX.Element => {
  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {text !== undefined && <p className="mt-4 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
