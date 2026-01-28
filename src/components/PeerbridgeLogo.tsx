import React from 'react';
import { cn } from '@/lib/utils';
import peerbridgeLogo from '@/assets/peerbridge-logo.jpg';
import peerbridgeIcon from '@/assets/peerbridge-icon-new.png';

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

  const iconSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14'
  };

  // Show icon only when showText is false or variant is icon-only
  const showIconOnly = !showText || variant === 'icon-only';

  return (
    <div className={cn('flex items-center', className)}>
      {showIconOnly ? (
        <img 
          src={peerbridgeIcon} 
          alt="Peerbridge Health" 
          className={cn(
            iconSizeClasses[size],
            'object-contain rounded-full'
          )}
        />
      ) : (
        <img 
          src={peerbridgeLogo} 
          alt="Peerbridge Health" 
          className={cn(
            sizeClasses[size],
            'w-auto object-contain'
          )}
        />
      )}
    </div>
  );
};
