# NuraCare Perpetual Project Memory & Conversation History

> **Location:** `D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md`  
> **Repository:** `markova-technologies/nuracare` (`ZelalemAzmera/nuracare`)  
> **Status:** Active Production Monorepo (`apps/web` + `apps/mobile` + `packages/shared`)  
> **Operating Standard:** MANDATORY review at the start of every turn; MANDATORY append of user prompt and agent response at the end of every turn.

---

## 🏛️ Platform Overview & Invariants

1. **System Identity**:
   - **NuraCare (Nova)**: AI-Powered Wellness Intelligence Platform.
   - Shifted from a reactive symptom-checking assistant to a continuous, proactive daily wellness, habit-tracking, burnout prevention, and localized nutrition platform.
2. **Monorepo Architecture**:
   - `apps/web`: React 18 + Vite + Tailwind CSS + Lucide Icons + Serverless API (`apps/web/api/`). Deployed on Vercel at `nuracare.pro.et` / `nuracare.vercel.app`.
   - `apps/mobile`: React Native + Expo Router + Hermes Engine + MMKV offline cache + Supabase.
   - `packages/shared`: Universal business logic including `wellnessEngine.ts`, `ethiopianCalendar.ts`, `discoveryEngine.ts`, and design tokens.
3. **AI Engine**:
   - Primary LLM: Groq API (`llama-3.3-70b-versatile` / `openai/gpt-oss-120b`).
   - Serverless streaming via SSE Edge runtime (`apps/web/api/chat.js`) with Discord webhook monitoring for high-urgency health alerts.
