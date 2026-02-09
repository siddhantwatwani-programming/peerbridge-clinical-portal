import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCircle, Settings, LogOut, Building, ChevronDown, Bell, ArrowLeftRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
      <header className="h-16 bg-card/80 backdrop-blur-md border-b border-border/60 flex items-center justify-between px-6 sticky top-0 z-40">
        {/* Left — Site */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-5 w-32 bg-muted animate-pulse rounded-lg" />
          ) : currentSite ? (
            <button
              onClick={() => setSiteSwitcherOpen(true)}
              className="flex items-center gap-2 hover:bg-muted px-3 py-2 rounded-xl transition-all duration-200 group"
            >
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Building className="h-4 w-4 text-accent" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                {currentSite.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          ) : (
            <span className="text-sm font-semibold text-foreground">Dev Clinic</span>
          )}

          {currentRole && (
            <Badge variant="secondary" className="text-xs font-medium rounded-lg">
              {currentRole.name}
            </Badge>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {profile && (
            <span className="text-xs text-muted-foreground hidden md:block mr-2">
              {profile.specialty || 'Clinician'}
            </span>
          )}

          {/* Switch Sites — always visible */}
          {sites.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSiteSwitcherOpen(true)}
              className="rounded-xl text-xs gap-1.5 border-border/60 hover:border-accent/40 hover:bg-accent/5 transition-all"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Switch Sites</span>
            </Button>
          )}

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent" />
          </Button>
          
          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center focus:outline-none">
              <div className="h-9 w-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm hover:bg-accent/20 transition-colors">
                {isAuthenticated ? initials : <UserCircle className="h-5 w-5" />}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border border-border shadow-xl rounded-xl w-56">
              {profile && (
                <>
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-foreground">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}
              
              {sites.length > 1 && (
                <>
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-lg mx-1"
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

              <DropdownMenuItem className="cursor-pointer rounded-lg mx-1">
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer rounded-lg mx-1">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {isAuthenticated ? (
                <DropdownMenuItem 
                  className="cursor-pointer text-destructive focus:text-destructive rounded-lg mx-1"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer text-destructive rounded-lg mx-1">
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
