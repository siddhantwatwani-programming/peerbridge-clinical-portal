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

  useEffect(() => {
    if (isDemoMode) { setHasCheckedSession(true); return; }
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/", { replace: true });
      setHasCheckedSession(true);
    };
    if (!authLoading && !isAuthenticated && !hasCheckedSession) checkSession();
  }, [authLoading, isAuthenticated, hasCheckedSession, navigate, isDemoMode]);

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
    if (isDemoMode) exitDemoMode?.();
    else await signOut();
    navigate("/", { replace: true });
  };

  const getRoleName = (siteId: string): string => {
    const membership = memberships.find((m) => m.site_id === siteId);
    return membership?.role?.name || "Member";
  };

  if (!isDemoMode && (authLoading || sitesLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent border-t-transparent mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading your sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Subtle bg */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[100px] -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/[0.02] rounded-full blur-[80px] translate-y-1/4 -translate-x-1/4" />
      </div>

      {/* Header */}
      <header className="w-full p-6 flex items-center justify-between relative z-10">
        <img src={peerbridgeLogo} alt="Peerbridge Health" className="h-10 w-auto" />
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <Badge variant="outline" className="text-warning border-warning/30 rounded-lg text-xs">
              Demo Mode
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{isDemoMode ? "Demo User" : user?.email}</span>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-foreground rounded-xl text-xs">
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/8 mb-4">
              <Building className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Select a Clinical Site</h1>
            <p className="text-sm text-muted-foreground">Choose a site to access. Switch anytime from the dashboard.</p>
          </div>

          {sites.length === 0 ? (
            <Card className="rounded-2xl border-border/60">
              <CardContent className="py-12 text-center">
                <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                <h2 className="text-lg font-semibold text-foreground mb-2">No Sites Available</h2>
                <p className="text-sm text-muted-foreground mb-6">Contact your administrator for access.</p>
                <Button variant="outline" onClick={handleSignOut} className="rounded-xl">Sign Out</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {sites.map((site) => (
                <Card
                  key={site.id}
                  className="rounded-2xl border-border/60 cursor-pointer transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 group"
                  onClick={() => handleSiteSelect(site.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="h-11 w-11 rounded-xl bg-accent/8 flex items-center justify-center shrink-0 group-hover:bg-accent/12 transition-colors">
                          <Building className="h-5 w-5 text-accent" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{site.name}</h3>
                          {site.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{site.address}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs rounded-lg">
                              <Users className="h-3 w-3 mr-1" />
                              {getRoleName(site.id)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground/60 mt-8">
            Secure HIPAA-compliant session. All data encrypted.
          </p>
        </div>
      </main>
    </div>
  );
};

export default SiteSelection;
