import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  FlaskConical,
  Calendar,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronRight,
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
  { label: 'Studies', href: '/studies', icon: BookOpen, badge: 246 },
  { label: 'Patient Transmissions', href: '/events', icon: Calendar, badge: 3 },
  { label: 'Final Reports', href: '/reports', icon: FileText },
  { label: 'Site Settings', href: '/users', icon: Settings },
  { label: 'Research', href: '/research', icon: FlaskConical },
  { 
    label: 'Inventory', 
    href: '/inventory',
    icon: Package,
    children: [
      { label: 'Devices', href: '/inventory/devices' },
      { label: 'Device Shipments', href: '/inventory/shipments' },
    ]
  },
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
                "flex items-center justify-center p-3 rounded-xl mx-2 transition-all duration-200",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                active && "bg-accent/10 text-accent"
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
          "flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl text-sm font-medium transition-all duration-200",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          active && "bg-accent/10 text-accent font-semibold"
        )}
      >
        <Icon className={cn("h-5 w-5", active && "text-accent")} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            active ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
          )}>
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <PeerbridgeLogo size="sm" showText={!collapsed} />
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2">
        <div className="h-px bg-border" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto space-y-1">
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
                        "flex items-center justify-center p-3 rounded-xl mx-2 transition-all duration-200",
                        "text-muted-foreground hover:text-foreground hover:bg-muted",
                        active && "bg-accent/10 text-accent"
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
                    "w-full flex items-center gap-3 px-4 py-2.5 mx-3 rounded-xl text-sm font-medium transition-all duration-200",
                    "text-muted-foreground hover:text-foreground hover:bg-muted",
                    active && "bg-accent/10 text-accent",
                    !collapsed && "max-w-[calc(100%-1.5rem)]"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-accent")} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {isExpanded && (
                  <div className="ml-10 mr-3 mt-1 space-y-0.5 border-l-2 border-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                          "text-muted-foreground hover:text-foreground hover:bg-muted",
                          isActive(child.href) && "text-accent font-medium bg-accent/5"
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

      {/* Collapse Toggle */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            "w-full text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl",
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
