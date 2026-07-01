# AI Web Form Agent

A human-in-the-loop browser automation agent that analyzes web forms, maps user
profile data to fields, fills the form in a real browser, and pauses before
final submission.

## Why This Project Exists

Most form automation demos are hard-coded scripts. This project is different:

- It discovers form fields dynamically from the target page.
- It maps reusable profile data with rules or an LLM provider.
- It lets the user review and correct every mapped value.
- It records logs, screenshots, benchmark results, and action traces.
- It keeps final submission behind explicit user approval.

## Current Features

- Profile CRUD with built-in fields and reusable custom values.
- Task workflow: create task, analyze page, map fields, review mapping, fill
  form, approve final submit.
- Dynamic field extraction for inputs, textareas, selects, checkboxes, radio
  controls, buttons, labels, placeholders, ARIA labels, options, and required
  fields.
- Rule-based and LLM-assisted mapping.
- LLM provider selection for OpenAI, Gemini, and DeepSeek.
- LLM setup hints when provider keys are missing.
- LLM mapping cache and user mapping override cache.
- Form analysis cache for repeated URLs.
- Confirm Mapping profile memory: reviewed reusable values are safely written
  back into the current profile.
- Manual-login recovery flow when a page blocks extraction behind login.
- Browser screenshots for task stages.
- User-facing logs plus admin action traces.
- Local benchmark runner with persisted benchmark history.
- React pages for Dashboard, Profiles, Create Task, Task Detail, Review
  Mapping, and Benchmarks.

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, SQLite
- Browser automation: Playwright
- Frontend: React, Vite
- LLM providers: OpenAI, Gemini, DeepSeek
- Testing: pytest, Node test runner

## Project Structure

```text
backend/                      FastAPI app, services, tests, examples
backend/app/routers/           API routes
backend/app/services/          agent services and caches
backend/benchmarks/            local benchmark forms and expected answers
frontend/                     React/Vite UI
frontend/src/pages/            app pages
docs/superpowers/specs/        feature design specs
docs/superpowers/plans/        implementation plans
AGENT_RULES.md                project rules and safety boundaries
TASKS.md                      current development roadmap
AI_Web_Form_Agent_Roadmap.md  staged project roadmap
```

## Local Run Guide

Use two PowerShell terminals: one for the backend API and one for the frontend
UI.

First-time backend setup:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m playwright install chromium
```

Start the backend API:

```powershell
cd backend
$env:LLM_PROVIDER="deepseek"
$env:DEEPSEEK_API_KEY="your-key"
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`. Verify it with:

```text
http://localhost:8000/health
```

First-time frontend setup:

```powershell
cd frontend
npm install
```

Start the frontend UI:

```powershell
cd frontend
npm run dev
```

Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## LLM Provider Setup

The UI lets you choose rule mode or an LLM provider before generating mappings.
Configure any provider you want to use before starting the backend.

```powershell
# DeepSeek
$env:LLM_PROVIDER="deepseek"
$env:DEEPSEEK_API_KEY="your-key"
$env:DEEPSEEK_MODEL="deepseek-v4-flash"

# OpenAI
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="your-key"
$env:OPENAI_MODEL="gpt-4.1-mini"

# Gemini
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="your-key"
$env:GEMINI_MODEL="gemini-2.5-flash"
```

If a selected provider is missing an API key, the backend returns a setup hint
instead of silently using the wrong model. If an LLM request or response
validation fails, the mapper falls back safely to local rules.

## Demo Flow

1. Create a profile with reusable information.
2. Create a task with a target URL and profile.
3. Click the primary action to analyze the form and generate mappings.
4. Review mapped fields, fix required values, and confirm mapping.
5. Inspect the profile update summary.
6. Fill the form with Playwright.
7. Review the screenshot while the task is in `WAITING_APPROVAL`.
8. Optionally approve final submission.
9. Run Benchmarks to show measurable extraction and mapping quality.

## Safety Boundaries

- The agent never auto-submits without approval.
- The agent does not solve CAPTCHA.
- The agent does not bypass login.
- The agent does not automate payments, purchases, deletes, or other
  destructive actions.
- LLMs only propose mappings; backend validation and user review remain in the
  loop.

## Recommended Next Expansion

The strongest next direction is reliability and evaluation, not adding broad
new product surface area.

1. Add more benchmark cases for real-world form patterns.
2. Improve option matching for selects, radios, and checkboxes.
3. Improve Review Mapping ergonomics for low-confidence and required fields.
4. Surface action traces in the UI so failures are explainable.
5. Package the project with `docs/architecture.md`, `docs/demo-flow.md`,
   screenshots, and a 1-2 minute demo video.

See [TASKS.md](TASKS.md), [AGENT_RULES.md](AGENT_RULES.md), and
[AI_Web_Form_Agent_Roadmap.md](AI_Web_Form_Agent_Roadmap.md) for the current
development plan.
