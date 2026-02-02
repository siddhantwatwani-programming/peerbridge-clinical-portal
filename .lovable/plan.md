

## Assign Site Memberships to Existing Users

Your existing users need site memberships to access the multi-clinic switching feature. I'll assign each doctor to different clinics with varied roles for testing.

### Proposed Site Assignments

| Doctor | Email | Clinics & Roles |
|--------|-------|-----------------|
| Ravi | demo@yopmail.com | Dev Clinic (Admin), Metro Heart Center (Interpreter), Coastal Health Partners (Viewer) |
| Raju | demo2@yopmail.com | Metro Heart Center (Admin), Coastal Health Partners (Interpreter) |
| Raju | demo3@yomail.com | Coastal Health Partners (Admin) |
| Mahesh | demo5@yopmail.com | Dev Clinic (Interpreter), Metro Heart Center (Viewer) |

### What This Enables

After implementation, each doctor can:
- Sign in with their existing password
- See the site switcher in the header
- Switch between their assigned clinics
- View different role badges based on their access level

### Technical Implementation

**Database Migration:**
Insert site_memberships records linking each user to their assigned sites with appropriate roles:

```sql
INSERT INTO site_memberships (user_id, site_id, role_id, is_active, accepted_at)
VALUES 
  -- demo@yopmail.com assignments
  ('user-id', 'dev-clinic-id', 'admin-role-id', true, now()),
  ('user-id', 'metro-heart-id', 'interpreter-role-id', true, now()),
  -- ... additional assignments
```

### Login Credentials

After approval, you can log in with any of these emails using the password you created during signup. If you forgot the password, I can help reset it.

