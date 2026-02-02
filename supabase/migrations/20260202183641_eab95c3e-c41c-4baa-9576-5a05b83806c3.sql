-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Sites (client clinics)
CREATE TABLE public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  timezone TEXT DEFAULT 'America/New_York',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Custom roles per site
CREATE TABLE public.site_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, name)
);

-- 3. User profiles (global identity)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  specialty TEXT,
  license_number TEXT,
  npi_number TEXT,
  is_global_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Site memberships (user <-> site with role)
CREATE TABLE public.site_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.site_roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES public.profiles(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, site_id)
);

-- 5. Site invitations (pending invites)
CREATE TABLE public.site_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role_id UUID REFERENCES public.site_roles(id) ON DELETE SET NULL,
  invited_by UUID REFERENCES public.profiles(id),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, email)
);

-- 6. Audit log for HIPAA compliance
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  site_id UUID REFERENCES public.sites(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's site IDs
CREATE OR REPLACE FUNCTION public.get_user_site_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT site_id FROM public.site_memberships
  WHERE user_id = _user_id AND is_active = true;
$$;

-- Helper function: Check if user is member of a site
CREATE OR REPLACE FUNCTION public.is_site_member(_user_id UUID, _site_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_memberships
    WHERE user_id = _user_id AND site_id = _site_id AND is_active = true
  );
$$;

-- Helper function: Check if user is site admin
CREATE OR REPLACE FUNCTION public.is_site_admin(_user_id UUID, _site_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_memberships sm
    JOIN public.site_roles sr ON sm.role_id = sr.id
    WHERE sm.user_id = _user_id 
      AND sm.site_id = _site_id 
      AND sm.is_active = true
      AND sr.permissions->>'admin' = 'true'
  );
$$;

-- Helper function: Check if user is global admin
CREATE OR REPLACE FUNCTION public.is_global_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_global_admin FROM public.profiles WHERE id = _user_id),
    false
  );
$$;

-- RLS Policies for sites
CREATE POLICY "Users can view sites they are members of"
ON public.sites FOR SELECT
USING (
  public.is_global_admin(auth.uid()) OR 
  id IN (SELECT public.get_user_site_ids(auth.uid()))
);

CREATE POLICY "Global admins can manage sites"
ON public.sites FOR ALL
USING (public.is_global_admin(auth.uid()));

-- RLS Policies for site_roles
CREATE POLICY "Members can view roles in their sites"
ON public.site_roles FOR SELECT
USING (public.is_site_member(auth.uid(), site_id));

CREATE POLICY "Site admins can manage roles"
ON public.site_roles FOR ALL
USING (public.is_site_admin(auth.uid(), site_id));

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their sites"
ON public.profiles FOR SELECT
USING (
  id IN (
    SELECT sm.user_id FROM public.site_memberships sm
    WHERE sm.site_id IN (SELECT public.get_user_site_ids(auth.uid()))
  )
);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- RLS Policies for site_memberships
CREATE POLICY "Users can view memberships in their sites"
ON public.site_memberships FOR SELECT
USING (
  user_id = auth.uid() OR 
  public.is_site_admin(auth.uid(), site_id) OR
  public.is_global_admin(auth.uid())
);

CREATE POLICY "Site admins can manage memberships"
ON public.site_memberships FOR ALL
USING (
  public.is_site_admin(auth.uid(), site_id) OR 
  public.is_global_admin(auth.uid())
);

-- RLS Policies for site_invitations
CREATE POLICY "Site admins can view invitations"
ON public.site_invitations FOR SELECT
USING (public.is_site_admin(auth.uid(), site_id));

CREATE POLICY "Site admins can manage invitations"
ON public.site_invitations FOR ALL
USING (public.is_site_admin(auth.uid(), site_id));

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Site admins can view site audit logs"
ON public.audit_logs FOR SELECT
USING (public.is_site_admin(auth.uid(), site_id));

CREATE POLICY "System can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample sites for development
INSERT INTO public.sites (name, slug, address) VALUES
  ('Dev Clinic', 'dev-clinic', '123 Medical Center Dr, Boston, MA'),
  ('Metro Heart Center', 'metro-heart', '456 Cardiology Ave, New York, NY'),
  ('Coastal Health Partners', 'coastal-health', '789 Beach Blvd, Miami, FL');

-- Insert default roles for Dev Clinic
INSERT INTO public.site_roles (site_id, name, description, permissions, is_default)
SELECT id, 'Viewer', 'Read-only access to patient data and reports', '{"read": true}'::jsonb, false FROM public.sites WHERE slug = 'dev-clinic'
UNION ALL
SELECT id, 'Interpreter', 'Can view and sign off on reports/studies', '{"read": true, "interpret": true}'::jsonb, true FROM public.sites WHERE slug = 'dev-clinic'
UNION ALL
SELECT id, 'Site Admin', 'Full site management including user invitations', '{"read": true, "interpret": true, "admin": true}'::jsonb, false FROM public.sites WHERE slug = 'dev-clinic';

-- Insert default roles for Metro Heart Center
INSERT INTO public.site_roles (site_id, name, description, permissions, is_default)
SELECT id, 'Viewer', 'Read-only access to patient data and reports', '{"read": true}'::jsonb, false FROM public.sites WHERE slug = 'metro-heart'
UNION ALL
SELECT id, 'Interpreter', 'Can view and sign off on reports/studies', '{"read": true, "interpret": true}'::jsonb, true FROM public.sites WHERE slug = 'metro-heart'
UNION ALL
SELECT id, 'Site Admin', 'Full site management including user invitations', '{"read": true, "interpret": true, "admin": true}'::jsonb, false FROM public.sites WHERE slug = 'metro-heart';

-- Insert default roles for Coastal Health Partners
INSERT INTO public.site_roles (site_id, name, description, permissions, is_default)
SELECT id, 'Viewer', 'Read-only access to patient data and reports', '{"read": true}'::jsonb, false FROM public.sites WHERE slug = 'coastal-health'
UNION ALL
SELECT id, 'Interpreter', 'Can view and sign off on reports/studies', '{"read": true, "interpret": true}'::jsonb, true FROM public.sites WHERE slug = 'coastal-health'
UNION ALL
SELECT id, 'Site Admin', 'Full site management including user invitations', '{"read": true, "interpret": true, "admin": true}'::jsonb, false FROM public.sites WHERE slug = 'coastal-health';