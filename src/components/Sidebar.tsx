import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle,
  Package, 
  FileText, 
  FlaskConical,
  Calendar,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { PeerbridgeLogo } from '@/components/PeerbridgeLogo';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Patients', href: '/patients', icon: Users },
  { label: 'Users', href: '/users', icon: UserCircle },
  { 
    label: 'Inventory', 
    href: '/inventory',
    icon: Package,
    children: [
      { label: 'Devices', href: '/inventory/devices' },
      { label: 'Device Shipments', href: '/inventory/shipments' },
    ]
  },
  { label: 'Reports', href: '/reports', icon: FileText },
  { label: 'Research', href: '/research', icon: FlaskConical },
  { label: 'Events', href: '/events', icon: Calendar, badge: 3 },
  { label: 'Studies', href: '/studies', icon: BookOpen, badge: 246 },
  { label: 'Site Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Inventory']);

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-primary flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-primary-foreground/10">
        <Link to="/dashboard" className="flex items-center gap-3">
          <PeerbridgeLogo size="sm" showText={true} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const active = isActive(item.href);

          return (
            <div key={item.label}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.label)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                      "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
                      active && "bg-accent text-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="ml-12 border-l border-primary-foreground/20">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors",
                            "text-primary-foreground/60 hover:text-primary-foreground",
                            isActive(child.href) && "text-accent-foreground font-medium"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors",
                    "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
                    active && "bg-accent text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="text-xs text-primary-foreground/50">
                      ({item.badge})
                    </span>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
