import React from 'react';
import { cn } from '@/lib/utils';

interface PeerbridgeLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const PeerbridgeLogo: React.FC<PeerbridgeLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon - Orange circle with stylized heart/connection symbol */}
      <div className={`${sizeClasses[size]} aspect-square relative`}>
        <svg viewBox="0 0 60 60" className="w-full h-full">
          {/* Orange circle background */}
          <circle cx="30" cy="30" r="28" fill="hsl(14, 87%, 55%)" />
          
          {/* White connection/heart symbol - three connected circles */}
          <g fill="white">
            {/* Top circle */}
            <circle cx="30" cy="18" r="6" />
            {/* Bottom left circle */}
            <circle cx="20" cy="36" r="6" />
            {/* Bottom right circle */}
            <circle cx="40" cy="36" r="6" />
            
            {/* Connecting lines (thicker) */}
            <path 
              d="M30 24 L22 32 M30 24 L38 32 M24 36 L36 36" 
              stroke="white" 
              strokeWidth="4" 
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight", textSizeClasses[size], "text-primary-foreground")}>
            PEERBRIDGE
          </span>
          <span className="text-xs tracking-[0.3em] text-primary-foreground/60 uppercase -mt-0.5">
            Health
          </span>
        </div>
      )}
    </div>
  );
};
