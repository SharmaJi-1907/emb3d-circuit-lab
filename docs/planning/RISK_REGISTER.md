# Risk register

What could go wrong with the roadmap, how likely it is, and what we do about it. Review it at the end of every phase ([REVIEW_CHECKLIST.md](../rules/REVIEW_CHECKLIST.md)). Add a row when a new risk appears.

Likelihood / impact: **H** high · **M** medium · **L** low

| # | Risk | Likelihood | Impact | What we do | Phase | Status |
|---|---|---|---|---|---|---|
| R1 | Supabase Free **pauses** the project after 1 week with no use, so the live site's login and saves stop working | M | H | A weekly GitHub Action backs it up (and keeps it active; whether that is allowed is unverified); real use during classes; move to Pro (about $25/month) when there are regular users | 3 | Open |
| R2 | **No backups** on Supabase Free: a bad migration or deleted data is lost for good | M | H | A weekly `pg_dump` to private storage; one restore test before the beta; migrations reviewed in the PR | 3 | Open |
| R3 | **Free-tier limits or prices change** | M | M | Limits written down with dates ([KNOWLEDGE_BASE.md](../context/KNOWLEDGE_BASE.md)), re-checked before launch; the admin panel warns at 80% | 3–4 | Open |
| R4 | **A surprise bill** (a card on a service, an AI key abused, SMS pumping) | M | H | No card on any free service; AI by admin approval with a budget and kill switch; phone login on hold | All | Open |
| R5 | **A secret leaks** through the public repo | M | H | Secrets only in secret settings or Doppler; gitleaks in CI; rotate at once if leaked | 0+ | Open |
| R6 | **Row Level Security gaps**: a user reads another's data | M | H | RLS on every table before real data, with tests for each policy; review in every phase PR | 3+ | Open |
| R7 | **The simulator engine is harder than planned** (convergence, speed, accuracy) | H | H | Build it in small steps with unit tests against ngspice; the old engine stays until the new one passes; accuracy trials in [EXPERIMENTS.md](../tracking/EXPERIMENTS.md); 5–7 weeks allowed | 1 | Open |
| R8 | **GPL code gets copied in** by mistake (Falstad, SimulIDE, QEMU, simavr), which conflicts with MIT | L | H | Rule in [CODING_STANDARDS.md](../rules/CODING_STANDARDS.md); a licence check for each new dependency in the PR | 1, 5 | Open |
| R9 | **The Arduino build service** is abused (heavy or harmful code) or costs money | M | M | Sandboxed container, time and size limits, rate limits, logged-in users only; decide the host before Phase 5 | 5 | Open |
| R10 | **Hosting our own AI model** isn't free or is too slow on CPU | H | M | The AI function keeps the model behind a switch; measure speed in EXPERIMENTS; the owner decides whether to keep the server on | 8 | Open |
| R11 | **3D models are too big** for students on slow mobile data | M | M | Compression to under 1 MB, load only when opened, a size check in tests | 2 | Open |
| R12 | **Children's data rules** (COPPA, GDPR, India's DPDP Act) when schools use it | M | H | Store as little as possible; privacy policy before the beta; check the rules before classrooms (Phase 6) | 3, 6 | Open |
| R13 | **One developer**: illness, exams or other work stop progress, and context gets lost | H | M | The handoff system (PROJECT_CONTEXT, SESSION_LOG, RESUME_PROMPT); small phases that each ship something; a stable, verified `main` | All | Mitigated by docs |
| R14 | **Separate Cloudflare accounts** may not be allowed by its terms | L | M | Check the terms before Phase 0; the backup is GitHub Pages (static only) | 0 | Open |
| R15 | **Student Pack offers end** when the owner stops being a student (Sentry Team, Doppler) | M | L | Only nice-to-haves depend on them; the free plans cover the basics | 0+ | Open |
| R16 | **The board pin data is wrong** (for example the Uno list, D50, written from the standard layout) | M | M | Check each board against the maker's official pinout; the skill's research notes cite sources | 2 | Open |
