# 0004 — Backend, hosting and login

- **Status:** Accepted (2026-09-19). Revised 2026-09-18 with the owner's answers.
- **Date:** 2026-09-18

## Context

CircuitLab is going public ([ROADMAP.md](../planning/ROADMAP.md)).

The owner's answers:
- **Most users are in India.**
- The project will be **open source**.
- It must cost **$0 now**.
- The owner has the **GitHub Student Developer Pack**.
- The owner already uses a personal Cloudflare account and doesn't want that bill to grow.
- They would like **phone-number login**.
- The admin panel should show **who is using the lab right now**.

The simulator and 3D Viewer run in the browser, so the backend only handles small things: login, project JSON, statistics and the AI.

## What the research found (September 2026; re-check before launch)

**GitHub Student Developer Pack, relevant offers:**

| Offer | What you get | After it ends |
|---|---|---|
| Azure for Students | $100 credit / 12 months, no card | The subscription is **disabled**, not billed |
| Heroku | $13/month for 24 months, **card required** | Billed at normal price. **Avoid** |
| Appwrite Education | 2 projects with Pro limits (database, auth, functions) while a student | Back to the free plan |
| MongoDB Atlas | $50 credit | Credit ends. It's not Postgres |
| Clerk | Pro while a student (login only) | Back to the free plan |
| Sentry | Team features, 50K errors, 1 year (renewable) | Free plan |
| Doppler | Team plan while a student (secrets) | Free plan |
| Domains (Namecheap .me, .TECH, Name.com) | 1 year free | **Renews at full price** |
| DigitalOcean, Twilio | **No longer in the pack** | — |

Supabase, Firebase, Vercel, Netlify, Render and Railway are **not** in the pack; they have their own free plans.

**Credits run out; free plans don't.** Credits and trial domains are time-limited, and then billing starts. The long-term $0 choices are permanent free plans with **no card on file**.

**Cloudflare billing:** static files are free and unlimited, and on the Free plan Worker requests over 100K/day **fail instead of being charged**. The risk is only an account that already has a paid product (Workers Paid, R2…), because usage there is metered. A **separate free account with no card can't be billed**. That separate accounts are allowed is not verified in the terms, but they are common. GitHub Pages is free for open-source repos, but it has no server functions and can't set security headers.

**Phone (OTP) login in India is never free:**
- Every SMS costs money: about ₹0.15–0.20 through MSG91, plus 18% GST, and more through Twilio.
- **TRAI DLT registration** is required to send SMS to Indian numbers. It costs about ₹5,900/year and usually needs PAN, GST or business papers, which is hard for a student.
- **Firebase phone login needs the Blaze plan** (a card on file). Each SMS is billed, and the India price is not confirmed.
- **Supabase phone login** needs your own SMS provider (MSG91, Twilio…), so you pay per SMS and DLT still applies.
- **WhatsApp OTP** is about ₹0.115 per message and needs no DLT, but it needs a verified Meta Business account.
- **The big risk is "SMS pumping"**: bots requesting thousands of OTPs on your bill. You need a CAPTCHA, rate limits, an India-only allowlist and a daily cap.

## Decision

| Need | Choice | Why |
|---|---|---|
| Site hosting | **Cloudflare, on a new separate free account with no card** (backup: GitHub Pages) | Free, with servers in India, a preview per pull request, and security headers. A separate account keeps it away from the owner's personal bill |
| Database, login, server functions | **Supabase Free, region Mumbai (`ap-south-1`)** | Postgres with Row Level Security, 50K active users/month, a region near the users, no card |
| Login | **Google + email magic link only** (both free). **Temporary/disposable emails are refused** by a "before user created" hook with a blocklist, and emails must be confirmed | The owner's choice. No SMS bill, no DLT, fewer throwaway accounts |
| Phone login | **On hold**; added only if stronger login is needed: WhatsApp OTP, or MSG91 with DLT, behind a CAPTCHA and limits | It can't be free in India today |
| "Who is online" (admin) | **Supabase Realtime Presence** (free: 200 connections at once) plus a `last_seen` time on each profile | Live list in the admin panel, and history |
| Errors | **Sentry**, Student Pack Team plan (1 year), then Free | More than enough for now |
| Secrets | **Doppler** (Student Pack) or GitHub/Cloudflare secret settings | Keys are never in the repo, which is public since it's open source |
| Domain | **Start on the free `*.pages.dev` address** (owner's choice); buy a domain only when users need it | No renewal bill |
| Not used | Heroku (card, then billing), DigitalOcean (left the pack), Firebase phone login (card required) | They would break the $0 rule |

The backup choice for the backend is **Appwrite Education** (in the Student Pack). It is good while the owner is a student, but it goes back to the smaller free plan afterwards, so Supabase is the steadier base.

## Consequences

- **$0 while small.** No card is stored anywhere, so no service can bill by surprise.
- **Supabase Free caveats:** it is paused after 1 week with no use, and it has no backups. A weekly GitHub Action backs it up (and keeps it awake; whether that is allowed by the terms is not verified). What happens at the quota (restricted or charged) is **not confirmed**. With no card it can't be charged, but check before launch.
- **Security depends on Row Level Security** being right, so every table gets tests proving one user can't read another's data.
- **Phone login waits.** Its cost, DLT and fraud risk are written above, so it can be added later on purpose.
- **Leaving is possible:** the database is plain Postgres, and the site is static files.
