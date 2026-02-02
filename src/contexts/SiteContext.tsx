import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Site, SiteRole, SiteMembership, SitePermissions, SiteContextValue } from '@/types/site';
import { User } from '@supabase/supabase-js';

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const CURRENT_SITE_KEY = 'peerbridge_current_site';

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [memberships, setMemberships] = useState<SiteMembership[]>([]);
  const [currentRole, setCurrentRole] = useState<SiteRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);

  // Fetch user's sites and memberships
  const fetchUserSites = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get profile to check global admin status
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_global_admin')
        .eq('id', userId)
        .single();

      setIsGlobalAdmin(profile?.is_global_admin ?? false);

      // Get memberships with site and role data
      const { data: membershipData, error: membershipError } = await supabase
        .from('site_memberships')
        .select(`
          *,
          site:sites(*),
          role:site_roles(*)
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (membershipError) throw membershipError;

      const membershipsWithData = (membershipData || []).map((m: Record<string, unknown>) => ({
        ...m,
        site: m.site as Site,
        role: m.role as SiteRole,
      })) as SiteMembership[];

      setMemberships(membershipsWithData);

      // Extract sites from memberships
      const userSites = membershipsWithData
        .map(m => m.site)
        .filter((s): s is Site => s !== null && s !== undefined);
      
      setSites(userSites);

      // Restore last selected site or pick first
      const storedSiteId = localStorage.getItem(CURRENT_SITE_KEY);
      const storedSite = userSites.find(s => s.id === storedSiteId);
      const defaultSite = storedSite || userSites[0] || null;

      if (defaultSite) {
        setCurrentSite(defaultSite);
        const membership = membershipsWithData.find(m => m.site_id === defaultSite.id);
        setCurrentRole(membership?.role || null);
        
        // Update last accessed
        await supabase
          .from('site_memberships')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('site_id', defaultSite.id);
      }

    } catch (err) {
      console.error('Error fetching user sites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load sites');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Subscribe to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserSites(currentUser.id);
        } else {
          // Clear state on logout
          setCurrentSite(null);
          setSites([]);
          setMemberships([]);
          setCurrentRole(null);
          setIsGlobalAdmin(false);
          localStorage.removeItem(CURRENT_SITE_KEY);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchUserSites(currentUser.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserSites]);

  // Switch site
  const switchSite = useCallback(async (siteId: string) => {
    const newSite = sites.find(s => s.id === siteId);
    if (!newSite) return;

    setCurrentSite(newSite);
    localStorage.setItem(CURRENT_SITE_KEY, siteId);

    const membership = memberships.find(m => m.site_id === siteId);
    setCurrentRole(membership?.role || null);

    // Update last accessed timestamp
    if (user) {
      await supabase
        .from('site_memberships')
        .update({ last_accessed_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('site_id', siteId);

      // Log audit event
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        site_id: siteId,
        action: 'site_switch',
        details: { from_site: currentSite?.id, to_site: siteId },
      });
    }
  }, [sites, memberships, user, currentSite?.id]);

  // Check permission
  const hasPermission = useCallback((permission: keyof SitePermissions): boolean => {
    if (isGlobalAdmin) return true;
    if (!currentRole?.permissions) return false;
    return currentRole.permissions[permission] === true;
  }, [currentRole, isGlobalAdmin]);

  const value: SiteContextValue = {
    currentSite,
    sites,
    memberships,
    currentRole,
    isLoading,
    error,
    switchSite,
    hasPermission,
    isGlobalAdmin,
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite(): SiteContextValue {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}
