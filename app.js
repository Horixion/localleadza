/* LocalLead ZA — neighbourhood-first directory. Add only owner-approved listings. */
const businesses = [];
const API_ENDPOINT = window.LOCALLEAD_API_URL || "";
const grid=document.getElementById("businessGrid"), searchInput=document.getElementById("searchInput"), categoryFilter=document.getElementById("categoryFilter"), areaFilter=document.getElementById("areaFilter"), sortFilter=document.getElementById("sortFilter"), listingCount=document.getElementById("listingCount"), resultsSummary=document.getElementById("resultsSummary"), clearSearch=document.getElementById("clearSearch");
const areaAliases={"kempton-park":["kempton park","kempton-park"],birchleigh:["birchleigh"],"birchleigh-north":["birchleigh north","birchleigh-north"],"glen-marais":["glen marais","glen-marais"],"norkem-park":["norkem park","norkem-park"],"east-rand":["east rand","benoni","boksburg","edenvale","germiston","tembisa"]};
function escapeHtml(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function matchesArea(b,a){if(a==="all")return true;const area=String(b.area||"").toLowerCase();return(areaAliases[a]||[a]).some(x=>area.includes(x));}
function safeUrl(v){try{const u=new URL(v);return["http:","https:"].includes(u.protocol)?u.href:"";}catch{return"";}}
function safeEmail(v){const e=String(v||"").trim();return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)?e:"";}
function safeTel(v){const p=String(v||"").replace(/[^+\d]/g,"");return p.length>=7?p:"";}
function safeWhatsApp(v){const p=String(v||"").replace(/\D/g,"");return p.length>=9?"https://wa.me/"+p:"";}
function renderBusinesses(){
 const term=searchInput.value.trim().toLowerCase(),cat=categoryFilter.value,area=areaFilter.value;clearSearch.hidden=!term;
 let matches=businesses.filter(b=>[b.name,b.service,b.area,b.description,...(b.tags||[])].join(" ").toLowerCase().includes(term)&&(cat==="all"||b.category===cat)&&matchesArea(b,area));
 if(sortFilter.value==="name")matches.sort((a,b)=>a.name.localeCompare(b.name));
 if(sortFilter.value==="area")matches.sort((a,b)=>a.area.localeCompare(b.area));
 if(sortFilter.value==="recommended")matches.sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured))||a.name.localeCompare(b.name));
 listingCount.textContent=String(businesses.length).padStart(2,"0")+" LISTINGS";
 resultsSummary.textContent=matches.length===businesses.length?(businesses.length?"Showing all "+matches.length+" approved listings":"The first names are being gathered."):"Showing "+matches.length+" of "+businesses.length+" approved listings";
 if(!matches.length){const filtered=Boolean(term)||cat!=="all"||area!=="all";grid.innerHTML='<div class="empty-state"><div class="empty-icon" aria-hidden="true">✳</div><h3>'+(filtered?"Nothing under that heading.":"The first edition is taking shape.")+'</h3><p>'+(filtered?"Try another search or clear the filters.":"We’re speaking to independent creative businesses around Kempton Park. Know someone whose work belongs here? Send them the free founding-listing form.")+'</p>'+(filtered?'<button class="reset-button" id="resetFilters" type="button">CLEAR FILTERS</button>':'<a href="#list-business">APPLY FOR A FREE FOUNDING LISTING ↗</a>')+'</div>';document.getElementById("resetFilters")?.addEventListener("click",resetAllFilters);return;}
 grid.innerHTML=matches.map(b=>{const web=safeUrl(b.website),wa=safeWhatsApp(b.whatsapp),email=safeEmail(b.email),phone=safeTel(b.phone),badge=b.verified?'<span class="verified-badge">✓ VERIFIED</span>':'<span class="listing-badge">OWNER-APPROVED</span>';const links=[wa?'<a class="card-contact" href="'+wa+'" target="_blank" rel="noopener noreferrer">WHATSAPP ↗</a>':"",email?'<a class="card-contact" href="mailto:'+email+'">EMAIL ↗</a>':"",phone?'<a class="card-contact" href="tel:'+phone+'">CALL ↗</a>':"",web?'<a class="card-contact" href="'+web+'" target="_blank" rel="noopener noreferrer">WEBSITE ↗</a>':""].filter(Boolean).join("");return '<article class="business-card"><div class="card-topline"><span class="category-label">'+escapeHtml(b.service)+'</span>'+badge+'</div><h3>'+escapeHtml(b.name)+'</h3><p class="card-area">⌖ '+escapeHtml(b.area)+'</p><p class="card-description">'+escapeHtml(b.description||"")+'</p><div class="card-tags">'+(b.tags||[]).slice(0,3).map(t=>"<span>"+escapeHtml(t)+"</span>").join("")+'</div><div class="card-actions">'+(links||'<span class="contact-pending">CONTACT DETAILS TO FOLLOW</span>')+'</div></article>';}).join("");
}
function resetAllFilters(){searchInput.value="";categoryFilter.value="all";areaFilter.value="all";sortFilter.value="recommended";renderBusinesses();}
searchInput.addEventListener("input",renderBusinesses);categoryFilter.addEventListener("change",renderBusinesses);areaFilter.addEventListener("change",renderBusinesses);sortFilter.addEventListener("change",renderBusinesses);
clearSearch.addEventListener("click",()=>{searchInput.value="";renderBusinesses();searchInput.focus();});
document.getElementById("year").textContent=new Date().getFullYear();
const menuToggle=document.getElementById("menuToggle"),mainNav=document.getElementById("mainNav");
menuToggle.addEventListener("click",()=>{const open=menuToggle.getAttribute("aria-expanded")==="true";menuToggle.setAttribute("aria-expanded",String(!open));menuToggle.setAttribute("aria-label",open?"Open navigation":"Close navigation");mainNav.classList.toggle("nav-open",!open);});
mainNav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{menuToggle.setAttribute("aria-expanded","false");menuToggle.setAttribute("aria-label","Open navigation");mainNav.classList.remove("nav-open");}));
const listingForm=document.getElementById("listingForm"),formResult=document.getElementById("formResult");
function showFormMessage(message,success){formResult.replaceChildren();formResult.classList.add("visible");formResult.style.borderLeftColor=success?"var(--olive)":"var(--red)";const p=document.createElement("p");p.textContent=message;formResult.appendChild(p);formResult.scrollIntoView({behavior:"smooth",block:"nearest"});}
listingForm.addEventListener("submit",async event=>{
 event.preventDefault();if(!listingForm.reportValidity())return;const d=new FormData(listingForm);if(String(d.get("website_confirm")||"").trim())return;
 if(!API_ENDPOINT){showFormMessage("The online application connection is being configured. Your details have not been sent or stored.",false);return;}
 const button=listingForm.querySelector('button[type="submit"]');button.disabled=true;button.innerHTML="SENDING APPLICATION <span>…</span>";
 const payload={business:String(d.get("business")).trim(),contact:String(d.get("contact")).trim(),ownerEmail:String(d.get("ownerEmail")).trim(),ownerPhone:String(d.get("ownerPhone")).trim(),service:String(d.get("service")).trim(),area:String(d.get("area")).trim(),publicContact:String(d.get("publicContact")||"").trim(),link:String(d.get("link")||"").trim(),description:String(d.get("description")||"").trim(),permission:d.get("permission")==="on",approvalNotice:d.get("approvalNotice")==="on",website_confirm:""};
 try{const response=await fetch(API_ENDPOINT,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const result=await response.json().catch(()=>({}));if(!response.ok)throw new Error(result.error||"The application could not be submitted.");listingForm.reset();showFormMessage("Application received. Thank you — your details are now in our private review queue. We’ll contact you before anything is published.",true);}
 catch(error){showFormMessage(error.message||"Something went wrong. Please try again later.",false);}
 finally{button.disabled=false;button.innerHTML='Send application <span>↗</span>';}
});
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
renderBusinesses();