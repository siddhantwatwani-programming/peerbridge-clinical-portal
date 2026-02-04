import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, MapPin, Users, ChevronRight, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSite } from "@/contexts/SiteContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import peerbridgeLogo from "@/assets/peerbridge-logo.jpg";

const SiteSelection: React.FC = () => {
  const navigate = useNavigate();
  const { sites, memberships, switchSite, isLoading: sitesLoading, isDemoMode, exitDemoMode } = useSite();
  const { isAuthenticated, isLoading: authLoading, signOut, user } = useAuth();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);

  // Redirect to login if not authenticated - with session fallback check (skip in demo mode)
  useEffect(() => {
    // Skip auth check in demo mode
    if (isDemoMode) {
      setHasCheckedSession(true);
      return;
    }

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/", { replace: true });
      }
      setHasCheckedSession(true);
    };

    // Only check session after initial auth loading completes and hook says not authenticated
    if (!authLoading && !isAuthenticated && !hasCheckedSession) {
      checkSession();
    }
  }, [authLoading, isAuthenticated, hasCheckedSession, navigate, isDemoMode]);

  // Auto-redirect to dashboard if user has only one site
  useEffect(() => {
    if (!sitesLoading && sites.length === 1) {
      switchSite(sites[0].id);
      navigate("/dashboard", { replace: true });
    }
  }, [sites, sitesLoading, switchSite, navigate]);

  const handleSiteSelect = (siteId: string) => {
    switchSite(siteId);
    navigate("/dashboard", { replace: true });
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      exitDemoMode?.();
    } else {
      await signOut();
    }
    navigate("/", { replace: true });
  };

  const getRoleName = (siteId: string): string => {
    const membership = memberships.find((m) => m.site_id === siteId);
    return membership?.role?.name || "Member";
  };

  // Show loading only if not in demo mode and still loading
  if (!isDemoMode && (authLoading || sitesLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col",
        isDemoMode
          ? "bg-gradient-to-br from-slate-50 via-white to-slate-100"
          : "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
      )}
    >
      {/* Header */}
      <header className="w-full p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={peerbridgeLogo} alt="Peerbridge Health" className="h-10 w-auto rounded-lg" />
          {/* <span className={cn(
            "text-xl font-semibold",
            isDemoMode ? "text-foreground" : "text-white"
          )}>Peerbridge Health</span> */}
        </div>
        <div className="flex items-center gap-4">
          {isDemoMode && (
            <Badge variant="outline" className="text-amber-500 border-amber-500/50">
              Demo Mode
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">{isDemoMode ? "Demo User" : user?.email}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className={cn("text-muted-foreground", isDemoMode ? "hover:text-foreground" : "hover:text-white")}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <h1 className={cn("text-3xl font-bold mb-2", isDemoMode ? "text-foreground" : "text-white")}>
              Select a Clinical Site
            </h1>
            <p className="text-muted-foreground">
              Choose the site you want to access. You can switch sites anytime from the dashboard.
            </p>
          </div>

          {sites.length === 0 ? (
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="py-12 text-center">
                <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Sites Available</h2>
                <p className="text-muted-foreground mb-6">
                  You don't have access to any clinical sites yet. Please contact your administrator.
                </p>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sites.map((site) => {
                const roleName = getRoleName(site.id);

                return (
                  <Card
                    key={site.id}
                    className={cn(
                      "bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer transition-all duration-200",
                      "hover:border-primary/50 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/5",
                      "group",
                    )}
                    onClick={() => handleSiteSelect(site.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 shrink-0">
                              <Building className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-lg text-foreground truncate">{site.name}</h3>
                              {site.address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{site.address}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="secondary" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {roleName}
                            </Badge>
                            {site.phone && (
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                {site.phone}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground mt-8">
            Your session is secure and HIPAA compliant. All data is encrypted.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SiteSelection;
