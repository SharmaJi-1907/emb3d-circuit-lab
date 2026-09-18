# Roadmap: from demo to a real product

_Started 2026-09-18, after the #32 audit. Status: **draft, under discussion**. Nothing here is built yet. [FIX_PLAN.md](../archive/FIX_PLAN.md) is finished, so the app is stable; this plan is about making it **useful**, then opening it to everyone._

Contents: [Where we are](#where-we-are) · [What we need](#what-we-need) · [What the research found](#what-the-research-found) · [How the system fits together](#how-the-system-fits-together) · [Free tier now, room to grow](#free-tier-now-room-to-grow) · [Login](#login) · [Pages](#pages) · [Admin panel](#admin-panel) · [Decisions](#decisions) · [Phases](#phases) · [Open questions](#open-questions)

## Where we are

CircuitLab works as a demo: every button works and there are 220 tests. It is not yet a tool people can rely on.

| Screen | Why it is still a demo |
|---|---|
| Simulator | DC only, so nothing changes over time and the scope draws flat lines. The meters read fixed points, not where you probe. Values can't be edited. It is a grid, not a breadboard. A wire can't be deleted, and there is no undo |
| Board Explorer | Every board is the same rectangle with dots. A pin only shows its name |
| 3D Viewer | The models are boxes built in code and don't look like the real parts |
| AI | 9 stored answers matched by keywords |
| Everything | No login: projects stay in one browser. No server, no deploy, no CI |

## What we need

The owner's requirements (2026-09-18):

1. **A real, working tool**, not a demo: the simulator, boards, 3D and AI must be useful.
2. **Open to everyone**: the owner, their students and others, in **different places**. There are few users now, but the system must grow without a rebuild.
3. **Free tier to start**: no monthly bill until usage needs one.
4. **Secure login**: accounts, private and shared projects.
5. **An admin panel**: one private place where the owner sees every service and all the information (users, projects, usage, errors, costs), kept **separate** from the pages everyone else uses.
6. **Portfolio quality**: clean code, tests, docs and a live link.

**Answers so far (2026-09-18):**
- Most users are **in India**.
- The project is **open source**.
- The owner has the **GitHub Student Developer Pack**, and their personal Cloudflare bill must not grow.
- They want **phone-number login**, and the admin panel should show **who is using the lab right now**.
- **The owner is the only admin.**
- **Guests may use the lab** without logging in.
- Licence: **MIT**.
- Start on the free **`*.pages.dev`** address, and buy a domain only when users need it.
- **AI:** everyone sees it, but a user must **request access and the admin approves** it. Later, **our own open model** runs on our server and is fine-tuned (Phase 8).
- **Login:** **Google and email only**, with **no temporary (disposable) email addresses**. Phone login is on hold, to be added only if stronger login is needed.

## What the research found

**Simulators (Wokwi, Tinkercad, Falstad, EveryCircuit, CircuitLab.com, EasyEDA, Proteus):**
- **Simulation runs in the user's browser**, in a Web Worker. The server only compiles code and stores and shares projects. That is why they are cheap to run, and why this plan can stay on a free tier.
- **Analog circuits need time steps**: modified nodal analysis, where capacitors and inductors become "companion models" and diodes and transistors are solved by repeating the step until it settles (Newton iteration). That is what makes a capacitor charge and an LED blink.
- **One saved format**: Wokwi's `diagram.json` is a list of parts (type, position, attributes) plus a list of connections (`"part:pin" → "part:pin"`). Saving, sharing, undo and tests all use it.
- **The drawing and the maths are kept apart.** A **breadboard is one part** with rows and rails already connected. **Probes are parts** you wire to a point.
- **Microcontrollers** are emulated in the browser. Wokwi's `avr8js` (Arduino Uno) and `rp2040js` (Pi Pico) are MIT-licensed, and the code is compiled on a server by `arduino-cli`. No free, permissive ESP32 emulator exists.
- **Multi-user** means accounts, public/unlisted/private projects, share links, "fork", and classrooms with a join code. No product found does live co-editing.
- **Licences**: we may build on Wokwi's MIT libraries, `eecircuit-engine` (ngspice in WebAssembly, MIT) and core ngspice (BSD). We must **not** copy code from Falstad CircuitJS, SimulIDE, QEMU or simavr (all GPL).

**Accounts and hosting**: Supabase in Mumbai (login, Postgres with Row Level Security, storage, server functions, "who is online"), the site on a **separate free Cloudflare account with no card**, Sentry and Doppler from the Student Pack, CI with GitHub Actions. Details, the Student Pack offers and the reasons are in [ADR 0004](../decisions/0004-backend-and-hosting.md).

**Phone login in India is never free.** Every SMS costs money (about ₹0.15–0.20), and TRAI DLT registration (about ₹5,900 a year, usually needing business papers) is required. So the launch uses **Google + email link** (free), and phone login is added later, on purpose (see [Login](#login)).

**3D boards**: the owner's `pcb-board-3d-model` skill builds researched, realistic GLB models. See Phase 2.

## How the system fits together

```
 Visitor's browser (anywhere)                    Owner's browser
 ┌──────────────────────────────────┐            ┌─────────────────────┐
 │ CircuitLab app  (index.html)     │            │ Admin panel         │
 │  screens, 3D, Canvas             │            │  (admin.html)       │
 │  Simulator engine in a Web Worker│            │  admins only        │
 └──────┬───────────────┬───────────┘            └─────────┬───────────┘
        │ static files  │ login, data, AI                  │
        ▼               ▼                                  ▼
 ┌──────────────┐  ┌──────────────────────────────────────────────────┐
 │ Cloudflare   │  │ Supabase (Mumbai region)                         │
 │ CDN, global: │  │  Auth: Google, GitHub, email link                │
 │ app files,   │  │  Postgres + Row Level Security: profiles,        │
 │ 3D models    │  │    projects, classes, usage, audit log           │
 │ (GLB)        │  │  Edge Functions: AI proxy, admin stats           │
 └──────────────┘  └───────────────────────┬──────────────────────────┘
                                           │ server-side keys only
                     ┌─────────────────────┴───────────┐
                     ▼                                 ▼
               AI model API                 Build service (Phase 5):
               (per-user limits)            arduino-cli in a container
 Sentry (errors) and GitHub Actions (tests, deploy) watch everything.
```

**Why this shape:**
- **Heavy work runs on the user's own computer** (simulation, 3D), so more users don't cost more server time.
- **Files come from a global CDN**, so a student in another city or country gets the app from a nearby server.
- **Only small things travel to the database** (login, project JSON, stats), so one database region is enough for a long time.
- **The admin panel is a separate page** with its own code: normal users never download it. Access is enforced by the database (a user's role), not by hiding a button.

## Free tier now, room to grow

**Free limits we depend on** (checked September 2026; **re-check before launch**, they change):

| Service | Free tier | What uses it | Watch out |
|---|---|---|---|
| Cloudflare (static assets), **new account, no card** | Unlimited static requests; Workers 100k requests/day (over that they fail, not charged) | App files, 3D models | Never add a card or a paid product to this account. Keep 3D models here, not in Supabase storage |
| Supabase | 50k monthly active users, 500 MB database, 1 GB storage, 5 GB egress, 500k function calls, 2 projects | Login, projects, AI proxy, admin stats | **Paused after 1 week with no activity. No automatic backups.** |
| Sentry (Student Pack) | Team plan for 1 year (50K errors), then Free (5K/month) | Error tracking | Renew each year while a student |
| Doppler (Student Pack) | Team plan while a student | Secrets | The repo is public: never commit a key |
| GitHub Actions | Free for public repos (limited minutes for private) | Tests, deploy | Playwright runs are the main cost |
| AI model API | **Not free**: paid per token | Phase 4 | Daily budget and per-user limits from day one |
| Phone OTP (later) | **Not free** in India: about ₹0.15–0.20 per SMS + DLT, or about ₹0.115 per WhatsApp message | Login, later | CAPTCHA, rate limits, India-only, daily cap |

**Rule for every service: no card on file unless we decide to pay.** Student Pack *credits* (Azure $100, MongoDB $50, a free domain for year 1) run out; Heroku and Firebase phone login need a card, so they are not used.

**How it stays free while small:**
- Simulation and 3D run in the browser, so server use grows slowly.
- 3D models are compressed (aim: under 1 MB each) and served from Cloudflare, not Supabase, to save egress.
- Projects are stored as small JSON with a size cap (about 256 KB).
- **Guests can use the app without logging in** (saved in the browser, like today). Login is needed only to save to the cloud, share or join a class.
- The AI has a per-user daily limit and a global daily budget. It can be switched off from the admin panel.
- A weekly GitHub Action backs up the database to private storage. It also keeps the project from being paused; whether that is allowed by Supabase's terms is not verified yet.

**When to pay** (the admin panel shows each number next to its limit):

| Sign | Limit reached | Step up |
|---|---|---|
| Database near 400 MB, egress near 4 GB/month, or more than about 1,000 active users | Supabase free | Supabase Pro (about $25/month): daily backups, no pausing |
| Students outside the database region complain of slow saves | Latency | A read replica in a second region (Pro); the CDN already covers files |
| AI spend near its budget | Budget | Raise the budget, or make AI a paid or teacher-only feature |
| Many code builds (Phase 5) | Build service | Its own paid container tier |

**Why growing won't need a rebuild:** the database is plain Postgres (it can move to any Postgres host), the site is static files (any CDN), the simulator runs in the browser (no server to scale), and every piece has a written limit and a next step.

## Login

| Method | When | Cost | Why |
|---|---|---|---|
| Google | Launch | Free | Nearly every student in India has a Google account |
| Email magic link (no password) | Launch | Free | For people without Google. No passwords stored by us. **Temporary/disposable email addresses are refused** at sign-up (a blocklist checked by a Supabase "before user created" hook), and the email must be confirmed |
| Phone OTP (WhatsApp, or SMS via MSG91 with DLT) | **On hold**: only if stronger login is needed | ₹0.12–0.20 per login + DLT | It can't be free in India |
| Guests | Always | Free | Anyone can use the lab without logging in; login is only for cloud saves, sharing and classes |

GitHub login is not offered (owner's choice: Google and email only). Phone login, if it comes, gets a CAPTCHA, one code per 60 seconds per number, an India-only allowlist and a daily cap, because SMS-pumping bots can run up the bill.

## Pages

Three separate front doors, each with its own job:

| Page | Address (example) | Who | What it shows |
|---|---|---|---|
| **Landing** | `/` | Everyone | What CircuitLab is, screenshots or a short video, "Open the lab", "Log in", featured projects |
| **The lab (app)** | `/app/#dashboard` … | Everyone (guests too) | The 9 screens of today, improved phase by phase |
| **Log in / sign up** | `/app/#login` | Everyone | Google or email link (no temporary emails). No passwords stored by us |
| **My projects** | `/app/#projects` | Logged-in users | Cloud projects, share settings, fork, delete |
| **Shared project** | `/p/<id>` | Anyone with the link | Read-only circuit, "Open a copy" |
| **Public gallery** | `/gallery` | Everyone | Public projects, search, featured |
| **Profile and settings** | `/app/#settings` | Logged-in users | Name, theme, delete my account and data |
| **Classes** (Phase 6) | `/app/#classes` | Teachers, students | Join code, assignments, hand in |
| **Help and docs** | `/help` | Everyone | How to use each screen, keyboard shortcuts |
| **Privacy and terms** | `/privacy`, `/terms` | Everyone | Needed before real users sign up |
| **AI assistant** | `/app/#ai` | Everyone sees it; **approved users** use it | Others see "Request access" (login needed) |
| **Admin panel** | `/admin` | **The owner only** | See the next section |

## Admin panel

A separate page (`admin.html`, its own Vite entry), so its code never reaches normal users. What protects it is the database, not the page:
- Each user has a `role` in `profiles` (`user`, `teacher`, `admin`), and only an admin can change roles.
- Every admin query goes through Row Level Security policies or a server function that checks `role = 'admin'`.
- Admins must use two-step login (Supabase MFA). Every admin action is written to an `audit_log` table.

**What the owner sees:**

| Section | Shows | Where the data comes from |
|---|---|---|
| Overview | Users today, this week and in total; new sign-ups; active projects; errors today | Own database (SQL views) and Sentry |
| **Online now** | Who is using the lab right now and on which screen, plus "last seen" for everyone | Supabase Realtime Presence (free: 200 at once) and `profiles.last_seen` |
| Service health | Each free-tier number against its limit (database size, storage, egress, active users, function calls, AI spend), with a warning at 80% | Supabase and Cloudflare usage APIs, called from a server function with a server-side token |
| Users | List, search, role, last seen, country (from the CDN's location header, stored only as a country), block or delete | Own database |
| Projects | Count, public projects, reported projects, remove or feature | Own database |
| **AI requests** | Who asked for AI and why; approve, deny, revoke | `ai_access_requests` table ([ADR 0007](../decisions/0007-ai-assistant.md)) |
| AI usage | Questions per day, tokens, cost or server load, top users, on/off switch, daily budget | Own usage table |
| Errors | Latest errors, with a link to Sentry | Sentry |
| Classes (Phase 6) | Classes, teachers, student counts | Own database |
| Content | Parts, boards, datasheets: read-only at first, editing later | Repo files first, then the database |
| Announcements | Messages that appear in everyone's notifications drawer | Own database |
| Audit log | Who did what, and when | Own database |

**Built in two steps:**
1. **Admin v1 (Phase 3, with login):** roles, MFA, Overview, **Online now**, Users, Projects, the audit log, and links to the Supabase, Cloudflare and Sentry dashboards.
2. **Admin v2 (Phase 4 onwards):** service health numbers pulled into the panel, **AI requests**, AI usage and switch, announcements, classes and content.

## Decisions

Each decision gets a record in [decisions/](../decisions/). "Proposed" means waiting for the owner's OK.

| # | Decision | Recommended | Status |
|---|---|---|---|
| 1 | Backend, hosting and login | Supabase (Mumbai) + a separate free Cloudflare account on `*.pages.dev` + Sentry and Doppler (Student Pack); Google and email login (no temporary emails), phone on hold ([ADR 0004](../decisions/0004-backend-and-hosting.md)) | Proposed |
| 2 | Where the simulator runs, and whose engine | Our own time-step engine in a Web Worker, tested against ngspice ([ADR 0005](../decisions/0005-simulator-engine.md)) | Proposed |
| 3 | Admin panel | A separate page for the owner only, role checked by the database, MFA, audit log ([ADR 0006](../decisions/0006-admin-panel.md)) | Proposed |
| 3b | AI assistant | Access by request, approved by the admin; one server function with the model behind a switch; our own fine-tuned model in Phase 8 ([ADR 0007](../decisions/0007-ai-assistant.md)) | Proposed |
| 4 | Language | Stay on vanilla JS and add type checks with JSDoc + `checkJs`; no rewrite | Proposed |
| 5 | Microcontrollers | Arduino Uno first (`avr8js`), then Pico (`rp2040js`). No ESP32 in the simulator | Proposed |
| 6 | 3D boards | The owner's `pcb-board-3d-model` skill | Agreed |
| 7 | CircuitLab's own licence | **MIT** | Agreed: a `LICENSE` file is added in Phase 0 |

## Phases

Each phase has its own **phase branch**; its work is done on feature branches merged into it, and the phase goes to `main` in one PR only when it is fully tested and verified, then tagged as a version ([ADR 0008](../decisions/0008-phase-branches.md), [GIT_WORKFLOW.md](../guides/GIT_WORKFLOW.md)). Times assume part-time solo work.

### Phase 0: Foundations (1–2 weeks)
- **What:** the MIT `LICENSE` file and `"license": "MIT"` in `package.json`; CI on GitHub Actions (lint, type check, build, Playwright with bundled Chromium); deploy to Cloudflare with a preview link per pull request; Sentry; security headers (CSP), which first means replacing inline `onclick` handlers with `addEventListener`; JSDoc + `checkJs`; one circuit format (`diagram.json` style) with a validator, and old saved projects converted to it.
- **Why:** everything after this is safer when every push is tested and deployed automatically. A CSP stops injected scripts. One format keeps saving, sharing and undo simple.
- **Done when:** a pull request shows test results and a working preview link.

### Phase 1: Simulator v2 (5–7 weeks)
- **What:**
  - an engine in a Web Worker: time steps, companion models, Newton iteration, a sparse solver, unit-tested against hand calculations and ngspice
  - a breadboard, and select, move, rotate and delete for parts **and wires**
  - a properties panel and undo/redo
  - probes and scope channels as parts, and live current dots
  - more parts: potentiometer, button, inductor, transistors, op-amp, signal generator, 555, logic gates
- **Why:** the simulator is the core of the product, and the thing people will judge it by.
- **Done when:** a 555 on a breadboard blinks an LED at the frequency its datasheet formula gives, and the scope shows the capacitor charging.

### Phase 2: Real boards and 3D (2–3 weeks)
- **What:**
  - Models made with the owner's skill: Uno first (already built), then ESP32 DevKit V1 and Pico (examples exist in the skill), then Nano, Mega, NodeMCU and Blue Pill.
  - **Pins:** the skill merges meshes by material, so pins are not separate objects. The app reads pin positions from the skill's JSON spec (`headers`: position, pitch, count, labels) and places invisible click targets there. (Or add a skill option that exports `pin_1`… as named nodes.)
  - **Compression:** `gltf-transform` (meshopt + WebP) to aim for under 1 MB per model (the Uno is 4 MB now), loaded only when opened.
  - **Board Explorer:** shows the skill's top-view artwork (`pcb_top.png`) with pins from the same spec, so each board has **one source of truth**. The pin panel gives voltage, current limit, alternate functions and notes, with sources.
- **Why:** real boards are what learners compare against, and the skill already does the hard part.
- **Done when:** the Uno is the real board in both the 3D Viewer and the Board Explorer, and every pin can be clicked.

### Phase 3: Accounts, cloud projects, admin v1, public beta (3–4 weeks)
- **What:**
  - Supabase Auth (Google and email link; temporary emails refused; phone on hold)
  - tables `profiles` (with `role`), `projects` (validated `jsonb`, size cap), `project_shares`, `audit_log`, with **Row Level Security on every table** and tests proving one user can't read another's private project
  - public / unlisted / private sharing, share links, fork, and local projects imported at first login
  - weekly backups plus one restore test
  - **Admin v1**
  - the landing page, help, and privacy/terms pages
- **Why:** this is the point where it can safely go public.
- **Done when:** you log in on two devices and see the same projects, a shared link opens read-only for others, and a non-admin gets nothing from `/admin`.

### Phase 4: Real AI and admin v2 (2–3 weeks)
- **What:**
  - **Access by request:** everyone sees the AI; a logged-in user asks for access with a reason, and the owner approves or denies it in the admin panel ([ADR 0007](../decisions/0007-ai-assistant.md)).
  - A server function checks the login, applies per-user and global daily limits, and calls the model with a server-side key. The answers are grounded in our own parts, datasheet and board data: keyword search first, `pgvector` later.
  - **Admin v2:** service health, AI usage and its switch, announcements.
- **Why:** a useful assistant, with costs under control and visible.

### Phase 5: Microcontrollers (4–6 weeks)
- **What:** a code editor with examples; a build service (`arduino-cli` in a sandboxed, rate-limited container); `avr8js` running the Uno in the Web Worker, with its pins driving the analog circuit; a Serial Monitor. Then the Pico with `rp2040js`.
- **Done when:** the Blink sketch on the simulated Uno blinks an LED through a resistor on the breadboard.

### Phase 6: Classrooms (2–3 weeks)
- **What:** classes with join codes, teacher and student roles, assignments, handing in a project, all protected by Row Level Security. Check the rules for children's data (COPPA, GDPR) first.

### Phase 8: Our own AI model (extra phase, after Phase 4)
- **What:**
  - 8a: run a small open model (licence allowing public use) on our own server with `llama.cpp` or Ollama, behind the same AI function.
  - 8b: an evaluation set of checked electronics questions, to measure the base model with grounding.
  - 8c: fine-tune with LoRA on free notebook GPUs (Kaggle, Colab), and deploy it only if it beats 8b.
- **Why:** answers stay on our own server (privacy), there is no per-token bill, and it is a strong portfolio piece.
- **Cost warning:** this is the one part that may not stay free. A server that is always on is needed, and free options (Oracle Always Free ARM, Azure student credit) are limited or need a card. The admin panel shows its load and cost.
- **Done when:** the fine-tuned model scores better than the base model on the evaluation set and answers approved users from our server.

### Phase 7: Keep improving (ongoing)
- Accessibility, speed budget, Dependabot, backup drills, more parts and datasheets from official sources, and content editing in the admin panel.

### Timeline

| Phase | Time | What you can show |
|---|---|---|
| 0 Foundations | 1–2 wk | Live link, automatic tests |
| 1 Simulator v2 | 5–7 wk | A real time-based simulator on a breadboard |
| 2 Boards and 3D | 2–3 wk | Real boards in 3D and 2D |
| 3 Accounts + admin v1 | 3–4 wk | **Public beta**: log in, save, share, admin |
| 4 AI + admin v2 | 2–3 wk | A grounded, cost-controlled assistant |
| 5 Microcontrollers | 4–6 wk | Arduino code running in the browser |
| 6 Classrooms | 2–3 wk | Teachers and students |
| 8 Own AI model | 3–5 wk | A self-hosted, fine-tuned electronics model |

About **6–8 months** part-time, with Phase 8.

## Open questions

For the owner, before Phase 0:

All answered on 2026-09-18 (see [What we need](#what-we-need)).

Still to decide, later:
1. Before Phase 4: while our own model isn't ready, should approved users get a hosted API model, or should AI wait for Phase 8?
2. Before Phase 8: which server runs our model (Oracle Always Free needs a card for sign-up; Azure student credit runs out).
3. The ADRs 0004–0007 move from "Proposed" to "Accepted" when the owner says OK.
