// Read-only production smoke test for CB Depot's dedicated Cloudflare Pages project.
// Never creates bookings, sends emails, or modifies customer data.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const origin='https://cb-depot-booking.pages.dev';
const API='https://bowacxhmjvrqixtwaikv.supabase.co/functions/v1';
const key='05a5f9ae-9b1b-4b1c-9e06-392940e028b1';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function retry(label,fn){
  let last;
  for(let i=0;i<5;i++){
    try{await fn();console.log('PASS '+label);return}
    catch(err){last=err;console.log('Retry '+label+': '+err.message);if(i<4)await sleep(8000)}
  }
  throw Error(label+': '+last?.message);
}
async function fetchBody(path){
 const r=await fetch(origin+path,{cache:'no-store'});
 assert.equal(r.status,200,path+' HTTP '+r.status);
 return r.text();
}
await retry('public CB Depot and legal routes',async()=>{
 const home=await fetchBody('/');
 assert.match(home,/CB Depot/i);
 for(const url of ['/booking/','/booking/return/','/cb-depot/privacy/','/cb-depot/terms/']){
  const html=await fetchBody(url);
  assert.match(html,/<html/i);
 }
});
const slugs=['tle-booking-flow-pricing','tle-booking-flow-availability','tle-booking-flow-inquiry','tle-booking-return-service','tle-booking-smart-welcome'];
async function preflight(slug){
 const r=await fetch(API+'/'+slug,{method:'OPTIONS',headers:{Origin:origin,'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});
 assert.equal(r.status,204,slug+' preflight '+r.status);
 assert.equal(r.headers.get('access-control-allow-origin'),origin,slug+' origin mismatch');
}
for(const slug of slugs)await retry(slug+' CORS',()=>preflight(slug));
await retry('public CB Depot catalog',async()=>{
 const r=await fetch(API+'/tle-booking-flow-pricing',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({action:'public',booking_key:key})});
 const j=await r.json();
 assert.equal(r.status,200,'catalog HTTP '+r.status+': '+JSON.stringify(j).slice(0,300));
 assert.equal(j.business_name,'CB Depot');
 assert.ok(Array.isArray(j.services)&&j.services.length>0,'no services configured');
 console.log('CB Depot services:',j.services.length);
});
let chrome='';
for(const cmd of ['google-chrome','google-chrome-stable','chromium']){try{chrome=execFileSync('which',[cmd],{encoding:'utf8'}).trim();if(chrome)break}catch{}}
assert.ok(chrome,'Chromium unavailable');
await retry('actual rendered client homepage in Chrome',async()=>{
 const dom=execFileSync(chrome,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--window-size=390,844','--virtual-time-budget=16000','--dump-dom',origin+'/'],{encoding:'utf8',timeout:90000,maxBuffer:12000000,stdio:['ignore','pipe','pipe']});
 const title=(dom.match(/<title>([^<]*)/i)||[])[1]||'';
 const name=(dom.match(/<small[^>]*id="leadName"[^>]*>([^<]*)/i)||[])[1]||'';
 const desc=(dom.match(/<p[^>]*id="baseDescription"[^>]*>([^<]*)/i)||[])[1]||'';
 console.log('Browser title:',title,'brand:',name,'hero:',desc);
 assert.match(title,/CB Depot/i);
 assert.match(name,/CB Depot/i);
 assert.match(desc,/we bring professional car detailing to your location/i);
 assert.ok(!/Booking Page unavailable|Página de reservas no disponible/i.test(dom),'Live page shows unavailable state');
 assert.ok(/buyer-live-page/.test(dom),'Booking JS did not initialize');
});
console.log('All live CB Depot booking smoke tests passed, no customer data touched.');
