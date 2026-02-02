// Multi-tenant site types

export interface Site {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  timezone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteRole {
  id: string;
  site_id: string;
  name: string;
  description: string | null;
  permissions: SitePermissions;
  is_default: boolean;
  created_at: string;
}

export interface SitePermissions {
  read?: boolean;
  interpret?: boolean;
  admin?: boolean;
  [key: string]: boolean | undefined;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  specialty: string | null;
  license_number: string | null;
  npi_number: string | null;
  is_global_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteMembership {
  id: string;
  user_id: string;
  site_id: string;
  role_id: string | null;
  is_active: boolean;
  invited_by: string | null;
  invited_at: string;
  accepted_at: string | null;
  last_accessed_at: string | null;
  created_at: string;
  // Joined data
  site?: Site;
  role?: SiteRole;
}

export interface SiteInvitation {
  id: string;
  site_id: string;
  email: string;
  role_id: string | null;
  invited_by: string | null;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  site_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SiteContextValue {
  currentSite: Site | null;
  sites: Site[];
  memberships: SiteMembership[];
  currentRole: SiteRole | null;
  isLoading: boolean;
  error: string | null;
  switchSite: (siteId: string) => void;
  hasPermission: (permission: keyof SitePermissions) => boolean;
  isGlobalAdmin: boolean;
}
