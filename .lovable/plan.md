

## Create Demo Account

I'll create a demo user account with the credentials you specified and pre-assign them to multiple sites for testing the site-switching functionality.

### Demo Account Details
- **Email**: demo@peerbridge.health
- **Password**: Demo2024!
- **Site Access**: All 3 sites with different roles

### Site Assignments

| Site | Role |
|------|------|
| Dev Clinic | Site Admin |
| Metro Heart Center | Interpreter |
| Coastal Health Partners | Viewer |

This setup will let you test all permission levels and the site switcher across multiple clinics.

### Implementation Steps

1. **Enable email auto-confirm** - Configure authentication to skip email verification for easier testing

2. **Add Sign Up functionality** - Update the Login page to include a registration form so the demo user can be created

3. **Create a seed script** - Add an edge function or admin utility to:
   - Create the demo user via Supabase Auth
   - Insert site memberships for all 3 sites with varied roles

### Technical Details

**Auth Configuration Change:**
- Enable `enable_confirmations = false` in auth settings to auto-confirm signups during development

**Login Page Update:**
- Add a tabbed interface with "Sign In" and "Sign Up" options
- Sign Up form will use the existing `signUp` method from `useAuth` hook

**Demo User Setup Flow:**
After signup, an admin seed migration will insert the site memberships:

```sql
-- After user signs up, their profile is auto-created via trigger
-- Then insert memberships linking to each site with appropriate roles
INSERT INTO site_memberships (user_id, site_id, role_id, is_active, accepted_at)
VALUES 
  (<user_id>, 'dev-clinic-id', 'site-admin-role-id', true, now()),
  (<user_id>, 'metro-heart-id', 'interpreter-role-id', true, now()),
  (<user_id>, 'coastal-health-id', 'viewer-role-id', true, now());
```

### What You'll Be Able to Test
- Sign in with demo credentials
- Switch between 3 different clinic sites
- See different role badges (Admin, Interpreter, Viewer)
- Verify permission-based access controls

