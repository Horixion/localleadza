/**
 * LocalLead ZA -> Airtable secure form bridge
 *
 * Deploy as a Cloudflare Worker. Add AIRTABLE_TOKEN as a Worker secret.
 * Never put the token in website JavaScript or commit it to GitHub.
 */
const SITE_ORIGIN = "https://horixion.github.io";
const BASE_ID = "appDIQDwAoW4oLo9o";
const TABLE_ID = "tblnodJaOycYDGvPU";

const corsHeaders = {
  "Access-Control-Allow-Origin": SITE_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin"
};

function reply(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function clean(value, max = 300) {
  return String(value ?? "").trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      if (request.headers.get("Origin") !== SITE_ORIGIN) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "POST") return reply({ error: "Method not allowed." }, 405);
    if (request.headers.get("Origin") !== SITE_ORIGIN) return reply({ error: "Request origin not allowed." }, 403);
    if (!env.AIRTABLE_TOKEN) return reply({ error: "The application service is not configured yet." }, 503);

    const length = Number(request.headers.get("Content-Length") || 0);
    if (length > 12000) return reply({ error: "Application is too large." }, 413);

    let data;
    try { data = await request.json(); }
    catch { return reply({ error: "Please submit a valid application." }, 400); }

    // Quietly accept honeypot submissions without writing them to the database.
    if (clean(data.website_confirm, 200)) return reply({ ok: true });

    const business = clean(data.business, 80);
    const contact = clean(data.contact, 80);
    const ownerEmail = clean(data.ownerEmail, 120).toLowerCase();
    const ownerPhone = clean(data.ownerPhone, 40);
    const service = clean(data.service, 80);
    const area = clean(data.area, 80);
    const publicContact = clean(data.publicContact, 120);
    const link = clean(data.link, 180);
    const description = clean(data.description, 300);

    const allowedServices = ["Photography", "Videography", "Photo booth hire", "Design & branding", "Other creative services"];
    if (!business || !contact || !validEmail(ownerEmail) || !ownerPhone || !area || !allowedServices.includes(service)) {
      return reply({ error: "Please check the required fields and try again." }, 400);
    }
    if (data.permission !== true || data.approvalNotice !== true) {
      return reply({ error: "Please confirm both consent statements before submitting." }, 400);
    }
    if (link) {
      try { const parsed = new URL(link); if (!["https:", "http:"].includes(parsed.protocol)) throw new Error(); }
      catch { return reply({ error: "Please enter a valid website or social link." }, 400); }
    }

    const fields = {
      "Business": business,
      "Service": service,
      "Area": area,
      "Owner contact (private)": contact,
      "Owner email (private)": ownerEmail,
      "Owner phone (private)": ownerPhone,
      "Permission to contact": true,
      "Owner approved publication": false,
      "Verified with owner": false,
      "Listing status": "Application received"
    };
    if (publicContact) fields["Proposed public contact (private)"] = publicContact;
    if (link) fields["Proposed website/social (private)"] = link;
    if (description) fields["Proposed description (private)"] = description;

    const airtableResponse = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ records: [{ fields }], typecast: false })
    });

    if (!airtableResponse.ok) {
      // Do not expose Airtable response details or credentials to public visitors.
      return reply({ error: "We couldn't save the application just now. Please try again later." }, 502);
    }
    return reply({ ok: true, message: "Application received." }, 201);
  }
};
