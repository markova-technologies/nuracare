---
name: memory
description: Perpetual conversation memory log and history tracking for NuraCare. Ensures all user prompts and agent responses are permanently recorded in memory.md and reviewed before taking action on every turn.
---

# Project Memory Skill (NuraCare)

This skill manages continuous context persistence and conversation memory for the NuraCare platform (`apps/web`, `apps/mobile`, and `packages/shared`).

## Core Responsibilities
1. **Historical Ground Truth:** Provides immediate access to all architectural decisions, bug resolutions, mobile APK release states, and user instructions in [memory.md](file:///D:/Projects/Markova%20Projects/nuracare/.agents/skills/Memory/memory.md).
2. **Turn Logging:** Ensures that every single turn's user prompt and agent response are appended to `memory.md` before concluding any response.
3. **Context Analysis:** Reads and analyzes `memory.md` on every user prompt to maintain continuity across sessions, IDE restarts, and context compactions.

## Turn Format in `memory.md`
```markdown
#### Turn [Number] (Step [Index])
##### 👤 User Prompt:
```text
<exact user prompt text>
```

##### 🤖 Agent Response:
<comprehensive agent response text, files edited, and actions taken>

---
```

