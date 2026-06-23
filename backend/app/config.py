"""Application configuration."""

APP_TITLE = "AI Web Form Agent API"
APP_VERSION = "0.1.0"

# Vite uses port 5173 by default. The 127.0.0.1 variants are included so
# either common local development hostname can access the API.
CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
