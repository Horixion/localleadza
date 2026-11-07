const AIRTABLE_API = "https://api.airtable.com/v0";
function cors(origin, allowed) {
  return {"Access-Control-Allow-Origin":allowed,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"};
}
export default {
 async fetch(request, env) {
  const origin=request.headers.get("Origin")||"", allowed=env.ALLOWED_ORIGIN||"https://horixion.github.io", headers=cors(origin,allowed);
  if(origin!==allowed)return new Response("Origin not allowed",{status:403});
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(request.method!=="POST")return Response.json({error:"Method not allowed"},{status:405,headers});
  try {
   const size=Number(request.headers.get("Content-Length")||0);
   if(size>12000)return Response.json({error:"Application is too large."},{status:413,headers});
   const d=await request.json();
   if(String(d.website_confirm||"").trim())return Response.json({ok:true},{status:200,headers});
   for(const f of ["business","contact","ownerEmail","ownerPhone","service","area"])if(!String(d[f]||"").trim())return Response.json({error:"Please complete all required fields."},{status:400,headers});
   if(!d.permission||!d.approvalNotice)return Response.json({error:"Both consent confirmations are required."},{status:400,headers});
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.ownerEmail)))return Response.json({error:"Enter a valid email address."},{status:400,headers});
   const services=["Photography","Videography","Photo booth hire","Design & branding","Other creative services"];
   if(!services.includes(d.service))return Response.json({error:"Choose a valid service."},{status:400,headers});
   const link=String(d.link||"").trim();
   if(link){let u;try{u=new URL(link);}catch{}if(!u||!["http:","https:"].includes(u.protocol))return Response.json({error:"Enter a valid website or social link."},{status:400,headers});}
   const fields={"Business":String(d.business).trim().slice(0,80),"Service":d.service,"Area":String(d.area).trim().slice(0,80),"Owner contact (private)":String(d.contact).trim().slice(0,80)+" | "+String(d.ownerPhone).trim().slice(0,40),"Owner email (private)":String(d.ownerEmail).trim().slice(0,120),"Permission to contact":true,"Owner approved publication":false,"Verified with owner":false,"Listing status":"Application received"};
   if(d.publicContact)fields["Public contact approved"]=String(d.publicContact).trim().slice(0,120);
   if(link)fields["Website/social approved"]=link;
   if(d.description)fields["Approved description"]=String(d.description).trim().slice(0,300);
   const response=await fetch(AIRTABLE_API+"/"+env.BASE_ID+"/"+env.TABLE_ID,{method:"POST",headers:{"Authorization":"Bearer "+env.AIRTABLE_TOKEN,"Content-Type":"application/json"},body:JSON.stringify({records:[{fields}],typecast:false})});
   const result=await response.json();
   if(!response.ok)return Response.json({error:"Airtable could not save the application. Please try again later."},{status:502,headers});
   return Response.json({ok:true,received:Boolean(result.records&&result.records.length)},{status:201,headers});
  } catch(e) {return Response.json({error:"Unable to process the application right now."},{status:500,headers});}
 }
};