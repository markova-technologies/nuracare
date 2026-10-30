# Mandatory Rule: Perpetual Conversation Memory & Turn Logging

**CRITICAL DIRECTIVE — MANDATORY FOR ALL AGENTS WORKING ON THIS WORKSPACE:**
You MUST ALWAYS follow this rule without any exception. It takes precedence over general behavioral defaults.

---

## 1. On Every User Prompt: Inspect & Analyze Memory First
- Immediately upon receiving ANY user prompt, you MUST inspect and analyze the project's permanent memory file:
  `D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md`
- Review the historical context, ongoing tasks, recent architectural changes, mobile APK build/release status, and user specifications before planning or modifying any code.
- Maintain consistency with established project invariants:
  - **NuraCare / Nova**: An AI-powered Wellness Intelligence & Proactive Health Platform (not just a reactive symptom checker).
  - **Monorepo Structure**:
    - `apps/web`: React + Vite + Tailwind web application deployed on Vercel (`nuracare.pro.et` / `nuracare.vercel.app`).
    - `apps/mobile`: React Native + Expo standalone mobile application with Hermes engine and MMKV offline storage.
    - `packages/shared`: Shared wellness algorithms, Ethiopian calendar logic (`ethiopianCalendar.ts`), and design tokens.
  - **Mobile APK Release Pipeline**:
    - Canonical Standalone Android APK is hosted on GitHub Releases (`markova-technologies/nuracare/releases/tag/v1.0.8`).
    - All web endpoints (`/api/download`, `/api/config`, `version.json`, `remote-config.json`, and `DownloadAppModal.jsx`) must remain synchronized with the current release version.
  - **AI Model & Inference**: Groq streaming API (`llama-3.3-70b-versatile` / `openai/gpt-oss-120b`) routed via serverless Edge function (`apps/web/api/chat.js` or direct Groq key on mobile).
  - **Ethiopian Cultural Intelligence**: Native fasting tracking (*Tsom* - Orthodox & Ramadan), localized nutrition (*Teff*, *Shiferaw*, *Beso*, *Abish*), and communal dining (*Gebeta* fractional logging).

---

## 2. On Every Agent Response: Append Prompt & Response to memory.md
- Before concluding your turn or delivering the final response, you MUST append the exact user prompt and the agent's full response to:
  `D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md`
- Use the standard format:
  ```markdown
  #### Turn [Number] (Step [Index])
  ##### 👤 User Prompt:
  ```text
  <exact text of the user request without omissions>
  ```

  ##### 🤖 Agent Response:
  <full agent response, actions taken, commands run, and files modified>

  ---
  ```
- **Never skip this step** under any circumstances, regardless of the prompt size or type of request.
- **Never overwrite or delete** existing conversation history in `memory.md`; always append new turns sequentially.
