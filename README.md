# LocalLead ZA

A mobile-first, zero-budget local discovery directory, starting with photographers, videographers and creative service providers in Kempton Park and the East Rand.

## Live site

https://horixion.github.io/localleadza/

## Current static build

- Responsive landing page with mobile navigation
- Directory search, service filter, area filter and sorting
- Listing cards support owner-approved contact links, tags and verified status
- Free founding-listing application form with explicit consent
- Copy and download application text; the form does **not** transmit data
- SEO metadata, Open Graph metadata and structured WebSite data
- Basic offline caching through a service worker
- Accessible skip link, visible focus states, labels and reduced-motion support
- No paid hosting, paid APIs, tracking scripts or database credentials

## Project files

- `index.html` — page structure, metadata and content
- `styles.css` — responsive visual design
- `app.js` — directory data, filtering, rendering and application helper
- `manifest.webmanifest` — web app metadata
- `sw.js` — basic static asset cache
- `favicon.svg` — LocalLead mark

## Adding a business

The directory data is currently an empty array at the top of `app.js`. Add a record only after the owner has approved the exact details.

Example record:

```js
{
  name: "Example Creative Studio",
  service: "Photography",
  category: "photography",
  area: "Birchleigh, Kempton Park",
  description: "Portrait and event photography.",
  tags: ["Portraits", "Events"],
  website: "https://example.com",
  whatsapp: "27820000000",
  email: "hello@example.com",
  phone: "+27820000000",
  verified: true,
  featured: false
}
```

Allowed category values: `photography`, `videography`, `photo-booth`, `design`, `creative`.

Never copy details from another directory into LocalLead ZA without the business owner's permission. Do not mark a listing verified until the owner has confirmed the details.

## Application form limitation

The static form validates details and creates copyable/downloadable application text locally in the visitor's browser. It does not send, store, or notify LocalLead ZA. A real submission workflow needs a trusted form endpoint or backend. Do not place private API keys in front-end JavaScript.

## Offline behaviour

The service worker caches the core static assets after the first successful visit. A new deployment may take a refresh or two to replace a previously cached version.

## Publish

GitHub Pages is configured to publish the root of the `main` branch. Commit changes to `main`; GitHub Pages will redeploy automatically.

## Privacy and launch checklist

- Set up an official LocalLead ZA email or WhatsApp Business contact channel before inviting public applications.
- Connect the application form to a secure form endpoint before claiming submissions are received.
- Collect explicit owner permission before publishing a business name, description, logo, photos, phone number, email, social link or website.
- Send the proposed listing to the owner for final approval.
- Verify contact details directly with the owner before marking the listing verified.
- Provide a clear correction/removal process.
- Keep private application/contact-person details out of public listing data.
- Do not add paid listings until the free directory has demonstrated genuine customer demand.

## Zero-budget approach

Keep GitHub Pages and the static site free. Do not buy a domain, paid ads or subscriptions until the directory has real users and a clear reason to spend.
