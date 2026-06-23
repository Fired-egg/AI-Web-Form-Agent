# AI Web Form Agent

A human-in-the-loop browser automation agent that fills web forms from user
profile data and pauses before final submission.

## Project Structure

```text
backend/    FastAPI, agent services, and Playwright automation
frontend/   React and Vite user interface
docs/       Architecture and project documentation
```

## Planned Stack

- Python, FastAPI, and Playwright
- React and Vite
- OpenAI API or Gemini API

## Safety Boundaries

- Never auto-submit a form without user approval.
- Do not solve CAPTCHA or bypass login.
- Do not automate payments or purchases.

See [TASKS.md](TASKS.md) for the development roadmap and
[AGENT_RULES.md](AGENT_RULES.md) for project constraints.
