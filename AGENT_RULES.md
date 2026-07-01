# AGENT_RULES.md

Project:
AI Web Form Agent

Goal:
Build a human-in-the-loop browser automation agent that can analyze web forms,
map reusable profile data to fields, fill the form in a real browser, and pause
before any final submission.

Current Product Positioning:
- This is not a hard-coded selector script.
- This is a local, review-first form-filling agent for demos, interviews, and
  controlled experiments.
- The core value is the loop: discover fields -> map data -> let the user
  review -> fill safely -> wait for explicit approval.

Tech Stack:
- Backend: Python, FastAPI, SQLAlchemy, SQLite
- Browser Automation: Playwright
- Frontend: React, Vite
- LLM Providers: OpenAI, Gemini, or DeepSeek
- Evaluation: Local benchmark HTML forms and expected mapping JSON

Architecture:
React Frontend -> FastAPI Backend -> Agent Services -> Playwright Browser

Persistent Data:
- profiles: reusable user profile fields and custom values
- tasks: one form-filling workflow per target URL/profile pair
- form_fields: extracted fields and reviewed mappings
- action_logs: user-facing task logs
- screenshots: browser evidence for task stages
- llm_api_usage_logs: provider/model usage and cache metrics
- llm_mapping_cache: reusable LLM mapping responses
- user_mapping_override_cache: user-confirmed field mapping preferences
- form_analysis_cache: reusable extracted form metadata
- benchmark_runs / benchmark_case_results: local evaluation history
- task_action_traces: detailed admin/debug trace of browser execution

Core Workflow:
1. User creates or edits a Profile.
2. User creates a Task with URL, profile, and optional description.
3. Agent analyzes the page and extracts fields.
4. Agent maps fields using rules or an LLM provider.
5. User reviews and edits mapped values.
6. Confirm Mapping writes reusable values back to the Profile when safe.
7. Agent fills the form with Playwright.
8. Agent stops in WAITING_APPROVAL.
9. User may explicitly confirm final submission.

Task Statuses:
- CREATED: task exists but has not been analyzed.
- ANALYZING: backend is opening the page and extracting fields.
- LOGIN_REQUIRED: page appears to need manual login before extraction.
- LOGIN_IN_PROGRESS: user login browser is open.
- MAPPING_READY: fields are extracted and ready to map/review.
- READY_TO_FILL: user confirmed mapping.
- FILLING: Playwright is filling mapped fields.
- WAITING_APPROVAL: form is filled and waiting before submit.
- COMPLETED: user approved final submit and submission finished.
- FAILED: workflow hit an unrecovered error.

Core Modules:
- FormExtractor: extract fields, labels, hints, options, and login gates.
- FieldMapper: map profile data to fields with rules, LLMs, caches, and user
  overrides.
- BrowserExecutor: execute Playwright actions, save screenshots, and record
  detailed traces.
- Mapping/Analysis Caches: reuse stable analysis and mapping work.
- BenchmarkRunner: evaluate extraction and mapping quality with local cases.
- Review Mapping UI: let users inspect, correct, and confirm mappings.
- Profile Memory: persist reusable confirmed values into built-in or custom
  profile fields.

Safety Rules:
- Never auto-submit a form without explicit user approval.
- Do not solve CAPTCHA or bypass anti-bot controls.
- Do not automate payment, purchase, billing, delete, or other destructive
  actions.
- Do not store passwords, OTPs, payment card data, login tokens, or one-time
  consent/action values as reusable profile data.
- Manual login support may open a user-controlled browser session, but it must
  not bypass login or guess credentials.
- LLMs may propose mappings only; they must not directly control the browser.
- Any LLM output must be validated before it affects task state.

Scope Rules:
- Keep the project suitable for a portfolio/demo project.
- Prefer one clear user workflow over many half-finished features.
- Do not add multi-agent systems, RAG, user management, cloud browser clusters,
  or mass-application automation.
- Avoid turning this into a scraping, spam, or bulk-submission tool.
- Keep implementation beginner-readable: small functions, clear names, and
  comments only where behavior is not obvious.
- Each change should touch only the files needed for that feature.

Recommended Expansion Direction:
1. Reliability first: improve benchmarks, required-field handling, option
   matching, and regression tests.
2. Human review second: make Review Mapping faster, clearer, and safer.
3. Observability third: expose action traces, failure reasons, and run timeline
   so demos and debugging are easy.
4. Real-world readiness fourth: support more form patterns and manual login
   recovery without weakening safety boundaries.
5. Packaging last: architecture docs, demo flow, screenshots, demo video, and
   resume bullets.
