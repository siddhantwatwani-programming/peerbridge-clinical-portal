import React from 'react';
import { cn } from '@/lib/utils';
import peerbridgeLogo from '@/assets/peerbridge-logo.jpg';

interface PeerbridgeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only';
}

export const PeerbridgeLogo: React.FC<PeerbridgeLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '',
  variant = 'full'
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14'
  };

  return (
    <div className={cn('flex items-center', className)}>
      <img 
        src={peerbridgeLogo} 
        alt="Peerbridge Health" 
        className={cn(
          sizeClasses[size],
          'w-auto object-contain'
        )}
      />
    </div>
  );
};
