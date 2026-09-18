# Security rules

How CircuitLab stays safe as it goes public. The repo is **public** (MIT), so anything committed can be read by anyone. How to report a problem is in [SECURITY.md](../../SECURITY.md).

## What we protect, and from what

| What | Threat | Protection |
|---|---|---|
| Users' private projects | Another user or a guest reading or changing them | **Row Level Security on every table** (`auth.uid() = owner_id`), with tests (Phase 3) |
| The admin panel and its data | A normal user reaching it | Role checked **by the database** and server functions, never by hiding a button; admin MFA; an audit log ([ADR 0006](../decisions/0006-admin-panel.md)) |
| API keys (AI, Supabase service key, Cloudflare, Sentry) | Leaked through the public repo or browser code | Keys only in server functions and secret settings (GitHub, Cloudflare, Doppler); only the Supabase **anon** key goes to the browser |
| The owner's money | AI abuse, SMS pumping, surprise bills | AI access by admin approval, per-user limits, a daily budget and kill switch ([ADR 0007](../decisions/0007-ai-assistant.md)); **no card on any free service** ([ADR 0004](../decisions/0004-backend-and-hosting.md)); phone login on hold |
| Visitors' browsers | Injected scripts (XSS) | Escape user text before `innerHTML`; messages use `textContent`; a CSP with no `unsafe-inline` once inline handlers are gone (Phase 0) |
| Saved circuits | Huge or malformed JSON, stored XSS | Validate against the circuit schema on save, cap the size (about 256 KB), allow only known part types |
| Accounts | Throwaway or fake sign-ups | Google or confirmed email only; disposable email domains refused at sign-up |
| Students' data | Privacy law | Store as little as possible (country only, never IP or exact place); privacy policy before launch; check COPPA/GDPR before classrooms |
| The database | Loss | A weekly backup (the free tier has none) and a tested restore |

## Rules

1. **Never commit a secret.** `.env` files are ignored. CI runs a secret scanner (gitleaks) from Phase 0. If a key leaks, **rotate it at once**, then clean up.
2. **Every table gets Row Level Security** before it holds real data, and a test proving one user can't read another's rows.
3. **Never trust the browser:** user ids, roles and limits are checked on the server or in the database.
4. **Admin actions** need the admin role, an MFA session, and write to `audit_log`.
5. **Server functions** check the login token, validate input, rate-limit, and return no internal errors to the browser.
6. **Security headers** on the host: CSP (`default-src 'self'`, `connect-src` limited to our Supabase URL), `frame-ancestors 'none'`, HSTS, `Referrer-Policy`, `X-Content-Type-Options`.
7. **Dependencies:** `npm audit --audit-level=high` in CI and Dependabot updates; a new dependency needs a reason in the PR, and a licence that fits MIT (no GPL code in the app).
8. **AI:** treat everything a user types as untrusted, and don't give the model any tool that writes data.
9. **Phone login** (if ever added): a CAPTCHA, one code per 60 s per number, an India-only allowlist and a daily cap.

## Before each phase merges

The security items in [REVIEW_CHECKLIST.md](REVIEW_CHECKLIST.md) ("Phase PR" and "Deploy") are checked, and new risks go in [RISK_REGISTER.md](../planning/RISK_REGISTER.md).
