/* LocalLead ZA — static, zero-cost directory front end.
   Add a business here only after the owner has approved the exact listing details.
   Category values: photography, videography, photo-booth, design, creative.
*/
const businesses = [];

const grid = document.getElementById("businessGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const areaFilter = document.getElementById("areaFilter");
const sortFilter = document.getElementById("sortFilter");
const listingCount = document.getElementById("listingCount");
const resultsSummary = document.getElementById("resultsSummary");
const clearSearch = document.getElementById("clearSearch");

const areaAliases = {
  "kempton-park": ["kempton park", "kempton-park"],
  "birchleigh": ["birchleigh"],
  "birchleigh-north": ["birchleigh north", "birchleigh-north"],
  "glen-marais": ["glen marais", "glen-marais"],
  "norkem-park": ["norkem park", "norkem-park"],
  "east-rand": ["east rand", "benoni", "boksburg", "edenvale", "germiston", "tembisa"]
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

function matchesArea(business, selectedArea) {
  if (selectedArea === "all") return true;
  const area = String(business.area || "").toLowerCase();
  return (areaAliases[selectedArea] || [selectedArea]).some((alias) => area.includes(alias));
}

function renderBusinesses() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const selectedArea = areaFilter.value;
  clearSearch.hidden = !term;

  let matches = businesses.filter((business) => {
    const searchable = [business.name, business.service, business.area, business.description, ...(business.tags || [])].join(" ").toLowerCase();
    return searchable.includes(term) &&
      (category === "all" || business.category === category) &&
      matchesArea(business, selectedArea);
  });

  if (sortFilter.value === "name") matches.sort((a, b) => a.name.localeCompare(b.name));
  if (sortFilter.value === "area") matches.sort((a, b) => a.area.localeCompare(b.area));
  if (sortFilter.value === "recommended") matches.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || a.name.localeCompare(b.name));

  listingCount.textContent = businesses.length === 1 ? "1 business" : `${businesses.length} businesses`;
  resultsSummary.textContent = matches.length === businesses.length
    ? (businesses.length ? `Showing all ${matches.length} approved listings` : "We're inviting our first local businesses.")
    : `Showing ${matches.length} of ${businesses.length} approved listings`;

  if (!matches.length) {
    const hasFilters = Boolean(term) || category !== "all" || selectedArea !== "all";
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon" aria-hidden="true">✳</div>
      <h3>${hasFilters ? "No listings match those filters" : "The directory is getting ready."}</h3>
      <p>${hasFilters ? "Try a different search or clear the filters to see all available businesses." : "We're inviting our first local businesses. Know a photographer or creative professional in the East Rand? Share the free founding-listing application with them."}</p>
      ${hasFilters ? '<button class="button button-outline reset-button" id="resetFilters" type="button">Clear all filters</button>' : '<a href="#list-business">Apply for a free founding listing →</a>'}
    </div>`;
    const reset = document.getElementById("resetFilters");
    if (reset) reset.addEventListener("click", resetAllFilters);
    return;
  }

  grid.innerHTML = matches.map((business) => {
    const safeName = escapeHtml(business.name);
    const website = safeUrl(business.website);
    const whatsapp = safeWhatsApp(business.whatsapp);
    const email = safeEmail(business.email);
    const phone = safeTel(business.phone);
    const categoryLabel = escapeHtml(business.service);
    const badge = business.verified ? '<span class="verified-badge" title="Listing details confirmed with the business">✓ Verified</span>' : '<span class="listing-badge">Owner-approved</span>';
    const contactLinks = [
      whatsapp ? `<a class="card-contact" href="${whatsapp}" target="_blank" rel="noopener noreferrer">WhatsApp <span aria-hidden="true">↗</span></a>` : "",
      email ? `<a class="card-contact" href="mailto:${email}">Email <span aria-hidden="true">↗</span></a>` : "",
      phone ? `<a class="card-contact" href="tel:${phone}">Call <span aria-hidden="true">↗</span></a>` : "",
      website ? `<a class="card-contact card-website" href="${website}" target="_blank" rel="noopener noreferrer">Website <span aria-hidden="true">↗</span></a>` : ""
    ].filter(Boolean).join("");
    return `<article class="business-card">
      <div class="card-topline"><span class="category-label">${categoryLabel}</span>${badge}</div>
      <h3>${safeName}</h3>
      <p class="card-area"><span aria-hidden="true">⌖</span> ${escapeHtml(business.area)}</p>
      <p class="card-description">${escapeHtml(business.description || "")}</p>
      <div class="card-tags">${(business.tags || []).slice(0, 3).map(tag => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="card-actions">${contactLinks || '<span class="contact-pending">Contact details coming soon</span>'}</div>
    </article>`;
  }).join("");
}

function safeUrl(value) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : ""; }
  catch { return ""; }
}
function safeEmail(value) {
  const email = String(value || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}
function safeTel(value) {
  const phone = String(value || "").replace(/[^+\d]/g, "");
  return phone.length >= 7 ? phone : "";
}
function safeWhatsApp(value) {
  const phone = String(value || "").replace(/\D/g, "");
  return phone.length >= 9 ? `https://wa.me/${phone}` : "";
}
function resetAllFilters() {
  searchInput.value = "";
  categoryFilter.value = "all";
  areaFilter.value = "all";
  sortFilter.value = "recommended";
  renderBusinesses();
}

searchInput.addEventListener("input", renderBusinesses);
categoryFilter.addEventListener("change", renderBusinesses);
areaFilter.addEventListener("change", renderBusinesses);
sortFilter.addEventListener("change", renderBusinesses);
clearSearch.addEventListener("click", () => { searchInput.value = ""; renderBusinesses(); searchInput.focus(); });
document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  menuToggle.setAttribute("aria-label", expanded ? "Open navigation" : "Close navigation");
  mainNav.classList.toggle("nav-open", !expanded);
});
mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  mainNav.classList.remove("nav-open");
}));

