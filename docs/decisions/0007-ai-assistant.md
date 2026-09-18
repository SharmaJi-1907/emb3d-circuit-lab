# 0007 — AI assistant: admin-approved access, then our own model

- **Status:** Proposed (waiting for the owner's OK)
- **Date:** 2026-09-18

## Context

The "AI" today is 9 stored answers matched by keywords. The owner wants ([ROADMAP.md](../planning/ROADMAP.md)):
- The AI feature is **visible to everyone**, but a user must **ask the admin for access**. Only approved users can use it.
- A **self-hosted open model** (a "local LLM" on our own server) that we later **fine-tune** on electronics, as an extra phase.
- $0 where possible. The project is open source (MIT).

## What we know (September 2026; re-check before building)

- **Running a model costs compute.** GPUs are not free to rent 24/7. A small open model (about 1–4B parameters, quantized) can run on CPU with `llama.cpp` or Ollama, but slowly: a few words per second, fine for a few users at a time.
- **Free or near-free places to run it are shaky:**
  - Oracle Cloud "Always Free" ARM VMs (up to 4 cores, 24 GB RAM) are often out of capacity, and sign-up asks for a card for identity checks, which breaks our no-card rule unless the owner accepts it.
  - Azure for Students ($100 credit, no card) can run a CPU VM for some months, then it stops.
  - None of this is verified for our load yet.
- **Fine-tuning** a small model with LoRA fits on free notebook GPUs (Kaggle, Colab), limited hours per week. It needs a good dataset: our own parts, datasheets, board pins and checked Q&A.
- **Grounding (RAG) matters more than fine-tuning** for facts: searching our own data and giving the model the top matches keeps answers correct and citable. Fine-tuning mostly helps style and domain words.
- **Model licences differ.** Pick one whose licence allows public use in an MIT project (for example Apache-2.0 models), and check each model's own terms.

## Decision

1. **Access by request, approved by the admin (Phase 4):**
   - The AI screen is shown to everyone. Guests and logged-in users without access see **"Request access"** (login needed, with a short reason).
   - An `ai_access_requests` table (user, reason, status, decided by, date) is protected by Row Level Security: a user sees only their own requests, and only the admin can approve or deny.
   - The admin panel gets an **AI requests** section (approve, deny, revoke), and every decision goes to the audit log.
   - The AI server function checks, on every call: logged in, approved, within the per-user daily limit, and within the global daily budget. The admin can switch AI off for everyone.
2. **One AI function, with the model behind a switch.** The browser always calls our own server function, never the model directly. Behind it, the model can be:
   - (a) a free or cheap hosted API while we build (optional, if the owner wants answers before our server exists), or
   - (b) **our own server** running an open model with `llama.cpp` or Ollama.

   The function adds our grounding data (parts, datasheets, board pins) to every question.
3. **Own model (Phase 8, an extra phase):**
   - 8a: run a small open model on a CPU server, behind the same function, with the admin panel showing its speed and health.
   - 8b: build an evaluation set of checked electronics questions and measure the base model with grounding.
   - 8c: fine-tune with LoRA on free notebook GPUs, keep the new model only if it beats 8b on the evaluation set, then deploy it.

## Consequences

- Nobody can run up AI cost without the owner's approval, and every approval is logged.
- The model can be swapped (hosted API, own model, fine-tuned model) without touching the app.
- A self-hosted model is the one part of the plan that may **not** stay free: it needs a server that is always on. The admin panel shows its cost and health, and the owner decides whether to keep it running.
- Users never send their questions to a third party once our own model runs, which is good for privacy.
