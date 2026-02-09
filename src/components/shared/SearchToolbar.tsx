import React from 'react';
import { Search } from 'lucide-react';

interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode; // Filter buttons etc.
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({ value, onChange, placeholder = 'Search...', children }) => {
  return (
    <div className="flex items-center gap-3">
      {children}
      <div className="relative flex-1 max-w-lg">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 pl-10 pr-4 text-sm bg-secondary/50 border-0 rounded-full placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-card transition-all"
        />
      </div>
    </div>
  );
};
