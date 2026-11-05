(function(){'use strict';
const params=new URLSearchParams(location.search),key=params.get('k')||'',form=params.get('bogen')||'START';
const root=document.getElementById('p12-fragebogen-root');
function message(t){if(root){root.textContent=t;root.style.cssText='padding:40px;font:18px/1.6 system-ui';}}
async function open(){
 if(!/^[a-f0-9]{64}$/.test(key)){message('Der persönliche Zugangslink ist unvollständig. Bitte öffnen Sie den gesamten Link aus Ihrer Nachricht.');return;}
 message('Ihr persönlicher Fragebogen wird geöffnet …');
 try{
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const r=await fetch('https://protect-12.de/assets/exclusiv/'+hash+'.json',{cache:'no-store',referrerPolicy:'no-referrer'});if(!r.ok)throw Error('Zugangsdatei nicht erreichbar');const payload=await r.json();
 const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));const k=await crypto.subtle.importKey('raw',Uint8Array.from(key.match(/../g),x=>parseInt(x,16)),'AES-GCM',false,['decrypt']);const data=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(payload.iv)},k,decode(payload.data));
 const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));const bundle=JSON.parse(await new Response(stream).text());let page=bundle.pages[form];if(!page)throw Error('Bogen nicht gefunden');for(const [id,src] of Object.entries(bundle.assets||{}))page=page.split(id).join(src);
 // The document and save connections stay on the established customer-portal route.
 document.open();document.write(page);document.close();
 document.addEventListener('click',e=>{const a=e.target.closest('[data-text-form]');if(!a)return;e.preventDefault();const content=bundle.texts[a.dataset.textForm];if(!content)return;const u=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const l=document.createElement('a');l.href=u;l.download='Protect12_Fragebogen.txt';l.click();setTimeout(()=>URL.revokeObjectURL(u),1000);});
 }catch(e){message('Der Fragebogen konnte nicht vollständig geladen werden. Bitte öffnen Sie den Link in einem aktuellen Browser erneut. Falls die Meldung bleibt, kontaktieren Sie Protect-12.');console.error('Exclusiv portal load failed:',e.name);}
}
// Use the existing portal consent screen; never preselect or submit consent.
const timer=setInterval(()=>{try{if(localStorage.getItem('p12-fb-einwilligung-'+key)&&!document.getElementById('p12gate')){clearInterval(timer);open();}}catch(e){clearInterval(timer);message('Bitte erlauben Sie diesem Browser das Speichern von Website-Daten, damit Sie den Fragebogen bearbeiten können.');}},250);
})();
