import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-accent/10 text-accent',
  success: 'bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))]',
  warning: 'bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]',
  danger: 'bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))]',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  muted: 'bg-muted text-muted-foreground',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant = 'default', dot = true }) => {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide",
      variantStyles[variant]
    )}>
      {dot && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          variant === 'default' && 'bg-accent',
          variant === 'success' && 'bg-[hsl(var(--success))]',
          variant === 'warning' && 'bg-[hsl(var(--warning))]',
          variant === 'danger' && 'bg-[hsl(var(--destructive))]',
          variant === 'info' && 'bg-blue-500',
          variant === 'muted' && 'bg-muted-foreground',
        )} />
      )}
      {label}
    </span>
  );
};
