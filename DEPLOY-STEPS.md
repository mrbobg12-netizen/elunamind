# Deploying this update

Covers Group A (uploads, transcripts, voice-over, translation, PPT download,
mind maps), Group B (trial, sub-admins, support inbox) and Group C so far
(error monitoring, card-backed trial with self-serve cancel).

Order matters: **database first, code second.** The code is written to survive a
missing migration, but the new features stay switched off until the SQL has run.

---

## 1. Put the files in your local repo

1. Unzip `elunamind-update.zip`.
2. Copy everything from inside it **over** your local clone of the repo,
   replacing files when asked.
3. `.env.local` is **not** in the zip, so your local keys are untouched.

What you should see afterwards in GitHub Desktop:

**New files**
```
lib/roles.ts                        lib/support.ts
lib/support-shared.ts               lib/transcribe.ts
lib/uploads.ts                      lib/extract.ts
lib/export/pptx.ts                  lib/export/docs.ts
app/_components/Attach.tsx          app/_components/Speak.tsx
app/_components/ExportMenu.tsx
app/api/upload/route.ts             app/api/uploads/[id]/route.ts
app/api/transcript/route.ts         app/api/translate/route.ts
app/api/trial/route.ts
app/api/support/route.ts            app/api/support/[id]/route.ts
app/api/admin/support/route.ts      app/api/admin/support/[id]/route.ts
app/dashboard/files/page.tsx        app/dashboard/transcript/page.tsx
app/dashboard/translate/page.tsx    app/dashboard/support/page.tsx
app/admin/support/page.tsx
supabase/006_uploads.sql            supabase/007_trial_roles_support.sql
```

**Changed files** — `lib/auth.ts`, `lib/plans.ts`, `lib/settings.ts`,
`app/api/chat/route.ts`, `app/api/chats/[id]/route.ts`, `app/api/generate/route.ts`,
`app/api/usage/route.ts`, `app/api/admin/*`, `app/dashboard/*`, `app/admin/*`,
`app/_components/*`, `app/blog/page.tsx`, `package.json`, `.env.example`.

---

## 2. Run the SQL (Supabase → SQL Editor)

Run these **in order**, one at a time, in the Supabase project you use for the demo.
Both are safe to run twice, so re-run if you are unsure whether one went through.

| # | File | Expected output |
|---|------|-----------------|
| 1 | `supabase/006_uploads.sql` | `uploads ready` |
| 2 | `supabase/007_trial_roles_support.sql` | `trial, roles and support ready` |
| 3 | `supabase/008_errors_and_billing.sql` | `errors and billing ready` |

`NOTICE: constraint ... does not exist, skipping` lines are normal on a first run.
Anything starting with `ERROR:` is not — stop and send me the message.

### What 006 creates
- `uploads` table, `chat_messages.upload_id` column
- a **private** storage bucket called `uploads` (25 MB ceiling)

### What 007 creates
- `profiles.trial_started_at`, `profiles.trial_ends_at`
- `sub_admin` added to the allowed roles
- `support_tickets` and `support_messages` tables
- `start_trial()` function, and updated `admin_overview()` / `admin_user_list()`

### What 008 creates
- `app_errors` + `error_groups`, and the `record_error` / `prune_errors` functions
- `profiles.subscription_status`, `card_trial_ends_at`, `cancel_at_period_end`,
  `current_period_end` — the billing state behind "renews on the 30th"

### Verify it worked
Run this and check all seven rows say `yes`:

```sql
select 'uploads table'   as thing, to_regclass('public.uploads')          is not null as ok
union all select 'tickets table',  to_regclass('public.support_tickets')  is not null
union all select 'messages table', to_regclass('public.support_messages') is not null
union all select 'trial column',   exists (select 1 from information_schema.columns
                                           where table_name='profiles' and column_name='trial_ends_at')
union all select 'uploads bucket', exists (select 1 from storage.buckets where id='uploads')
union all select 'errors table',   to_regclass('public.app_errors')            is not null
union all select 'billing columns',exists (select 1 from information_schema.columns
                                           where table_name='profiles' and column_name='cancel_at_period_end');
```

---

## 3. Netlify environment variables

Nothing here is required — the deploy works without touching it. Add these only
when you want to change the defaults:

