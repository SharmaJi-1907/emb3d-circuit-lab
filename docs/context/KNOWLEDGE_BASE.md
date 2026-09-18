# Knowledge base

Facts and research the plan rests on, **with sources**, so nobody has to research them again. Numbers change: each section has the date it was checked. Re-check before relying on it for a launch. Anything marked _unverified_ could not be confirmed from an official source.

## How online simulators work (checked 2026-09-18)

- **Wokwi** ([docs](https://docs.wokwi.com/)):
  - Microcontrollers are emulated **in the browser**. User code is compiled on Wokwi's servers with the official Arduino tools.
  - MIT libraries: `avr8js` (the AVR CPU only; you write the peripherals), `rp2040js` (Raspberry Pi Pico, UF2/HEX, MicroPython) and `wokwi-elements` (parts drawn as Lit + SVG web components, display only).
  - The ESP32/STM32 emulators are **not** open source.
  - Analog support is very basic: [resistor dividers are an open request](https://github.com/wokwi/wokwi-features/issues/203), and there is no SPICE.
  - Save format: [`diagram.json`](https://docs.wokwi.com/diagram-format), with `parts[]` (id, type, position, rotation, attributes) and `connections[]` (`["part:pin","part:pin",colour,route]`).
  - Custom chips are written in C/Rust compiled to WebAssembly.
  - Pricing: [free public projects; paid plans for private projects and builds](https://wokwi.com/pricing).
- **Tinkercad Circuits** (Autodesk):
  - Runs in the browser: analog + digital, the Arduino Uno and micro:bit, and a blocks or text editor.
  - [Classrooms with class codes, no student email needed](https://www.tinkercad.com/teachers).
  - Its engine, and where Arduino code runs, are _unverified_.
- **Falstad CircuitJS1** ([docs](https://www.falstad.com/circuit/doc/)):
  - Runs fully in the browser, using modified nodal analysis with time steps, companion models for capacitors and inductors, and repeated iteration for nonlinear parts.
  - **GPL-2.0**, so embed it by iframe only and never copy its code.
- **CircuitLab.com**: its own SPICE-like engine in the browser ([FAQ](https://www.circuitlab.com/docs/faq/)).
- **EveryCircuit** ([help](https://everycircuit.com/help)): its own engine, with moving current dots and values you can change while it runs.
- **EasyEDA Pro** ([docs](https://prodocs.easyeda.com/en/simulation/introduction/)): SimulIDE for real time, plus ngspice.
- **SimulIDE** is GPL-3.
- **Proteus VSM** ([site](https://www.labcenter.com/simulation/)): SPICE plus microcontroller co-simulation (desktop, commercial).
- **ngspice in the browser:**
  - ngspice itself is BSD, with LGPL/MPL/GPL exceptions in some files ([COPYING](https://github.com/ngspice/ngspice/blob/master/COPYING)).
  - [`eecircuit-engine`](https://github.com/eelab-dev/EEcircuit-engine) (MIT) runs a netlist and returns the results, in batch style. Its size and speed are _unverified_.
- **Nobody found does live co-editing.** Multi-user means accounts, public/unlisted/private projects, share links, fork and classrooms.
- **What we take from this:**
  - simulation in a Web Worker
  - one saved format like `diagram.json`
  - the drawing kept apart from the maths
  - a breadboard as one part with connected rows
  - probes as parts
  - EveryCircuit-style live overlays

  All of this is in [ADR 0005](../decisions/0005-simulator-engine.md).

## Backend, login and hosting (checked 2026-09-18)

- **Supabase Free:** 50K monthly active users, 500 MB database, 1 GB storage, 5 GB egress, 500K Edge Function calls, 2 projects. **Paused after 1 week idle, no backups** ([pricing](https://supabase.com/pricing)). There is a Mumbai region `ap-south-1` ([regions](https://supabase.com/docs/guides/platform/regions)). Realtime Presence is free up to 200 connections at once ([billing](https://supabase.com/docs/guides/platform/billing-on-supabase)). Whether it restricts or charges at the quota is _unverified_.
- **Firebase:** Auth is 50K MAU. Server functions and phone login need the Blaze plan (card) ([pricing](https://firebase.google.com/pricing)).
- **Appwrite Cloud:** 75K MAU; also pauses when idle ([pricing](https://appwrite.io/pricing)).
- **PocketBase** is pre-1.0 ([docs](https://pocketbase.io/docs/)).
- **Clerk:** no MFA on free ([pricing](https://clerk.com/pricing)).
- **Auth libraries:** Lucia was deprecated in 2025 ([notice](https://github.com/lucia-auth/lucia/discussions/1707)). Better Auth is the usual pick for a custom Node backend.
- **Cloudflare:** static assets are free and unlimited, and Workers get 100K requests/day on Free. Over that, requests **fail and are not charged** ([limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)). Only an account with a paid product is metered. That separate accounts are allowed is _unverified_ in the terms.
- **Sentry Developer (free):** 5K errors/month ([pricing](https://sentry.io/pricing/)).
- **Common Supabase mistake:** forgetting Row Level Security ([article](https://dev.to/victor_yrazusta/10-common-supabase-security-misconfigurations-and-how-to-fix-them-do8)).

## GitHub Student Developer Pack (checked 2026-09-18, [pack page](https://education.github.com/pack))

**In the pack:**

| Offer | What you get |
|---|---|
| [Azure for Students](https://azure.microsoft.com/en-us/free/students) | $100 / 12 months, no card; disabled (not billed) when it runs out |
| [Heroku](https://www.heroku.com/github-students/) | $13/month for 24 months, **card required**, then billed |
| Appwrite Education | Pro-level limits while a student |
| MongoDB Atlas | $50 credit |
| Clerk | Pro while a student |
| Sentry | Team, 1 year |
| Datadog | Pro, 2 years |
| New Relic, Doppler | While a student |
| Domains (Namecheap .me, .TECH, Name.com) | Free for year 1, then full-price renewal |

**Not in the pack:** DigitalOcean left it ([report](https://aistudentdiscount.com/digitalocean-github-student-developer-pack-credits/)), and Twilio was removed in 2023 ([discussion](https://github.com/orgs/community/discussions/59485)). Supabase, Firebase, Vercel, Netlify, Render and Railway were never in it.

## Phone (OTP) login in India (checked 2026-09-18)

- **TRAI DLT registration** is needed to send SMS to Indian numbers. It costs about ₹5,900/year and usually needs PAN, GST or business papers ([guide](https://www.smscountry.com/blog/jio-dlt-registration-guide/)).
- **MSG91** costs about ₹0.15–0.20 per OTP, plus GST ([pricing](https://msg91.com/in/pricing/otp)).
- **Supabase phone login** needs your own SMS provider, or the [Send SMS hook](https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook) ([phone login](https://supabase.com/docs/guides/auth/phone-login)).
- **Firebase phone login** needs the Blaze plan. Its India SMS price and whether it handles DLT are _unverified_.
- **WhatsApp authentication messages** cost about ₹0.115 each, with no DLT, but need a Meta Business account ([pricing summary](https://www.authgear.com/post/whatsapp-api-pricing/)).
- **Risk:** SMS pumping (bots requesting OTPs). Defend with a CAPTCHA, rate limits, a country allowlist and a daily cap.

## The owner's `pcb-board-3d-model` skill (read 2026-09-18)

- **Where:** `~/Downloads/files (8)/pcb-board-3d-model.skill`, a zip containing `SKILL.md`, `scripts/pcb3d.py` and examples for the ESP32 DevKit V1, micro:bit v2 and Pico 2 W.
- **Pipeline:** research → notes → JSON spec → `build_model.py` → GLB (metres, Y-up, PBR, embedded textures) → renders to check → web pages.
- **It already built an Arduino Uno:** `~/Downloads/files (8)/rgbduino_uno.glb` (**4 MB**, 34 meshes) with its spec `rgbduino_uno.json`.
- **Important:** the exporter merges geometry **by material** (all gold in one mesh, all plastic in another…), so **pins are not separate objects**. For clickable pins in CircuitLab, either read pin positions from the spec's `headers` (position, pitch, count, labels) and add invisible click targets, or add an option that exports `pin_<n>` nodes.
- The skill also saves the board's top artwork as a PNG, which the Board Explorer can use as a real board picture.
- The models need compressing for the web (for example `gltf-transform` with meshopt + WebP), aiming for under 1 MB each.

## Self-hosting an AI model (not yet researched in depth)

- These points are general knowledge, _unverified_ for our load. Research before Phase 8, and record the results in [EXPERIMENTS.md](../tracking/EXPERIMENTS.md):
  - Small open models (1–4B parameters, quantized) run on CPU with `llama.cpp` or Ollama, at a few words per second.
  - Oracle Cloud Always Free ARM VMs (up to 4 cores, 24 GB) are often out of capacity, and sign-up asks for a card.
  - LoRA fine-tuning fits on free notebook GPUs (Kaggle, Colab), with limited hours.
  - Model licences differ, so check each one for public use.
