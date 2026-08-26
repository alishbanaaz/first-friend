# First Friend — Starter (Web MVP)

This is a minimal Next.js + TypeScript starter for the First Friend MVP: anonymous sessions, optional context (gender + hormones), AI summarization (no RAG), simple safety pre-check, and .ics reminders.

Quick setup
1. Copy files into a new Next.js project folder.
2. Create a Supabase project (optional but recommended) and add a `sessions` table with at least columns:
   - id (text, primary key)
   - created_at (timestamp with time zone)
   - messages (jsonb)
   - retention_expires_at (timestamp with time zone, nullable)
3. Populate `.env` from `.env.example` with your Supabase and OpenAI keys.
4. Install deps:
   npm install
5. Run dev:
   npm run dev
6. Visit http://localhost:3000

Notes & next steps
- Summarization uses the OpenAI API; ensure OPENAI_API_KEY is set.
- Safety: a simple keyword filter is used server-side; if high-risk language is detected, the app shows crisis resources and does not call the LLM.
- Context (gender/hormone) is stored locally by default. Only persist server-side with explicit consent.
- To push to production, add proper DB migrations, stronger safety pipelines, localizations (Urdu + English), and privacy/legal pages.

If you'd like, I can continue with:
- Email reminder testing and example flows (SendGrid)
- Urdu translations for UI strings (included in a basic form)
- Admin reporting page and analytics
