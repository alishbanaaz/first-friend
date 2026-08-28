- Added reminders backend and frontend components on branch reminders-and-ur.
- Files added:
  - lib/supabaseAdmin.ts (server-side Supabase client)
  - pages/api/reminder.ts (create reminder)
  - pages/api/send-due-reminders.ts (send due reminders via SendGrid)
  - components/ReminderPanel.tsx (email opt-in UI)
  - locales/en.json, locales/ur.json (basic translations)
  - utils/i18n.ts (simple i18n helper)
  - sql/create_reminders_table.sql (SQL to create reminders table)

Next steps for you to test locally:
1. Run SQL in Supabase SQL editor (sql/create_reminders_table.sql).
2. Add SUPABASE_SERVICE_ROLE_KEY and SENDGRID_API_KEY/SENDGRID_FROM to env when ready.
3. Run app and open a session. Enter an email and consent to schedule a reminder.
4. To trigger sending (for testing) call the API: POST /api/send-due-reminders (this requires SendGrid keys configured).

If you want, I can now open a PR from reminders-and-ur into main. Reply "open PR" to create it, or "push to main" to merge directly.
