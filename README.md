# CB Depot · Booking Page

Independent static booking website for **CB Depot — professional on-location car detailing**.

This repository contains the complete standalone site's HTML, CSS, JavaScript, approved client logo and actual vehicle photos in `public/`. The live reservation and quote workflows use the existing CB Depot account in Supabase; the site does **not** require a second database or a second Command Center.

## Publish on Cloudflare Pages

Create a **Pages** project (not a Worker) connected to this repository.

| Setting | Value |
| --- | --- |
| Repository | `thelaunchera/cb-depot-booking` |
| Project name | `cb-depot` (if available) |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | Leave blank (already-built static files) |
| Build output directory | `public` |
| Root directory | Leave blank |

Cloudflare should provide `https://cb-depot.pages.dev/` **only if the project name is available and deployment succeeds**. Never advertise this URL before verifying it.

The site's root redirects to its own local `/booking/` route using the existing CB Depot public booking identifier. The `/booking/` page, `/booking/return/`, legal routes, scripts and images are all served by the new Pages host. The public booking identifier is not a private authorization credential.

## Before switching the official public link

1. Confirm the exact live Pages hostname and that the hero says “We bring professional car detailing to your location.”
2. Confirm CB Depot branding, six configured services, photos, quote form and availability render in mobile and desktop browsers.
3. Authorize the **exact new Pages origin** in the existing booking Edge Functions. Do not add an unverified hostname.
4. Test a quote request, confirmation email, booking and cancel/reschedule in the appropriate safe test workflow.
5. Update the CB Depot booking account’s `booking_page_url` and the buyer Command Center’s public-link allowlist **together**, once the new hostname is confirmed. Preserve the old link until this passes.
6. Refresh buyer Dashboard and confirm `Copy Booking Link` and `Open Booking Page` return the new client-branded URL.
7. Only then update the customer onboarding email. Send a test email to the owner before emailing the client.

The client's private Command Center is separate. Do not place Command Center credentials, service-role tokens or private preview URLs in this public repository.

## Refresh client files

The `Prepare CB Depot Booking Website` GitHub Action initially copied the canonical CB Depot booking site's full production-ready static build into this repository. To sync approved updates from the upstream template later, run that action manually from **Actions → Prepare CB Depot Booking Website → Run workflow**. The action rebuilds the CB Depot-only site and commits any changed public files; it does not submit booking requests or send emails.

## Client QA

See the successful repository preparation run in **Actions**. That run verifies the branded client root, the booking page, legal routes and that desktop/mobile hero images and approved favicons exist. The website does not have live Cloudflare booking support until the origin configuration and end-to-end tests above pass.
