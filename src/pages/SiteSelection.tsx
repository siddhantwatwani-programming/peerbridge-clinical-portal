import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building, MapPin, Users, LogOut, Heart, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSite } from "@/contexts/SiteContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import peerbridgeLogo from "@/assets/peerbridge-logo.jpg";

// Icon set for variety
const siteIcons = [Heart, Activity, Building, Heart, Activity, Building, Heart, Activity, Building];
const siteColors = [
  "from-accent/20 to-accent/5 border-accent/20",
  "from-sky-500/15 to-sky-500/5 border-sky-500/20",
  "from-violet-500/15 to-violet-500/5 border-violet-500/20",
  "from-emerald-500/15 to-emerald-500/5 border-emerald-500/20",
  "from-rose-500/15 to-rose-500/5 border-rose-500/20",
  "from-amber-500/15 to-amber-500/5 border-amber-500/20",
  "from-cyan-500/15 to-cyan-500/5 border-cyan-500/20",
  "from-indigo-500/15 to-indigo-500/5 border-indigo-500/20",
  "from-pink-500/15 to-pink-500/5 border-pink-500/20",
];
const iconColors = [
  "text-accent",
  "text-sky-500",
  "text-violet-500",
  "text-emerald-500",
  "text-rose-500",
  "text-amber-500",
  "text-cyan-500",
  "text-indigo-500",
  "text-pink-500",
];

const SiteSelection: React.FC = () => {
  const navigate = useNavigate();
  const { sites, memberships, switchSite, isLoading: sitesLoading, isDemoMode, exitDemoMode } = useSite();
  const { isAuthenticated, isLoading: authLoading, signOut, user } = useAuth();
  const { profile } = useAuth();
  const [hasCheckedSession, setHasCheckedSession] = useState(false);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);

  useEffect(() => {
    if (isDemoMode) { setHasCheckedSession(true); return; }
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) navigate("/", { replace: true });
      setHasCheckedSession(true);
    };
    if (!authLoading && !isAuthenticated && !hasCheckedSession) checkSession();
  }, [authLoading, isAuthenticated, hasCheckedSession, navigate, isDemoMode]);

  // Don't auto-redirect for single site — let user see the welcome screen
  // (removed the auto-redirect for 1 site)

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

  const displayName = isDemoMode
    ? "Dr. Demo"
    : profile?.full_name || user?.email?.split("@")[0] || "Doctor";

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
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="w-full px-8 py-5 flex items-center justify-between relative z-10">
        <img src={peerbridgeLogo} alt="Peerbridge Health" className="h-10 w-auto" />
        <div className="flex items-center gap-3">
          {isDemoMode && (
            <Badge variant="outline" className="text-warning border-warning/30 rounded-lg text-xs">
              Demo Mode
            </Badge>
          )}
          <span className="text-xs text-muted-foreground hidden sm:block">
            {isDemoMode ? "Demo User" : user?.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground rounded-xl text-xs gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 relative z-10">
        <div className="w-full max-w-5xl">
          {/* Welcome */}
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-accent mb-2 tracking-wide uppercase">
              Welcome back
            </p>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3">
              {displayName}
            </h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              Select a clinical site to get started. You can switch between sites anytime from the dashboard.
            </p>
          </div>

          {/* Sites Grid */}
          {sites.length === 0 ? (
            <div className="text-center py-16">
              <Building className="h-14 w-14 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-lg font-semibold text-foreground mb-2">No Sites Available</h2>
              <p className="text-sm text-muted-foreground mb-6">Contact your administrator for site access.</p>
              <Button variant="outline" onClick={handleSignOut} className="rounded-xl">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sites.map((site, i) => {
                const Icon = siteIcons[i % siteIcons.length];
                const colorClass = siteColors[i % siteColors.length];
                const iconColor = iconColors[i % iconColors.length];
                const isHovered = hoveredSite === site.id;

                return (
                  <button
                    key={site.id}
                    onClick={() => handleSiteSelect(site.id)}
                    onMouseEnter={() => setHoveredSite(site.id)}
                    onMouseLeave={() => setHoveredSite(null)}
                    className={cn(
                      "group relative text-left rounded-2xl border bg-gradient-to-br p-5 transition-all duration-300",
                      colorClass,
                      isHovered
                        ? "shadow-xl shadow-accent/10 scale-[1.02] border-accent/40"
                        : "shadow-sm hover:shadow-lg"
                    )}
                  >
                    {/* Icon */}
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300",
                      "bg-card/80 backdrop-blur-sm shadow-sm",
                      isHovered && "scale-110"
                    )}>
                      <Icon className={cn("h-6 w-6", iconColor)} />
                    </div>

                    {/* Name */}
                    <h3 className="font-semibold text-foreground text-[15px] mb-1.5 truncate">
                      {site.name}
                    </h3>

                    {/* Address */}
                    {site.address && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5 mb-3 line-clamp-2">
                        <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>{site.address}</span>
                      </p>
                    )}

                    {/* Role badge */}
                    <Badge
                      variant="secondary"
                      className="text-[11px] rounded-lg font-medium"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      {getRoleName(site.id)}
                    </Badge>

                    {/* Select indicator */}
                    <div className={cn(
                      "absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300",
                      isHovered
                        ? "bg-accent text-accent-foreground shadow-md"
                        : "bg-card/60 text-muted-foreground/40"
                    )}>
                      <span className="text-xs font-bold">→</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground/50 mt-10">
            Secure HIPAA-compliant session · All data encrypted · Multi-site access
          </p>
        </div>
      </main>
    </div>
  );
};

export default SiteSelection;
