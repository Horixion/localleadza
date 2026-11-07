const businesses = [];

const grid = document.getElementById("businessGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

function renderBusinesses() {
  const term = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const matches = businesses.filter((business) => {
    const searchable = [business.name, business.service, business.area, business.description].join(" ").toLowerCase();
    return searchable.includes(term) && (category === "all" || business.category === category);
  });

  if (matches.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon" aria-hidden="true">✳</div>
      <h3>${businesses.length ? "No matches just yet" : "The directory is getting ready."}</h3>
      <p>${businesses.length ? "Try another search or choose a different service." : "We're inviting our first local businesses. Know a photographer or creative professional in the East Rand? Send them our way."}</p>
      <a href="#list-business">${businesses.length ? "Suggest a local business" : "Apply for a free founding listing"} →</a>
    </div>`;
    return;
  }

  grid.innerHTML = matches.map((business) => `<article class="business-card">
    <h3>${escapeHtml(business.name)}</h3>
    <p>${escapeHtml(business.service)} · ${escapeHtml(business.area)}</p>
    <p>${escapeHtml(business.description || "")}</p>
  </article>`).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}

searchInput.addEventListener("input", renderBusinesses);
categoryFilter.addEventListener("change", renderBusinesses);
document.getElementById("year").textContent = new Date().getFullYear();

const listingForm = document.getElementById("listingForm");
const formResult = document.getElementById("formResult");

listingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!listingForm.reportValidity()) return;

  const data = new FormData(listingForm);
  const application = [
    "LOCALLEAD ZA — FREE FOUNDING LISTING APPLICATION",
    "",
    `Business: ${data.get("business")}`,
    `Contact person: ${data.get("contact")}`,
    `Service: ${data.get("service")}`,
    `Area: ${data.get("area")}`,
    `Public contact detail: ${data.get("publicContact")}`,
    `Website/social link: ${data.get("link") || "Not provided"}`,
    "",
    "I understand this is an application only. Please contact me to review the listing before publication."
  ].join("\n");

  formResult.classList.add("visible");
  formResult.innerHTML = "Your application text is ready. Copy it and send it to the LocalLead ZA team once the official contact channel is published.";
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
  formResult.appendChild(copyButton);
});

renderBusinesses();