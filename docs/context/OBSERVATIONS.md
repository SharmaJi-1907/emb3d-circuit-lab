# Observations

Lessons learned while building CircuitLab: what went wrong, what worked, and what to do differently. Add one when something surprises you ([AGENTS.md](../../AGENTS.md)). Newest first.

## 2026-09-18

- **"All tests pass" doesn't mean "useful".** After the fix plan, every button worked and 220 tests passed, but the owner's own testing showed it was still a demo: a DC-only simulator, boards drawn as rectangles, box-built 3D. Stability and usefulness are different goals; the roadmap now has a "Done when" per phase that describes real use.
- **Line links in docs rot.** 30 `#L123` links in FIX_PLAN still pointed inside their files but at the wrong code, and the link test only checks that the line exists. Link to files, or to headings, not to line numbers.
- **Renumbering issue codes with `sed` can hit old codes.** Renaming the new "B1–B6" to D49–D54 also changed 4 old test names that really were B1/B3. Check the diff after any bulk rename.
- **Prove a new test fails on the old code.** Running the new tests on a clean copy of the last commit (`git archive HEAD`) showed all 7 fail before the fix, without touching the working tree.
- **Parallel agents must not run the browser tests** while others edit files: Vite reloads the page mid-test. Agents run lint and `node` checks only; the full suite runs once at the end.
- **Free tiers hide bills in details.** Heroku needs a card, Firebase phone login needs a card, and domains renew at full price after year 1. Hence the no-card rule.

## From the fix plan (#0–#32)

- **A forgotten `window` global is a runtime crash, not a build error** (A1). ES modules make it a build error (ADR 0003).
- **Measure before claiming.** Several notes in FIX_PLAN had to be corrected after measuring (E15's "real cost", D3's "parts added twice"). Write down what was measured, not what was assumed.
- **Hidden canvases are 0×0.** Anything sized from its box must re-measure when shown (D3, D35): use a `ResizeObserver`.
- **Headless Chrome renders 3D in software**, so timers run slowly under load. Wait for conditions, never for fixed times (E13, E17).