const listingForm = document.getElementById("listingForm");
const formResult = document.getElementById("formResult");
listingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!listingForm.reportValidity()) return;

  const data = new FormData(listingForm);
  const application = [
    "LOCALLEAD ZA — FREE FOUNDING LISTING APPLICATION",
    "Application status: Awaiting review — NOT approved for publication",
    "",
    `Business: ${data.get("business")}`,
    `Contact person: ${data.get("contact")}`,
    `Business email or phone: ${data.get("ownerContact")}`,
    `Main service: ${data.get("service")}`,
    `Area: ${data.get("area")}`,
    `Public business contact: ${data.get("publicContact")}`,
    `Website/social link: ${data.get("link") || "Not provided"}`,
    `Description: ${data.get("description") || "Not provided"}`,
    "",
    `Permission to contact: ${data.get("permission") ? "Yes" : "No"}`,
    `Understands owner approval is required before publication: ${data.get("publication") ? "Yes" : "No"}`,
    "",
    "Please contact me to review the exact listing before publication."
  ].join("\n");

  formResult.replaceChildren();
  formResult.classList.add("visible");
  const message = document.createElement("p");
  message.textContent = "Your application is ready. Nothing has been sent. Copy the text or download it, then send it to the LocalLead ZA team through its official contact channel.";
  formResult.appendChild(message);

  const actions = document.createElement("div");
  actions.className = "application-actions";
  const copyButton = document.createElement("button");
  copyButton.className = "copy-button";
  copyButton.type = "button";
  copyButton.textContent = "Copy application";
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(application);
      copyButton.textContent = "Copied ✓";
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = application;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
      copyButton.textContent = "Copied ✓";
    }
  });
  const downloadButton = document.createElement("button");
  downloadButton.className = "download-button";
  downloadButton.type = "button";
  downloadButton.textContent = "Download .txt";
  downloadButton.addEventListener("click", () => {
    const blob = new Blob([application], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "locallead-za-listing-application.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  });
  actions.append(copyButton, downloadButton);
  formResult.appendChild(actions);
  formResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
renderBusinesses();