4. **Mobile Release Pipeline**:
   - Canonical Android build: **v1.0.8 (Code 11)**, 109.4 MB standalone APK compiled with 64-bit ARM (`arm64-v8a`) and Hermes engine.
   - Hosted on GitHub Releases: [`markova-technologies/nuracare/releases/tag/v1.0.8`](https://github.com/markova-technologies/nuracare/releases/tag/v1.0.8).
   - Dynamic synchronization across `apps/web/api/download.js`, `apps/web/api/config.js`, `apps/web/public/version.json`, `apps/web/public/remote-config.json`, and `apps/web/src/components/shared/DownloadAppModal.jsx`.
5. **Cultural Intelligence**:
   - Religious fasting tracking (*Tsom* - Orthodox Christian Lent/Filseta/Wed-Fri & Islamic Ramadan).
   - Hyper-localized nutrient database (*Sergegna/Red Teff*, *Shiferaw/Moringa*, *Beso/Barley*, *Abish/Fenugreek*).
   - Communal dining factor (*Gebeta* fractional plate estimation).

---

## 📜 Full Historical Conversation Ledger

#### Turn 1 (May 3–4, 2026)
##### 👤 User Prompt:
```text
Hi i'm in hackaton and i build an AI Health Pre-Diagnosis Agent and here is (idea.md) the whole thing about the whole idea. Chat gpt can do that right so what this agent make it different form it. So if the urgency and the disease may be curable with out any risks it will be suggested to prevent it in natural way. So make it interactive and also user friendly.
```

##### 🤖 Agent Response:
- Conceptualized the **NuraCare** health companion.
- Established the core clinical triage system:
  - Low Urgency: Emphasizes hydration, rest, nutrition, and natural/herbal remedies.
  - High Urgency: Detects red-flag symptoms and advises immediate emergency evaluation.
- Implemented the green glassmorphism design system.
- Transitioned inference to Groq Llama 3.3 70B for zero-cost, ultra-low-latency streaming.

---

#### Turn 2 (May 5, 2026)
##### 👤 User Prompt:
```text
Okay good. But when you start a new session it will not be stored or saved the old session so here is what you gonna do, make a side bar that store the sessions and also name the session based on the chat context (like how chatgpt do) and display that on the side bar of the chat page. Also make the sessions share knowledge so the ai knows better about the user.
```

##### 🤖 Agent Response:
- Built persistent multi-session switching in the chat view with a collapsible sidebar and automatic context-based session titling.
- Architected the cross-session memory engine (`buildCrossSessionMemory` and `extractSessionMemory`) in `src/App.jsx` and `api/chat.js`.
- Injected rolling summaries of past clinical encounters into the system prompt across dev and production.

---

#### Turn 3 (October 1–9, 2026)
##### 👤 User Prompt:
```text
Refactor NuraCare into a complete monorepo with web and React Native mobile apps. We need to implement onboarding, login/signup, APK generation, and fix runtime crashes.
```

##### 🤖 Agent Response:
- Scaffolding the unified monorepo (`apps/web`, `apps/mobile`, `packages/shared`).
- Implemented full mobile authentication, profile setup, and 4-step onboarding screens.
- Resolved Android startup crashes, wrapped `RootLayout` in an `ErrorBoundary`, fixed MMKV web bypass, and stabilized audio mode with `expo-av`.
- Configured EAS cloud and local build pipelines for Android APK packaging.

---

#### Turn 4 (October 10–23, 2026)
##### 👤 User Prompt:
```text
When i try to install it to my phone it shows a compatability or bug message (like before, way back but we solved it). Also on the website i was getting old version 1.0.6. Fix all of those and make sure the APK works on newer Android versions.
```

##### 🤖 Agent Response:
- Diagnosed the root cause of Android's *"There was a problem parsing the package"* error: the download URL was serving an unfinalized GitHub 404 HTML page (~15 KB) instead of the actual APK archive.
- Built and published the verified **109.4 MB standalone APK (`NuraCare-v1.0.8.apk`)** with Hermes engine and `arm64-v8a` architecture to GitHub Releases `v1.0.8`.
- Synchronized all web APIs (`/api/download`, `/api/config`, `version.json`, `remote-config.json`, and `DownloadAppModal.jsx`) so users download the genuine APK directly.

---

#### Turn 5 (October 30, 2026 - 15:07)
##### 👤 User Prompt:
```text
could you sync from this chat history and id 'Here is the information for our current session:
Conversation ID: 5f2d03d1-48a8-49a7-8263-be5decd2eb5f
Project Name: nuracare (specifically, the repository at markova-technologies/nuracare)"
Pull a conversation from this folder (angigravity ide's conversation storage) and load
```

##### 🤖 Agent Response:
- Queried Antigravity IDE storage (`conversation_summaries.db`) and pulled the conversation record `5f2d03d1-48a8-49a7-8263-be5decd2eb5f`.
- Summarized early project conception, model routing, and cross-session memory architecture.

---

#### Turn 6 (October 30, 2026 - 15:19)
##### 👤 User Prompt:
```text
No there is another that the latest chat is about the mobile app. so find that conversation and load from that
```

##### 🤖 Agent Response:
- Conducted deep scan across all storage locations (`antigravity` vs `antigravity-ide`).
- Located the full, unabridged transcript with **14,606 steps** spanning up to October 23, 2026 in `C:\Users\zelal\.gemini\antigravity-ide\brain\5f2d03d1-48a8-49a7-8263-be5decd2eb5f\.system_generated\logs\transcript.jsonl`.
- Loaded and synthesized the full history of the mobile app (`apps/mobile`), the EAS build evolution, Hermes stabilization, AAPT2 asset fixes, and the `v1.0.8` standalone APK release.

---

#### Turn 7 (October 30, 2026 - 15:57)
##### 👤 User Prompt:
```text
Okay here is what you gonna do. You are gonna put every coversation of our every time like you gave me like this, a prompt and agent's response on this file "D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md" everytime and check and alayse everytime after the user prompt. So add it to the rules so the agents will do this thing no matter what strictly and with out forgeting in any situation
```

##### 🤖 Agent Response:
- Established directory junction between `d:\nuracare` and `D:\Projects\Markova Projects\nuracare` for seamless workspace resolution.
- Created the perpetual memory skill at `.agents/skills/Memory/SKILL.md`.
- Created strict, mandatory rules in `.agents/rules/memory_persistence.md`, `.agents/AGENTS.md`, and project root `AGENTS.md`.
- Established `D:\Projects\Markova Projects\nuracare\.agents\skills\Memory\memory.md` with platform invariants and full chronological history from Turn 1 to Turn 7.
- Enforced strict two-phase protocol: (1) inspect and analyze `memory.md` at turn start, (2) format and append prompt and response to `memory.md` at turn end without exception.

---
