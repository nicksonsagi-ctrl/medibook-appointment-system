# Validation results

## Executed successfully

- Installed dependencies using npm; then verified a repeatable clean `npm ci` from the committed-format lockfile.
- `npm run build`: successful production build, with route lazy-loading and separate Supabase/accessibility chunks. No final chunk-size warnings.
- `npm test`: 4 tests executed; 4 passed; 0 failed/skipped. Covers future/active/reserved slot filtering, cancelled reservation release, appointment lifecycle/completion timing, unique-conflict messaging and local calendar grouping.
- `npm audit --omit=dev --audit-level=high`: 0 reported production dependency vulnerabilities at execution time. This is an advisory registry check, not a comprehensive security audit.
- Started Vite development server and production preview and exercised both in headless Chromium.
- Development browser checks: landing, directory, login, registration, missing doctor/configuration error, forbidden and 404 pages render. All patient/admin routes redirect a logged-out visitor to login. Mobile menu navigation works; unconfigured login fails with a helpful message. No captured browser runtime errors.
- Production browser checks at **390 px, 768 px, and 1440 px**: landing, directory, registration and Forbidden pages render with no horizontal overflow. Hero search navigates to the correctly encoded directory query. Unconfigured signup shows an explicit configuration error without claiming account creation. Direct patient/admin routes redirect to login. No captured browser runtime errors.
- Visual inspection of desktop/mobile landing screenshots; fixed mobile CTA overflow and replaced an unavailable remote hero image with an included local SVG illustration. Browser installation download was blocked by the network, so tests used the already installed system Chromium with TLS/security verification unchanged.

## Not executed — external configuration required

No Supabase project URL, publishable key, SQL definitions, or authorized live test accounts were available. Actual authentication, email verification, profile trigger behavior, doctor/slot writes, booking, cross-user reservation availability, cancellation RPC signature/behavior, administrator updates, and RLS/constraint enforcement were **not verified**. These cannot be inferred from a passing frontend build or route guards.

The cancellation adapter assumes `cancel_my_appointment(p_appointment_id uuid)`. Confirm the existing function argument name. Availability requires server-side slot visibility rules that hide other patients' reservations without making their appointments public; verify the documented contract in README. No SQL schema, RLS policies, or unique indexes were changed.

Logged-in dashboard/mobile management behavior remains on the integration checklist because real data and credentials were unavailable. The code is included and bundled, but those interactions are not claimed tested against a real backend.

The application was not deployed to Vercel, and cloud publication/fresh-task restoration was not performed. `vercel.json`, deployment instructions, complete source, and a detailed manual integration checklist are included. Review/save the cloud environment configuration draft and publish through environment settings when the external prerequisites are ready.
