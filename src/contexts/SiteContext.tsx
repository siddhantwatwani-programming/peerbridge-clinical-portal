import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Site, SiteRole, SiteMembership, SitePermissions, SiteContextValue } from '@/types/site';
import { User } from '@supabase/supabase-js';

const SiteContext = createContext<SiteContextValue | undefined>(undefined);

const CURRENT_SITE_KEY = 'peerbridge_current_site';
const DEMO_MODE_KEY = 'peerbridge_demo_mode';

// Demo sites for development/testing
const DEMO_SITES: Site[] = [
  {
    id: 'demo-site-1',
    name: 'Metro Heart Center',
    slug: 'metro-heart',
    logo_url: null,
    address: '123 Medical Plaza, Suite 400, New York, NY 10001',
    phone: '(212) 555-0100',
    timezone: 'America/New_York',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-2',
    name: 'Coastal Health Partners',
    slug: 'coastal-health',
    logo_url: null,
    address: '456 Ocean Boulevard, Miami, FL 33101',
    phone: '(305) 555-0200',
    timezone: 'America/New_York',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-3',
    name: 'Summit Cardiology Group',
    slug: 'summit-cardiology',
    logo_url: null,
    address: '789 Mountain View Dr, Denver, CO 80202',
    phone: '(303) 555-0300',
    timezone: 'America/Denver',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-4',
    name: 'Pacific Rhythm Institute',
    slug: 'pacific-rhythm',
    logo_url: null,
    address: '321 Sunset Blvd, Los Angeles, CA 90028',
    phone: '(310) 555-0400',
    timezone: 'America/Los_Angeles',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-5',
    name: 'Heartland Medical Center',
    slug: 'heartland-medical',
    logo_url: null,
    address: '555 Prairie Way, Chicago, IL 60601',
    phone: '(312) 555-0500',
    timezone: 'America/Chicago',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-6',
    name: 'Bayview Cardiac Clinic',
    slug: 'bayview-cardiac',
    logo_url: null,
    address: '88 Harbor Rd, San Francisco, CA 94107',
    phone: '(415) 555-0600',
    timezone: 'America/Los_Angeles',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-7',
    name: 'Peachtree Heart & Vascular',
    slug: 'peachtree-heart',
    logo_url: null,
    address: '200 Peachtree St NE, Atlanta, GA 30303',
    phone: '(404) 555-0700',
    timezone: 'America/New_York',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-8',
    name: 'Lone Star EP Associates',
    slug: 'lone-star-ep',
    logo_url: null,
    address: '700 Main St, Dallas, TX 75201',
    phone: '(214) 555-0800',
    timezone: 'America/Chicago',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-site-9',
    name: 'New England Arrhythmia Center',
    slug: 'new-england-arrhythmia',
    logo_url: null,
    address: '50 State St, Boston, MA 02109',
    phone: '(617) 555-0900',
    timezone: 'America/New_York',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEMO_ROLE: SiteRole = {
  id: 'demo-role',
  site_id: 'demo-site-1',
  name: 'Physician',
  description: 'Demo Physician Role',
  permissions: {
    can_view_patients: true,
    can_edit_patients: true,
    can_view_reports: true,
    can_edit_reports: true,
    can_view_users: true,
    can_edit_users: true,
    can_manage_site: true,
  },
  is_default: false,
  created_at: new Date().toISOString(),
};

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [memberships, setMemberships] = useState<SiteMembership[]>([]);
  const [currentRole, setCurrentRole] = useState<SiteRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

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

  // Enable demo mode with mock sites
  const enableDemoMode = useCallback(() => {
    setIsDemoMode(true);
    setSites(DEMO_SITES);
    setCurrentRole(DEMO_ROLE);
    setIsGlobalAdmin(true);
    const now = new Date().toISOString();
    setMemberships(DEMO_SITES.map(site => ({
      id: `demo-membership-${site.id}`,
      user_id: 'demo-user',
      site_id: site.id,
      role_id: DEMO_ROLE.id,
      is_active: true,
      invited_by: null,
      invited_at: now,
      accepted_at: now,
      last_accessed_at: now,
      created_at: now,
      site,
      role: { ...DEMO_ROLE, site_id: site.id },
    })));
    localStorage.setItem(DEMO_MODE_KEY, 'true');
    setIsLoading(false);
  }, []);

  // Exit demo mode
  const exitDemoMode = useCallback(() => {
    setIsDemoMode(false);
    setSites([]);
    setMemberships([]);
    setCurrentSite(null);
    setCurrentRole(null);
    setIsGlobalAdmin(false);
    localStorage.removeItem(DEMO_MODE_KEY);
    localStorage.removeItem(CURRENT_SITE_KEY);
  }, []);

  // Subscribe to auth changes
  useEffect(() => {
    // Check for demo mode on mount
    const storedDemoMode = localStorage.getItem(DEMO_MODE_KEY);
    if (storedDemoMode === 'true') {
      enableDemoMode();
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchUserSites(currentUser.id);
        } else if (!isDemoMode) {
          // Clear state on logout (but not in demo mode)
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
      } else if (!isDemoMode) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserSites, enableDemoMode, isDemoMode]);

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
    isDemoMode,
    enableDemoMode,
    exitDemoMode,
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
