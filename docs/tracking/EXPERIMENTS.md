# Experiments

Trials whose results drive a decision: what we tried, how we measured, and what we learned. A result that changes the plan gets an ADR or a ROADMAP change as well. Newest first.

Entry format:

```
## YYYY-MM-DD — what was tried
- Question:
- Setup (versions, data, hardware):
- How it was measured:
- Result (numbers):
- Decision / next step:
```

## Planned

| When | Experiment | Why |
|---|---|---|
| Phase 1 | Our simulator engine vs ngspice (`eecircuit-engine`): RC charge, diode, LED + resistor, 555 astable. Record the error and the time per step | To prove the engine is accurate enough, and fast enough for real time ([ADR 0005](../decisions/0005-simulator-engine.md)) |
| Phase 1 | Size and load time of `eecircuit-engine` in the browser | To decide whether it ships to users or is only used in tests |
| Phase 2 | GLB compression: the Uno model (4 MB) with meshopt + WebP, then its size and load time on a slow 4G profile | To meet the under-1 MB budget |
| Before Phase 8 | Small open models (licence allows public use) on a CPU server: words per second and answer quality on our evaluation set, with and without grounding | To choose the model and the server ([ADR 0007](../decisions/0007-ai-assistant.md)) |
| Phase 8 | LoRA fine-tune vs the base model on the evaluation set | Deploy only if it scores higher |

## Results

_None yet._
