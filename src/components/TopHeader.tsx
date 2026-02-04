import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, Settings, LogOut, Building, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/hooks/useAuth';
import { SiteSwitcherModal } from '@/components/SiteSwitcherModal';

export const TopHeader: React.FC = () => {
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const { currentSite, currentRole, sites, isLoading } = useSite();
  const { profile, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const displayName = profile?.full_name || profile?.email || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
        {/* Site Name with switcher indicator */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          ) : currentSite ? (
            <button
              onClick={() => setSiteSwitcherOpen(true)}
              className="flex items-center gap-2 hover:bg-accent/50 px-3 py-2 rounded-lg transition-colors group"
            >
              <Building className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">
                {currentSite.name}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ) : (
            <span className="text-lg font-semibold text-foreground">Dev Clinic</span>
          )}

          {currentRole && (
            <Badge variant="secondary" className="text-xs">
              {currentRole.name}
            </Badge>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {profile && (
            <span className="text-sm text-muted-foreground hidden md:block">
              {profile.specialty || 'Clinician'}
            </span>
          )}
          
          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center focus:outline-none">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium hover:bg-primary/20 transition-colors">
                {isAuthenticated ? initials : <UserCircle className="h-6 w-6" />}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border shadow-lg w-56">
              {profile && (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {sites.length > 1 && (
                <>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => setSiteSwitcherOpen(true)}
                  >
                    <Building className="mr-2 h-4 w-4" />
                    Switch Site
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {sites.length}
                    </Badge>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}

              <DropdownMenuItem className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {isAuthenticated ? (
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <SiteSwitcherModal 
        open={siteSwitcherOpen} 
        onOpenChange={setSiteSwitcherOpen} 
      />
    </>
  );
};