| Variable | Default | Why you would set it |
|----------|---------|----------------------|
| `OPENAI_TRANSCRIBE_MODEL` | `whisper-1` | Transcription model, once you are on a paid OpenAI key |
| `OPENAI_AUDIO_MODEL` | falls back to `OPENAI_MODEL` | Model used for the Gemini audio fallback |
| `TRANSCRIBE_MAX_BYTES` | `12582912` (12 MB) | Raise only if your host allows long requests |

**Check this is still right:** `SUPABASE_SERVICE_ROLE_KEY` must hold the key that
starts with `sb_secret_`, never the `sb_publishable_` one. `/diagnose` tells you
which one is loaded without printing it.

**Before taking real payments:** `DEMO_CHECKOUT` must be `0`. At `1` anyone gets
Premium for free.

---

## 4. Push

In GitHub Desktop: review the changed files, write a commit message
("uploads, transcripts, trial, sub-admins, support"), **Commit to main**, then **Push origin**.

Netlify builds automatically. Expect roughly 2–4 minutes.

If the build fails, copy the last 30 lines of the Netlify deploy log — the error is
almost always a missing environment variable, not the code.

---

## 5. After the deploy — do these once

1. **Reset the site copy.** Admin → Branding & site → **Reset to defaults**, then
   Save. Your old tagline and hero text are stored in the database and would keep
   overriding the new wording.
2. **Check the new switches.** Admin → Branding & site should now show
   *In-app support tickets* and *Offer a free Premium trial* with a length field.
3. **Check the new limits.** Admin → Plans & limits should now list Uploads,
   Transcripts and Translate alongside the old tools.

---

## 6. Test it end to end (10 minutes)

Use a second, non-admin account for this — the admin account sees Premium tools anyway.

**Uploads**
- [ ] Dashboard → My Files → drop in a PDF. It shows as ready with a page count.
- [ ] Press **Ask** → chat opens with the file attached → ask something only that
      file answers → the answer uses it.
- [ ] Press **Notes** → notes are generated from the file, not from a typed prompt.
- [ ] Delete the file. It disappears, and Supabase → Storage → uploads loses the object.
- [ ] Upload a renamed `.exe` as `.pdf` — it is refused.

**Transcripts**
- [ ] Upload a short voice note on Lecture Transcripts. You get a transcript **and**
      revision notes.
- [ ] Run the same file again — it says it did not use an allowance.

**Voice-over**
- [ ] Hover an answer in chat → **Listen** reads it aloud. No `**` or LaTeX is spoken.

**Translation**
- [ ] Paste a paragraph, pick a language, press Translate, then **Compare**.

**PowerPoint**
- [ ] Slide Builder → generate → **Download** → the `.pptx` opens in PowerPoint.

**Free trial**
- [ ] On a fresh free account the upgrade button reads
      *"Try Premium free for 7 days"*.
- [ ] Press it. Premium tools unlock, the sidebar shows a countdown.
- [ ] Press it again elsewhere — it is refused, one trial per account.

**Support**
- [ ] As the user: Help & support → open a ticket.
- [ ] As the admin: Admin → Support inbox shows it with a dot. Reply. Status
      becomes *Replied*.
- [ ] Back as the user: the reply is there, and the ticket can be closed.

**Sub-admin**
- [ ] Admin → Users → open a test account → **Make sub-admin**.
- [ ] Log in as them: the panel shows Overview, Support, Users, Blog —
      **not** Plans & limits, Branding or Activity log.
- [ ] On a user page they see the plan but no buttons to change it.

---

## 7. Known limits, so they do not surprise you

- **Long recordings.** Netlify cuts a function off at 26 seconds, so transcription
  is capped at 12 MB (~15 minutes). Longer audio needs a background worker, which
  is not built yet. The UI says so.
- **Scanned PDFs** have no text layer. The error tells the user to upload the page
  as an image instead, which goes through vision.
- **Read-aloud uses the browser's own voices**, not an API. Quality depends on the
  user's device, and the button hides itself where the browser has no speech engine.
  This costs nothing per use, and works on the free Gemini key.
- **Gemini has no transcription endpoint.** The code tries Whisper first, then falls
  back to sending the audio as a chat message. On a paid OpenAI key the first path
  is used and quality is better.
- **Trial expiry is a date comparison**, so nothing needs to run on a schedule.
  A trial that ends while someone is mid-session applies on their next request.
