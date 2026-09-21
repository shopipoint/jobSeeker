# RBAC

Hierarchy:

```
Super Admin
    └── Project Manager
            ├── Bidder
            ├── Caller
            └── Developer
```

| Role | Purpose |
|---|---|
| **Super Admin** | Full system access: users, roles, plans, audit |
| **Project Manager** | Owns a team; assigns Bidder / Caller / Developer |
| **Bidder** | Sources jobs and submits applications / bids |
| **Caller** | Outreach, follow-ups, shared pipeline visibility |
| **Developer** | Resume/AI tooling and technical matching |

## Permissions

Defined in `src/lib/rbac.ts`. API routes use `requirePermission(...)`.

- Self-service registration defaults to **Developer**
- Demo accounts (after seed): `admin@jobseeker.local`, `pm@jobseeker.local`, `bidder@jobseeker.local`, `caller@jobseeker.local`, `dev@jobseeker.local` — password `password123`

## UI

- **Profile** (`/profile`) — account, career, preferences, security, subscription preview, role/permissions
- **Team** (`/team`) — visible to Super Admin / Project Manager for role assignment
