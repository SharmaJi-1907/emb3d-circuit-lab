# Resume prompt

Copy everything in the box below into a **new AI chat** (Claude, Cursor, ChatGPT or any other) to continue the work where it stopped. Tools that read `AGENTS.md` by themselves (Claude Code, Cursor, Codex) only need the first line.

```
You are joining the CircuitLab project (an open-source browser electronics lab; repo root has AGENTS.md).

Before doing anything:
1. Read AGENTS.md and follow it exactly (git: never run commands that change anything; give me the commands instead).
2. Read docs/context/PROJECT_CONTEXT.md (where we are now), the newest entry in docs/context/SESSION_LOG.md (what happened last), and docs/tracking/PROGRESS.md (phase and branch status).
3. Run `git branch --show-current` and `git status`, and tell me if they don't match PROJECT_CONTEXT.
4. Summarise in 5 short bullets: the stage, the current phase and branch, what was done last, what is next, and any blockers.
5. Then wait for my instruction. Analyse before changing anything, and don't edit code until I say "go".

At the end of the session, add an entry to docs/context/SESSION_LOG.md and update docs/context/PROJECT_CONTEXT.md and any other doc the work touched, as AGENTS.md says.

Reply in simple English with short bullet points.
```

## If the AI can't read files

Paste these files after the prompt, in this order: `AGENTS.md`, `docs/context/PROJECT_CONTEXT.md`, the newest entry of `docs/context/SESSION_LOG.md`, and the "Now" section of `docs/tracking/PROGRESS.md`.
