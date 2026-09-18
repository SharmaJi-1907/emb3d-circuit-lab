# 0006 — Admin panel: a separate page, guarded by the database

- **Status:** Proposed (waiting for the owner's OK)
- **Date:** 2026-09-18

## Context

The owner needs one private place to see every service and all the information: users, projects, usage against the free-tier limits, errors and AI cost. It must be kept apart from the pages everyone else uses ([ROADMAP.md](../planning/ROADMAP.md)). The site is public, so anything in the normal app's code can be read by anyone.

## Options considered

1. **An admin screen inside the app, hidden unless you are an admin.** Hiding a button is not security: the code and any queries are still in every user's download.
2. **A separate admin site on its own server.** A strong split, but a second deploy and codebase for one person to maintain.
3. **A separate page in the same repo (`admin.html`, its own Vite entry), with every piece of data guarded by the database.** ✅ Recommended.

## Decision

- `admin.html` is a second Vite entry. Normal users never download its code.
- **The database is the guard, not the page:**
  - `profiles.role` is one of `user`, `teacher` or `admin`, and only an admin can change it. **There is one admin: the owner.** The role is set once in the database, never through the app.
  - Admin data comes from Row Level Security policies or server functions that check `role = 'admin'`.
  - Service keys (Supabase management, Cloudflare, Sentry) are used only inside server functions.
- Admins must use **two-step login** (Supabase MFA). Every admin action is written to an `audit_log` table.
- The panel also handles **AI access requests**: approve, deny, revoke ([ADR 0007](0007-ai-assistant.md)).
- It is built in two steps: v1 with login (Phase 3) and v2 with service health and AI controls (Phase 4). The sections are listed in [ROADMAP.md](../planning/ROADMAP.md).
- Country is taken from the CDN's location header and stored only as a country, never as an exact place or IP address.

## Consequences

- Opening `/admin` without the admin role shows nothing useful, and the tests check this.
- One repo, one deploy and one set of tests.
- The panel shows each free-tier number against its limit, so the owner knows when to upgrade before users notice.
