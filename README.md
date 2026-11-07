# LocalLead ZA

A neighbourhood-first directory of independent creative businesses, starting in Kempton Park and the East Rand.

## Live site

https://horixion.github.io/localleadza/

## Visual identity and directory

- Editorial, print-inspired layout with a cream, ink and muted-red palette
- Responsive navigation and mobile layout
- Directory search, service filter, suburb filter and sorting
- Listing cards support owner-approved contact links, tags and verified status
- No invented listings: the public directory starts empty until owners approve publication
- Free founding-listing application

## Airtable application workflow

The private Airtable base is **LocalLead ZA Command Centre**. Applications are written to **Applications & Listings** only through the secure Worker in `worker/index.js`.

The Worker deliberately stores application details as private/proposed information:
- Owner contact, email and phone are private
- Proposed public contact, website/social link and description remain private
- Listing status starts as `Application received`
- Owner-approved publication and verified flags remain false

Do not copy proposed fields into public fields or publish a business until the owner has reviewed and approved the exact listing details.

### One-time deployment steps (free-tier approach)

1. Create a Cloudflare account if you do not already have one. Use the free Workers option; do not select a paid plan.
2. In Cloudflare, open **Workers & Pages** and create a Worker named `localleadza-form-bridge`.
3. Replace its starter code with the contents of `worker/index.js`, then deploy.
4. In the Worker settings, add a secret named `AIRTABLE_TOKEN`. Use an Airtable personal access token with record-write access only to the LocalLead ZA Command Centre base. Never paste the token into GitHub, `config.js`, or this README.
5. Copy the deployed Worker URL (ending in `.workers.dev`).
6. Edit `config.js` and set `window.LOCALLEAD_API_URL` to that exact Worker URL, then commit the change.
7. Wait for GitHub Pages to publish, submit one test application using your own test details, and confirm it appears in the Airtable **Applications & Listings** table before announcing that applications are open.

Until steps 1–6 are completed, the website intentionally tells visitors that applications are not yet being submitted. Do not claim the form is connected before the test record appears in Airtable.

### Security notes

- Airtable credentials are server-side Worker secrets, never browser code.
- The Worker checks the GitHub Pages Origin header and sets matching CORS headers for browsers, validates required fields and consent, limits field lengths, and ignores honeypot spam submissions. Origin/CORS checks are not authentication and can be spoofed by non-browser clients; monitor submissions and add stronger abuse controls if traffic grows.
- CORS is not a complete anti-spam or authentication system. Monitor the table for abuse and rotate the Airtable token if it is exposed.
- The Worker never sets owner publication approval or verification to true.
- The application form collects personal contact details. Keep the Airtable base private and restrict access to people who need it.

## Project files

- `index.html` — page structure, metadata and content
- `styles.css` — responsive visual design
- `app.js` — directory rendering, filters and form submission
- `config.js` — public Worker URL only (no secrets)
- `worker/index.js` — secure Airtable submission bridge
- `manifest.webmanifest` — web app metadata
- `sw.js` — basic static asset cache
- `favicon.svg` — LocalLead mark

## Directory rules

- Add a business only after the owner approves the exact details.
- Do not mark a listing verified until details are confirmed directly with the owner.
- Never copy business contact information from another directory without permission.
- Provide a clear correction and removal process.
- Keep private application details out of the public directory.

## Zero-budget approach

Keep GitHub Pages and the available free Worker tier. Do not buy a domain, ads, paid upgrades or subscriptions until the directory has genuine usage and revenue to justify spending.
