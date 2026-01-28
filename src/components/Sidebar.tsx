import React from 'react';
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
  ChevronRight,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { PeerbridgeLogo } from '@/components/PeerbridgeLogo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
  { label: 'Patient Transmissions', href: '/events', icon: Calendar, badge: 3 },
  { label: 'Studies', href: '/studies', icon: BookOpen, badge: 246 },
  { label: 'Platform Analytics', href: '/analytics', icon: LayoutDashboard },
  { label: 'Site Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = React.useState<string[]>(['Inventory']);

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

  const NavItemContent = ({ item, active }: { item: NavItem; active: boolean }) => {
    const Icon = item.icon;
    
    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              to={item.href}
              className={cn(
                "flex items-center justify-center p-3 transition-colors",
                "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
                active && "bg-accent text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            <p>{item.label}</p>
            {item.badge && <span className="ml-1 text-xs">({item.badge})</span>}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
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
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-primary flex flex-col z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-primary-foreground/10 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <PeerbridgeLogo size="sm" showText={!collapsed} />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedItems.includes(item.label);
          const active = isActive(item.href);

          if (hasChildren) {
            if (collapsed) {
              return (
                <Tooltip key={item.label} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center justify-center p-3 transition-colors",
                        "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
                        active && "bg-accent text-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-popover text-popover-foreground">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <div key={item.label}>
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
              </div>
            );
          }

          return (
            <div key={item.label}>
              <NavItemContent item={item} active={active} />
            </div>
          );
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-primary-foreground/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10",
            collapsed ? "justify-center" : "justify-start gap-2"
          )}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <>
              <PanelLeftClose className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
};
