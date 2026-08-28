---
name: Create reminders table
---

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  email text,
  remind_at timestamptz,
  summary text,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_error text
);
