import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCircle,
  Package, 
  FileText, 
  FlaskConical,
  Activity,
  Settings,
  Building,
  ChevronDown,
  LogOut
} from 'lucide-react';
import { PeerbridgeLogo } from '@/components/PeerbridgeLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavItem {
  label: string;
  href: string;
  icon?: React.ElementType;
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
  { label: 'Reports', href: '/reports', icon: FileText, badge: 2 },
  { label: 'Research', href: '/research', icon: FlaskConical },
  { label: 'Patient Transmissions', href: '/transmissions', icon: Activity },
  { label: 'Studies', href: '/studies', icon: FileText, badge: 246 },
  { label: 'Site Settings', href: '/settings', icon: Settings },
  { label: 'Site Admin', href: '/admin', icon: Building },
];

export const TopNav: React.FC = () => {
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo + Clinic Name */}
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="flex items-center gap-4">
            <PeerbridgeLogo size="sm" showText={false} />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Dev</span>
              <span className="font-semibold text-primary -mt-0.5">Clinic</span>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 8).map((item) => (
              item.children ? (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger className={`nav-link flex items-center gap-1 ${isActive(item.href) ? 'active' : ''}`}>
                    {item.label}
                    <ChevronDown className="h-3 w-3" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="bg-popover border border-border shadow-lg">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link to={child.href} className="cursor-pointer">
                          {child.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({item.badge})
                    </span>
                  )}
                </Link>
              )
            ))}
          </nav>
        </div>

        {/* Right: Settings + Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            {navItems.slice(8).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-medium">
                A
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg w-48">
              <DropdownMenuItem className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
