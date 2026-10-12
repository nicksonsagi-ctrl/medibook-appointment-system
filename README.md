# MediBook — Smart Appointment Booking System

A complete React application for patient appointment booking and clinic administration. Built with Vite, JavaScript/JSX, Tailwind CSS v4 and its official Vite plugin, React Router, Supabase Auth/PostgreSQL, Radix accessible dialogs (shadcn/ui-compatible), Lucide, Motion, date-fns, and Sonner.

## Run in VS Code

Requirements: Node.js 22.12+ (Node 24 was used for validation), npm, and an existing Supabase project with the supplied schema. Open **this folder** in VS Code; do not create a nested project.

```sh
npm ci
cp .env.example .env.local
# Edit .env.local with your Supabase project URL and publishable key.
npm run dev
```

On Windows, copy `.env.example` to `.env.local` using VS Code or `Copy-Item .env.example .env.local` in PowerShell. Vite prints the local development address. Restart Vite after changing environment variables.

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use only your Supabase **publishable** browser key (or the project's legacy public anon key). Never use a secret or service-role key. These VITE variables are public and compiled into the browser bundle. Do not commit `.env.local`, tokens, or patient exports. Actual secret configuration belongs in environment settings, never chat.

Without the variables, the landing page, navigation, authentication forms, and responsive design run, while data-backed areas show an explicit configuration error. No doctors, appointments, authentication, or successful bookings are fabricated. The hero uses an included original SVG healthcare illustration; it is not a clinic doctor profile. Testimonials are labelled sample content. Doctor cards use actual database rows.

## Existing database contract — verify before production

This application does **not** create, migrate, or weaken database security rules. It uses your existing tables exactly:

- `profiles`: `id`, `full_name`, `phone`, `role`, `created_at`.
- `doctors`: `id`, `name`, `specialty`, `qualification`, `experience_years`, `consultation_fee`, `image_url`, `bio`, `active`, `created_at`.
- `doctor_slots`: `id`, `doctor_id`, `starts_at`, `ends_at`.
- `appointments`: `id`, `patient_id`, `slot_id`, `reason`, `status`, `created_at`.

Expected foreign keys: `profiles.id → auth.users.id`, `doctor_slots.doctor_id → doctors.id`, `appointments.patient_id → profiles.id` (or auth.users.id), and `appointments.slot_id → doctor_slots.id`. Slot and doctor joins use these relationships; patient names are loaded separately from profiles, so a direct appointments-to-profiles FK is not required.

Roles are `patient` / `admin` (uppercase profile roles are accepted by the UI); appointment statuses are lowercase `pending`, `confirmed`, `completed`, `cancelled`. Public registration sends only `full_name` and `phone` as Auth metadata, never a role. Your existing secure signup trigger must create a profile with the patient role. Users must not be able to assign admin through Auth metadata or write their own `profiles.role`. Provision an admin through your trusted Supabase administration process; no admin password is shipped.

### Required server-side safeguards

Verify these in the existing SQL Editor schema and policies; frontend checks are convenience, not authorization:

1. RLS enabled on all four tables. Public users can read active doctors and safe availability only. Patients can read their own profile/appointments, insert only their own pending bookings on active doctors' future available slots, and cannot write admin records. Admin access is determined by a trusted server-side role lookup. Patients cannot update their roles.
2. A **partial unique index on appointments(slot_id) where status IN ('pending','confirmed')** prevents simultaneous reservation of the same slot. Without this existing database constraint, frontend availability checks cannot prevent double-booking. The application reports PostgreSQL `23505` as an already-booked message and refreshes availability.
3. Patient cancellation RPC: `cancel_my_appointment(p_appointment_id uuid)`. The SDK sends `{ p_appointment_id: appointmentId }`. This argument name is an integration assumption because the SQL definition was not provided. If your existing function uses another name, change **only this RPC argument** in `src/services/api.js` to match. The function must check `auth.uid()`, ownership, allowed source statuses and any cancellation cutoff, and release a reservation atomically. Patients never issue a direct appointment UPDATE.
4. Admin appointment updates must be limited to pending→confirmed/cancelled and confirmed→completed/cancelled, with terminal states immutable. UI completion is available only after the slot ends. Enforce lifecycle and time restrictions in the database too. Updates include the old status in the WHERE clause to detect concurrent changes.
5. `starts_at` / `ends_at` are `timestamptz`; end time follows start time. Existing constraints must prevent overlapping doctor slots and preserve booked slot history. Deletion of a slot with history is disabled in the UI; FK/DB rules must also protect history.
6. Booking insert policies must reject past slots and inactive doctors regardless of client-supplied values. Do not rely on local time or route guards to enforce this.

### Availability and RLS: important integration requirement

The availability query reads `doctor_slots` joined to `doctors` and **RLS-visible** `appointments(status)`. It excludes elapsed slots, inactive doctors, and visible pending/confirmed reservations. PostgreSQL RLS may hide another patient's appointment row, so an empty embedded appointments array alone **does not prove a slot is free**.

Your existing `doctor_slots` SELECT policy must withhold slots reserved by other patients (using a secure server-side availability check) from public/patient readers while still allowing a patient to read slots associated with their own appointment history and allowing admins to read all necessary slots. The client then filters out its own visible active bookings. Public reads of the embedded appointments relationship must be permitted under RLS without exposing patient rows; RLS must return no private appointment data to anonymous users. A table grant alone is not a broad RLS policy.

If the existing schema does not have this availability contract, hiding **other patients'** reservations cannot be implemented reliably with these tables and private appointment RLS alone. Ask your database architect to provide a reviewed secure availability view/RPC or revise the slot visibility policy. This project does not invent an undeclared endpoint or make appointments public. The unique reservation index still prevents conflicting inserts, but correct availability display is a database integration prerequisite. Validate both anonymous and authenticated slot queries against your real policies.

Queries fetch RLS-visible records in ordered batches of 500 to avoid the usual 1,000-row API cap; configure a Supabase max-row setting of at least 500. Large clinics should use server-side aggregate statistics and server-side search/pagination to reduce dashboard load. Concurrent writes between pages can affect a report; these statistics are an operational overview, not an audited financial report.

## Authentication configuration

In Supabase **Authentication → URL Configuration**, set Site URL to your production URL and add your local development URL and production `/dashboard` callback to allowed redirect URLs. Enable/configure email verification as desired. If enabled, signup displays a check-email message; the link returns to `/dashboard`. Login reads the authenticated profile to determine the permitted dashboard. Profile failures are surfaced rather than granting a fallback role. Session restore shows loading states. Email/password login, logout, and email-verification callback are supported; password recovery is outside this MVP.

## Routes

| Area | Routes |
| --- | --- |
| Public | `/`, `/doctors`, `/doctors/:id`, `/login`, `/register` |
| Patient | `/dashboard`, `/my-appointments`, `/book/:doctorId` |
| Admin | `/admin`, `/admin/doctors`, `/admin/slots`, `/admin/appointments` |
| Errors | `/forbidden`, `/unauthorized`, any unknown path |

Role guards use the authenticated database profile. Database RLS remains the security boundary. Unknown roles are rejected. Every query includes loading/error handling; booking confirmation is shown only after a successful actual database insert.

Patient times are displayed in the browser's local time zone, explicitly labelled. Admin datetime inputs also use local time; writes convert to ISO. Fees are shown as clinic-supplied numeric amounts without inventing a currency; confirm currency and payment details with your clinic. Payments, prescriptions, medical-record storage, rescheduling, and doctor-user accounts are outside this MVP.

## Project structure

```text
src/
  components/
    layout/          Public, patient, admin layouts and role guards
    ui/              Shared accessible controls, dialogs and error boundary
    doctors/         Reusable real-data doctor cards
    appointments/    Slot picker and patient/admin booking displays
  contexts/          Auth session and profile state
  hooks/             Reloadable async data loading
  lib/               Supabase client and booking domain rules
  pages/
    public/          Landing, directory, doctor details, error pages
    auth/            Login and patient registration
    patient/         Dashboard, bookings, appointment history
    admin/           Dashboard, doctors, slots, appointment management
  services/          Supabase queries and RPC calls
```

## Validation

```sh
npm test
npm run build
npm run preview
```

The automated domain tests verify active/future/reserved-slot filtering, cancellation release semantics, terminal lifecycle restrictions, pre-visit completion blocking, local-date grouping, and unique-conflict messaging. They do not prove database security or live authentication.

### Manual integration and deployment checklist

Run these against a nonproduction Supabase project with existing policies. Use two independent patient accounts and an administrator; never ship a service key to execute client tests.

- [ ] Patient signup creates a patient-only profile. Verify email confirmation when enabled; login and logout work.
- [ ] Registration metadata cannot promote an account to admin; direct profile role writes fail.
- [ ] Admin login routes to the admin dashboard; patient admin URLs go to Forbidden.
- [ ] Public doctor listing shows only active doctors. Name and specialty searches work; doctor details load.
- [ ] Admin creates/edits a doctor and deactivates them. Deactivated doctors cannot receive new bookings.
- [ ] Future slots display by doctor/local date, past slots are hidden, other patients' reserved slots are hidden without exposing their data.
- [ ] Admin slot creation validates future start/end times and overlap constraints; booked slot history cannot be deleted.
- [ ] A new booking creates a real own-user `pending` record, shows its actual doctor/time, and refreshes availability.
- [ ] Two patients attempt the same slot concurrently. One succeeds; the other receives a friendly unique-constraint error. No duplicate active reservations exist.
- [ ] Patient cancellation calls `cancel_my_appointment`, changes only their own eligible booking, and releases its time.
- [ ] Admin confirms a pending booking, completes a confirmed booking after it ends, and cancels eligible bookings. Invalid/replayed transitions fail in the database.
- [ ] Appointment stats/status analytics match records for the RLS-visible dataset. Patient search and status/date filtering work.
- [ ] Patient A cannot read/cancel patient B's appointments, including via direct SDK requests.
- [ ] Patients cannot create/edit doctors or slots, read private profiles, or directly change appointment statuses through SDK calls.
- [ ] Session restoration, invalid login, expired sessions, missing profiles, network errors and configuration errors are handled clearly.
- [ ] Desktop/tablet/mobile layouts have no overflow; menu and dialogs work with keyboard, Escape and focus return. Test actual logged-in dashboards after connecting Supabase.
- [ ] Production build succeeds; run production preview and inspect browser console.
- [ ] On Vercel, refresh `/doctors`, `/dashboard`, and `/admin/appointments` directly; SPA routes load and auth guards run.

Live Supabase integration/security and deployed navigation were **not validated** during initial development: no Supabase URL/key or SQL policy definitions were supplied. See `VALIDATION.md` for checks actually executed.

## Deploy on Vercel

1. Import the repository into Vercel. Use the **Vite** preset; install command `npm ci`, build command `npm run build`, output directory `dist`.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel environment settings for the required deployment scopes. Redeploy after changing them.
3. `vercel.json` rewrites application routes to `index.html` and preserves asset paths.
4. Configure Supabase Site URL/redirect allowlist for the deployed origin and test verification redirects.
5. Complete the database integration/security checklist above before accepting patient bookings. No database rules were changed by this project.

## Cloud environment

The prepared environment uses the existing checkout in `/workspace/medibook-appointment-system`. Cloud tasks are already isolated; do not create a Git worktree unless explicitly requested. Run `npm ci` to refresh dependencies; processes must restart with `npm run dev` in future tasks. Environment setup/start instructions are saved separately in cloud environment settings. Saving a configuration draft does not publish the environment or deploy to Vercel.
