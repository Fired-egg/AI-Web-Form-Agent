# AGENT_RULES.md

Project:
AI Web Form Agent

Goal:
Build a human-in-the-loop browser automation agent that fills web forms from user profile data and pauses before final submission.

Tech Stack:
- Backend: Python, FastAPI
- Browser Automation: Playwright
- Frontend: React, Vite
- LLM: OpenAI API or Gemini API
- Storage: No database for MVP. SQLite is optional later.

Architecture:
React Frontend -> FastAPI Backend -> Agent Services -> Playwright Browser

Core Modules:
- FormExtractor: extract form fields from a webpage
- FieldMapper: map profile data to form fields
- BrowserExecutor: execute Playwright actions
- SafetyChecker: stop before submit/pay/delete/send actions

Rules:
- Keep the project MVP-focused.
- Do not build multi-agent systems.
- Do not add RAG.
- Do not add login or user management.
- Do not handle CAPTCHA.
- Do not automate payment or purchasing.
- Do not auto-submit forms without user approval.
- Keep code beginner-friendly.
- Add comments when logic is not obvious.
- Prefer small functions and simple file structure.
- Each task should modify only the files necessary for that feature.
