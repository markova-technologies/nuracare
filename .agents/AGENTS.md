# NuraCare — Workspace AI Agent Rules & Perpetual Memory Anchor

## 🚨 MANDATORY CONVERSATION INIT RULE (AUTOMATIC LOAD)
At the start of **EVERY** new session, turn, or conversation in this workspace, before taking any action or answering questions, you MUST:
1. Treat `docs/ARCHITECTURE.md`, `docs/MOBILE.md`, and `NuraCare_Status_and_Feedback_Summary.md` in the project root as your ground-truth architectural references.
2. Recognize that NuraCare is a full **monorepo** consisting of:
   - `apps/web`: React + Vite web application deployed to Vercel.
   - `apps/mobile`: Expo + React Native mobile application for Android/iOS.
   - `packages/shared`: Shared wellness engine, Ethiopian calendar, and discovery algorithms.
3. Keep the user from EVER having to repeat project history by actively checking `.agents/skills/Memory/memory.md` on every turn.

---

## 🧠 MANDATORY PERPETUAL CONVERSATION MEMORY RULE (`.agents/skills/Memory/memory.md`)
This rule is absolute, non-negotiable, and MUST be followed on **EVERY SINGLE TURN** without exception:

1. **ANALYZE AT TURN START**:
   Immediately upon receiving ANY user prompt, you MUST inspect and analyze `D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md` to load the exact unabridged conversation history, active tasks, user requirements, and platform status.

2. **STRICT APPEND AT TURN END (ZERO EXCEPTIONS)**:
   Before concluding ANY response (no matter how small, large, or routine), you MUST append the exact user prompt and your full agent response to `D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md` using the exact format:
   ```markdown
   #### Turn [N]
   ##### 👤 User Prompt:
   ```text
   <exact user prompt text without omissions>
   ```

   ##### 🤖 Agent Response:
   <full agent response text, files changed, commands executed>

   ---
   ```

3. **NEVER FORGET OR SKIP**:
   This ledger is the ultimate ground-truth conversational memory across IDE crashes, PC reboots, context compactions, and session resets. Forgetting to read or append to `memory.md` is considered a critical failure.
