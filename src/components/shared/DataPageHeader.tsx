import React from 'react';

interface DataPageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // Action buttons
}

export const DataPageHeader: React.FC<DataPageHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};
