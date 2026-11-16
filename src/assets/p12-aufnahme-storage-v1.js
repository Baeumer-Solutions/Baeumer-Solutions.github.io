/* Protect-12 Grundmodell: confirmed remote snapshots, separate bearer references. */
(function(){
 'use strict';
 const cfg=window.P12Online,ref=new URLSearchParams(location.hash.slice(1)).get('k');
 const key='p12-aufnahme-online:'+ref;
 let ready=false,busy=false,dirty=false,revision=0,baseline=null,customer=null,conflict=false,timer=null,processing=null,completion=null,failures=0;
 const area=document.createElement('section');area.className='card online-controls';area.innerHTML='<p id="online-status" role="status" aria-live="polite">Ihr Fragebogen wird geladen …</p><div id="online-choice"></div><label><input id="online-consent" type="checkbox"> Ich habe die <a href="/datenschutz/" target="_blank" rel="noopener">Datenschutzhinweise</a> gelesen und stimme der Verarbeitung meiner Angaben für meine Protect-12-Beratung zu. Freiwillige Gesundheitsangaben kann ich auch persönlich besprechen.</label><p>Nach Ihrer Bestätigung werden Änderungen automatisch online zwischengespeichert. Nur „Online gespeichert“ bestätigt den Stand, den Sie auf einem anderen Gerät öffnen können. Ihr persönlicher Link ermöglicht den Zugriff auf Ihre Angaben. Bitte behandeln Sie ihn vertraulich.</p><button class="secondary" id="online-save">Jetzt online speichern</button> <button class="primary" id="online-finish">Zur Auswertung freigeben</button> <button class="secondary" id="online-clear">Lokale Sicherung entfernen</button>';
 document.querySelector('header').insertAdjacentElement('afterend',area);
 const label=document.querySelector('#online-status'),choice=document.querySelector('#online-choice'),consent=document.querySelector('#online-consent');
 document.querySelector('#save-state').parentElement.hidden=true;
 document.querySelector('#load-state').disabled=true;
 function say(text){label.textContent=text;}
 function lock(yes){document.querySelector('.layout').inert=yes;document.querySelectorAll('#online-save,#online-finish,#online-consent').forEach(e=>e.disabled=yes);}
 lock(true);
 const canonical=v=>Array.isArray(v)?'['+v.map(canonical).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}':JSON.stringify(v);
 const equal=(a,b)=>canonical(a)===canonical(b);
 function snap(){let a=JSON.parse(JSON.stringify(snapshot()));a._p12_processing_confirmed=processing;a._p12_status=completion?'Zur Auswertung freigegeben':'Zwischenstand';return a;}
 async function api(data){let controller=new AbortController(),t=setTimeout(()=>controller.abort(),20000);try{let r=await fetch(cfg.api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal,cache:'no-store'});if(!r.ok)throw Error('Übertragung');let s=await r.text();return s?JSON.parse(s):{};}finally{clearTimeout(t);}}
 function parse(data){let rows=data?.records;if(!Array.isArray(rows)||!rows.length)throw Error('Zugang nicht gefunden');let row=rows.slice().sort((a,b)=>String(b.fields?.Eingegangen||b.createdTime||'').localeCompare(String(a.fields?.Eingegangen||a.createdTime||'')))[0],f=row.fields;
  if(!f?.Kunde?.[0]||f.Referenz!==ref)throw Error('Zugang nicht gefunden');let state=JSON.parse(f['Antworten-JSON']||'{}');
  if(state.schema!=='p12-aufnahme-1'||state.model!==DATA.version||typeof state.case_id!=='string'||!state.answers||Array.isArray(state.answers)||!state.scope)throw Error('Antwortformat');return {customer:f.Kunde[0],state};}
 function restore(s){CASE.id=s.case_id;CASE.kontext=s.kontext||[];processing=s._p12_processing_confirmed||null;completion=s._p12_status==='Zur Auswertung freigegeben';loadState(s);consent.checked=!!processing;}
 function local(){try{let s=JSON.parse(localStorage.getItem(key));return s?.reference===ref&&s.snapshot&&s.customer?s:null;}catch{return null;}}
 function persist(){if(!ready)return false;try{localStorage.setItem(key,JSON.stringify({reference:ref,customer,baseline,snapshot:snap(),dirty,updated:Date.now()}));return true;}catch{return false;}}
 function schedule(){clearTimeout(timer);if(ready&&dirty&&consent.checked&&!conflict&&!busy)timer=setTimeout(()=>save(false),Math.min(60000,1500*Math.pow(2,failures)));}
 function mark(){if(!ready||conflict)return;revision++;dirty=true;changed=true;completion=null;const ok=persist();say(consent.checked?'Änderungen '+(ok?'auf diesem Gerät gesichert. ':'')+'Online-Speicherung folgt …':'Angaben auf diesem Gerät '+(ok?'gesichert. ':'nicht speicherbar. ')+'Bitte bestätigen Sie den Verarbeitungshinweis für die Online-Speicherung.');schedule();}
 function conflictWith(server){conflict=true;clearTimeout(timer);choice.replaceChildren();say('Es gibt unterschiedliche Stände. Nichts wurde überschrieben. Bitte wählen Sie den Stand, mit dem Sie fortfahren möchten.');
  for(const [text,useLocal] of [['Meinen aktuellen Stand weiterbearbeiten',true],['Online-Stand laden',false]]){let b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{baseline=server.state;customer=server.customer;if(!useLocal){restore(server.state);dirty=false;changed=false;}else{dirty=true;revision++;}conflict=false;choice.replaceChildren();persist();say(useLocal?'Aktuellen Stand gewählt. Bitte mit „Jetzt online speichern“ bestätigen.':'Online-Stand geladen.');};choice.append(b);}}
 async function save(final){clearTimeout(timer);if(!ready||busy||conflict)return;if(!consent.checked){say('Bitte bestätigen Sie den Verarbeitungshinweis. Es wurden keine Antworten online übertragen.');consent.focus();return;}if(!processing)processing=new Date().toISOString();
  busy=true;document.querySelector('#online-save').disabled=true;document.querySelector('#online-finish').disabled=true;let rev=revision;completion=!!final||completion;let target=snap();persist();say('Online-Speicherung läuft …');
  try{let before=parse(await api({action:'load',respondentId:ref}));if(before.customer!==customer||before.state.case_id!==CASE.id)throw Error('Fallzuordnung');if(!equal(before.state,baseline)){conflictWith(before);return;}
   await api({action:'save',respondentId:ref,kundeId:customer,gespeichert:new Date().toISOString(),beantwortet:DATA.questions.filter(q=>state(q.id).status).length,gesamt:DATA.questions.length,antwortenJson:JSON.stringify(target)});
   let after=parse(await api({action:'load',respondentId:ref}));if(after.customer!==customer||!equal(after.state,target))throw Error('Bestätigung fehlt');baseline=after.state;
   failures=0;if(revision===rev){dirty=false;changed=false;persist();say(final?'Vielen Dank! Ihre Angaben sind zur Auswertung freigegeben und online gespeichert.':'Online gespeichert · '+new Date().toLocaleTimeString('de-DE')+'. Sie können später über denselben Link fortfahren.');}
   else{persist();say('Der vorherige Stand ist online gespeichert. Neuere Änderungen werden noch gesichert.');}
  }catch{failures++;dirty=true;changed=true;let ok=persist();say('Online-Speicherung nicht bestätigt. '+(ok?'Ihre Eingaben bleiben auf diesem Gerät erhalten. Sobald die Verbindung zurück ist, wird erneut gespeichert.':'Bitte lassen Sie diese Seite offen und versuchen Sie es erneut.'));}
  finally{busy=false;document.querySelector('#online-save').disabled=false;document.querySelector('#online-finish').disabled=false;schedule();}}
 // Vorhandene Fragen und Listen sind dynamisch gerendert. Delegierte Ereignisse bleiben wirksam.
 document.addEventListener('input',e=>{if(e.target.closest('article.q')||e.target.id==='feedback')queueMicrotask(mark);});
 document.addEventListener('change',e=>{if(e.target.matches('[data-scope]'))queueMicrotask(mark);});
 document.addEventListener('click',e=>{if(e.target.closest('[data-status],[data-add],[data-confirm]'))queueMicrotask(mark);});
 consent.onchange=()=>{if(consent.checked){processing=processing||new Date().toISOString();mark();}else{processing=null;dirty=true;clearTimeout(timer);persist();say('Automatische Online-Speicherung pausiert. Bereits online gespeicherte Angaben bleiben erhalten.');}};
 document.querySelector('#online-save').onclick=()=>save(false);document.querySelector('#online-finish').onclick=()=>save(true);
 document.querySelector('#online-clear').onclick=()=>{if(dirty){say('Bitte warten Sie auf die Online-Speicherbestätigung, bevor Sie die lokale Sicherung entfernen.');return;}try{localStorage.removeItem(key);say('Lokale Sicherung entfernt. Der bestätigte Online-Stand bleibt erhalten.');}catch{say('Die lokale Sicherung konnte nicht entfernt werden.');}};
 window.addEventListener('online',()=>{if(dirty)schedule();});window.addEventListener('pagehide',()=>{if(dirty)persist();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&dirty)persist();});
 const priorWelcome=welcome;
 welcome=function(){let s=priorWelcome();return s.replace(/<div class="team"><b>Ihr Arbeitsstand<\/b>.*?<\/div>/s,'<div class="team"><b>Automatisch zwischenspeichern</b><p>Nach Ihrer Bestätigung oben werden Änderungen automatisch online gesichert. Warten Sie vor dem Schließen bitte auf „Online gespeichert“. Beim nächsten Öffnen Ihres persönlichen Links können Sie weiterarbeiten.</p></div>').replace('Sicherung herunterladen','Jetzt online speichern');};
 const priorReview=review;review=function(){priorReview();let box=document.createElement('div');box.className='card';box.innerHTML='<h2>Bereit für unser Gespräch?</h2><p>Offene Punkte dürfen offenbleiben. Mit „Zur Auswertung freigeben“ halten Sie fest, dass wir Ihre Angaben für die Vorbereitung unseres Gesprächs verwenden können. Änderungen werden weiterhin automatisch gespeichert.</p><button class="primary" id="review-finish-online">Zur Auswertung freigeben</button>';document.querySelector('#main').append(box);document.querySelector('#review-finish-online').onclick=()=>save(true);};
 window.P12OnlineState=()=>({ready,busy,dirty,conflict,revision});
 if(!/^gm-(?:qa-)?[a-f0-9]{48}$/.test(ref||'')){say('Bitte öffnen Sie Ihren persönlichen Fragebogenlink aus unserer E-Mail.');document.querySelector('#main').innerHTML='<h1>Ihr persönlicher Zugang</h1><p>Ohne Ihren persönlichen Link werden keine Angaben geladen oder gespeichert.</p>';return;}
 (async()=>{try{let server=parse(await api({action:'load',respondentId:ref}));customer=server.customer;baseline=server.state;restore(server.state);ready=true;lock(false);let previous=local();
   if(previous&&previous.customer===customer&&previous.snapshot.case_id===CASE.id&&previous.dirty&&!equal(previous.snapshot,server.state)){
    if(equal(previous.baseline,server.state)){restore(previous.snapshot);dirty=true;changed=true;say('Noch nicht online gesicherte Eingaben dieses Geräts wiederhergestellt. Automatische Speicherung folgt nach Ihrer Bestätigung.');schedule();}
    else conflictWith(server);
   }else say('Ihr persönlicher Fragebogen ist geladen. '+(processing?'Der gespeicherte Stand ist bereit.':'Bitte prüfen Sie die übernommenen Angaben und bestätigen Sie den Verarbeitungshinweis für das automatische Speichern.'));
   render();
  }catch{say('Ihr Fragebogen konnte nicht sicher geladen werden. Bitte versuchen Sie es erneut oder melden Sie sich bei uns. Es werden keine leeren Daten gespeichert.');}})();
 window.P12OnlineState=()=>({ready,busy,dirty,conflict,revision});
})();
