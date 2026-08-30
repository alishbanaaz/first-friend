# First Friend

An anonymous, judgment-free companion chat app for people who feel isolated and are afraid of being judged — currently pitched toward students. First Friend offers a live, friend-like AI conversation rather than a one-way journal, with built-in safety detection and reminder support.

## Features

- **Live AI companion chat** — real-time, in-conversation replies powered by Google Gemini (not just an end-of-session summary)
- **Inclusive intake** — gender options beyond binary (including free-text "Other"), age range, and free-text physical/hormonal notes instead of forced yes/no questions
- **Safety detection** — risk-keyword detection runs on every message (not only at summarization), with the app surfacing crisis resources when high-risk language is detected
- **Session summarization** — Gemini-powered "Summarize & Draft" for reflecting a session back to the user
- **Reminders** — email reminders saved via Supabase, with a `sessions`/`reminders` schema for scheduling follow-ups
- **Localization** — English and Urdu UI strings
- **Anonymous by default** — session data is not tied to a real identity; context fields are stored locally unless the user opts in

## Tech stack

- **Frontend/Framework:** Next.js 14 + TypeScript
- **Database:** Supabase (Postgres)
- **AI:** Google Gemini API (free tier) — swapped in from an original OpenAI-based design
- **Email:** SendGrid (reminders integration in progress)

## Setup

1. Clone the repo and install dependencies:
2. Copy `.env.example` to `.env` and fill in your own keys:
   - Supabase URL, anon key, and service role key
   - `GEMINI_API_KEY` for Google Gemini
   - SendGrid keys, if testing email reminders
3. In Supabase, create the `reminders` table (see `sql/create_reminders_table.sql`) and a `sessions` table for persistent chat history.
4. Run the dev server:
5. Visit http://localhost:3000

## Safety approach

A keyword-based risk detector runs on every incoming message during the conversation, not just at the end. When high-risk language is detected, the app is designed to surface crisis resources rather than continue the conversation as normal. This is an active area of development — see Roadmap.

## Roadmap

- [ ] Graceful fallback for Gemini free-tier rate limits (in-character retry message instead of a broken error)
- [ ] Persistent memory across return visits (using the `sessions` table)
- [ ] Expanded safety net: larger risk-keyword list, severity tiers, region-appropriate crisis resources
- [ ] UI/UX redesign (chat bubbles, styling, mobile-friendly layout)
- [ ] Finish SendGrid integration, deploy to Vercel, reminder scheduler

## Notes

Built as a solo project, currently in active development. Context fields (gender, hormonal notes) are intentionally free-text/inclusive rather than forced binary choices.
