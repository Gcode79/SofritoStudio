# Procfile for deploying the webhook server on platforms that use it
# (Render, Railway, Heroku). Start command for the FastAPI app:
web: cd webhook_server && uvicorn main:app --host 0.0.0.0 --port ${PORT:-5000}
