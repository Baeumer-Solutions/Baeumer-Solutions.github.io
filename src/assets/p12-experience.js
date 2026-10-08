/* Public editorial examples. All bundled cases are synthetic. No submission or persistence. */
(function(){
 'use strict';
 const all=(s,r=document)=>Array.from(r.querySelectorAll(s));
 const one=(s,r=document)=>r.querySelector(s);
 all('[data-explorer]').forEach(root=>{
   const choose=key=>{all('[data-choice]',root).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.choice===key)));all('[data-panel]',root).forEach(p=>p.hidden=p.dataset.panel!==key);};
   all('[data-choice]',root).forEach(b=>b.addEventListener('click',()=>choose(b.dataset.choice)));
 });
 all('[data-dependency]').forEach(root=>{
  const texts={normal:'Im Muster hängen mehrere Funktionen vom selben Stromweg ab. Die Bedienung ist eine weitere gemeinsame Voraussetzung.',strom:'Unterbrochener Stromweg: Heizfunktion, elektrische Pumpe und Router müssen gemeinsam betrachtet werden. Ein anderer vorbereiteter Kontaktweg benötigt seine eigenen geprüften Voraussetzungen.',person:'Fehlende Bedienperson: Vorhandene Technik allein reicht nicht. Zuständigkeit, Befähigung und eine tatsächlich eingewiesene Vertretung werden zu den nächsten Prüffragen.'};
  all('[data-failure]',root).forEach(b=>b.addEventListener('click',()=>{
   const k=b.dataset.failure;all('[data-failure]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
   all('[data-node]',root).forEach(n=>{const affected=k==='strom'?['strom','waerme','wasser','kontakt'].includes(n.dataset.node):k==='person'?['person','waerme','wasser'].includes(n.dataset.node):false;n.classList.toggle('is-affected',affected);n.setAttribute('aria-label',n.textContent+(affected?' · im Beispiel von der gewählten Unterbrechung betroffen':''));});
   one('[data-failure-copy]',root).textContent=texts[k];
  }));
 });
 all('[data-location-demo]').forEach(root=>{
  const select=one('[data-stock-location]',root);
  const render=()=>{all('[data-location]',root).forEach(n=>{const active=n.dataset.location===select.value;n.classList.toggle('is-selected',active);one('[data-location-stock]',n).textContent=active?'1 Kiste · 6 Packungen':'Dieser Mustervorrat liegt hier nicht.';});one('[data-location-total]',root).textContent='Gesamtbestand bleibt: 1 Kiste mit 6 Packungen. Nur die Zuordnung ändert sich.';};select.addEventListener('change',render);render();
 });
 const scenario=[
  ['Stromausfall','Energie, elektrisch betriebene Funktionen, Kontaktwege und persönliche Versorgungsabhängigkeiten','Welche Funktionen hängen an derselben Versorgung?',[2,4,5,6,11]],
  ['Wasserausfall','Nutzbarer Bestand, individuelle Bedarfe, Hygiene und geeignete alternative Versorgung','Was ist tatsächlich nutzbar und wie wird Qualität fachlich geklärt?',[2,3,5,8,11]],
  ['Kommunikationsausfall','Information, abgestimmte Kontaktwege, Rückmeldung und Dokumentation','Welcher vorher vereinbarte Ersatzweg bleibt erreichbar?',[1,6,7,9,10]],
  ['Versorgungsengpass','Bestände, täglicher Bedarf, Lagerung und realistische Ergänzung','Welche Position begrenzt die Planung zuerst?',[2,3,4,5,8]],
  ['Unwetter','Standort, Zugang, Gebäudebezug, Transport und amtliche Hinweise','Welche Wege oder Funktionen sind örtlich betroffen?',[0,4,6,7,11]],
  ['Gesundheitliche Einschränkung','Betreuung, Rollen, Vertretung und individuelle fachliche Versorgung','Wer übernimmt welche vereinbarte Aufgabe?',[1,5,7,9,10]],
  ['Längere Infrastrukturstörung','Mehrere Versorgungsfunktionen, Nachschub, Wartung und Belastung','Wo bestehen gemeinsame Abhängigkeiten?',[1,2,3,4,5,6,7,8,9,10,11]],
  ['Unruhe im Umfeld','Information, diskrete Vorbereitung, Wege und persönliche Entscheidungen','Welche bestätigten örtlichen Informationen verändern die Prüffragen?',[0,1,6,7,10]]
 ];
 const windows=['Was ist sofort zugänglich, bedienbar und abgestimmt?','Welche Reserven, Vertretungen und Alternativen tragen unter den betrachteten Bedingungen?','Wie passen täglicher Bedarf, nutzbarer Bestand und Betrieb zusammen?','Welche Rolle spielen Wartung, Verbrauchsmittel, Betreuung und Nachschub?','Welche Voraussetzungen müssten langfristig erhalten oder ergänzt werden?','Welche Anpassungen, Quellen und regelmäßigen Prüfungen wären erforderlich?'];
 all('[data-scenario]').forEach(root=>{let current=0,period=0;
  const render=()=>{const data=scenario[current];one('[data-scenario-title]',root).textContent=data[0];one('[data-scenario-functions]',root).textContent=data[1];one('[data-scenario-question]',root).textContent=data[2];one('[data-window-result]',root).textContent=windows[period];all('[data-scenario-choice]',root).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.scenarioChoice)===current)));all('[data-window]',root).forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.window)===period)));all('[data-scenario-node]',root).forEach(n=>n.classList.toggle('is-relevant',data[3].includes(Number(n.dataset.scenarioNode))));};
  all('[data-scenario-choice]',root).forEach(b=>b.addEventListener('click',()=>{current=Number(b.dataset.scenarioChoice);render();}));all('[data-window]',root).forEach(b=>b.addEventListener('click',()=>{period=Number(b.dataset.window);render();}));render();
 });
 let returnFocus=null;
 const dialog=one('.e-document-dialog');
 function showPaper(content){
  if(!dialog)return;
  const body=one('[data-document-content]',dialog);body.replaceChildren(content);
  returnFocus=document.activeElement;
  if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  one('[data-close-document]',dialog).focus();
 }
 all('[data-document]').forEach(b=>b.addEventListener('click',()=>{const work=b.closest('[data-workbench]');if(work){const c=cases.find(x=>x.id===work.dataset.currentCase);if(c){const paper=document.createElement('article');paper.className='e-paper';const title=document.createElement('h2');title.textContent=c.title+' · Musterbefund';paper.append(title);[['Ausgangslage',c.context],['Offene Frage',c.question],['Handlung',c.action],['Funktionsnachweis',c.proof]].forEach(([heading,text])=>{const div=document.createElement('div'),h=document.createElement('h3'),p=document.createElement('p');h.textContent=heading;p.textContent=text;div.append(h,p);paper.append(div);});showPaper(paper);return;}}const template=document.getElementById('document-'+b.dataset.document);if(template)showPaper(template.content.cloneNode(true));}));
 if(dialog){
  const close=()=>{if(typeof dialog.close==='function')dialog.close();else dialog.removeAttribute('open');document.body.classList.remove('e-print-document');if(returnFocus&&returnFocus.focus)returnFocus.focus();};
  one('[data-close-document]',dialog).addEventListener('click',close);
  one('[data-print-document]',dialog).addEventListener('click',()=>{document.body.classList.add('e-print-document');window.print();});
  dialog.addEventListener('cancel',()=>{document.body.classList.remove('e-print-document');if(returnFocus&&returnFocus.focus)returnFocus.focus();});
  dialog.addEventListener('click',e=>{if(e.target===dialog)close();});
 }
 const dataNode=one('#p12-example-data');
 const cases=dataNode?JSON.parse(dataNode.textContent).cases:[];
 all('[data-workbench]').forEach(root=>{
  let current='a';const state={};
  const defaults=()=>({done:false,person:'',date:'',note:'',exerciseDate:'',exerciseNote:'',cardPerson:'Vorher gemeinsam festlegen',cardPlace:'Bekannter, zugänglicher Ort',cardRoute:'Kontaktweg, Zeitpunkt und Ersatzweg vorab vereinbaren.',food:{people:'2',days:'7',daily:'0.5',grams:'500',home:'4',other:'3',site:'Zuhause',shelf:'Musterregal'}});
  const fields={'data-task-person':'person','data-task-date':'date','data-task-note':'note','data-exercise-date':'exerciseDate','data-exercise-note':'exerciseNote','data-card-person':'cardPerson','data-card-place':'cardPlace','data-card-route':'cardRoute'};
  const activate=key=>{all('[data-work-tab]',root).forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.workTab===key));b.setAttribute('aria-controls','work-panel-'+b.dataset.workTab);});all('[data-work-panel]',root).forEach(p=>{p.hidden=p.dataset.workPanel!==key;p.id='work-panel-'+p.dataset.workPanel;});};
  all('[data-work-tab]',root).forEach(b=>b.addEventListener('click',()=>activate(b.dataset.workTab)));
  all('[data-go]',root).forEach(b=>b.addEventListener('click',()=>{activate(b.dataset.go);const heading=one('[data-work-panel="'+b.dataset.go+'"] h3',root);if(heading){heading.tabIndex=-1;heading.focus();}}));
  const preview=()=>{const st=state[current];one('[data-task-status]',root).textContent=st.done?'Bearbeitet':'Offen';one('[data-card-preview="person"]',root).textContent=st.cardPerson||'Noch offen';one('[data-card-preview="place"]',root).textContent=st.cardPlace||'Noch offen';one('[data-card-preview="route"]',root).textContent=st.cardRoute||'Noch offen';};
  const render=()=>{const c=cases.find(x=>x.id===current);if(!c)return;state[current]??=defaults();root.dataset.currentCase=current;all('[data-case-title]',root).forEach(n=>n.textContent=c.title);['context','question','action','proof'].forEach(key=>all('[data-case-'+key+']',root).forEach(n=>n.textContent=c[key]));Object.entries(fields).forEach(([attr,key])=>one('['+attr+']',root).value=state[current][key]);one('[data-task-done]',root).checked=state[current].done;all('[data-food]',root).forEach(input=>input.value=state[current].food[input.dataset.food]);one('[data-calculator]',root).dispatchEvent(new Event('p12-recalculate'));preview();};
  one('[data-case]',root).addEventListener('change',e=>{current=e.target.value;render();});
  Object.entries(fields).forEach(([attr,key])=>one('['+attr+']',root).addEventListener('input',e=>{state[current][key]=e.target.value;preview();}));
  one('[data-task-done]',root).addEventListener('change',e=>{state[current].done=e.target.checked;preview();});
  one('[data-theme]',root).addEventListener('click',e=>{const light=root.classList.toggle('e-work-light');e.currentTarget.setAttribute('aria-pressed',String(light));e.currentTarget.textContent=light?'Dunkle Ansicht':'Helle Ansicht';});
  const cardText=()=>{const c=cases.find(x=>x.id===current),st=state[current];return 'PROTECT-12 · SYNTHETISCHE MUSTERKARTE\n'+c.title+'\n\nKontakt: '+(st.cardPerson||'Noch offen')+'\nDokumentenort: '+(st.cardPlace||'Noch offen')+'\nAblauf: '+(st.cardRoute||'Noch offen')+'\n\nVom Besucher bearbeitetes Funktionsmuster. Keine echte Kundenanalyse.';};
  one('[data-print-card]',root).addEventListener('click',()=>{const paper=document.createElement('article');paper.className='e-paper';const heading=document.createElement('h2');heading.textContent='Ihre synthetische Musterkarte';const pre=document.createElement('pre');pre.textContent=cardText();paper.append(heading,pre);showPaper(paper);});
  one('[data-export-card]',root).addEventListener('click',()=>{const blob=new Blob([cardText()],{type:'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='Protect12_synthetische_Musterkarte.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  all('[data-food]',root).forEach(input=>{const save=()=>{state[current].food[input.dataset.food]=input.value;};input.addEventListener('input',save);input.addEventListener('change',save);});activate('start');render();
 });
 all('[data-calculator]').forEach(root=>{
  const result=one('[data-food-result]',root), inputs=all('input[type="number"]',root);
  const calculate=()=>{const v={};let invalid=false;
   inputs.forEach(input=>{const value=input.value.trim(),n=Number(value),key=input.dataset.food;const good=value!==''&&Number.isFinite(n)&&n>=Number(input.getAttribute('min'))&&n<=Number(input.getAttribute('max'))&&(key==='daily'?Math.abs(n*100-Math.round(n*100))<1e-8:Number.isInteger(n));input.setAttribute('aria-invalid',String(!good));if(!good)invalid=true;v[key]=n;});
   if(invalid){result.textContent='Bitte alle Mengen vollständig und innerhalb der angegebenen Grenzen eintragen. Ein leeres Feld ist ein unbekannter Wert, kein Bestand von null.';result.dataset.valid='false';delete result.dataset.need;delete result.dataset.stock;delete result.dataset.gap;return;}
   const site=one('[data-food="site"]',root).value;
   const rows=[{site:'Zuhause',mode:'pack',amount:v.home,packGrams:v.grams},{site:'Zweiter Ort',mode:'pack',amount:v.other,packGrams:v.grams}];
   const totals=window.P12DemoMath.foodTotals(rows,v.people,0,v.days,site);
   const need=Math.ceil(v.people*v.days*Math.round(v.daily*100)/100),stock=site==='Zuhause'?v.home:v.other,gap=Math.max(0,need-stock);
   const fmt=n=>Number(n.toFixed(3)).toLocaleString('de-DE');
   result.replaceChildren();[['Planungsbedarf',need+' Packungen'],['Nutzbarer Bestand am gewählten Ort',stock+' Packungen · '+fmt(totals.kg)+' kg'],['Rechnerisch zu ergänzen',gap+' Packungen'],['Lagerhinweis',one('[data-food="shelf"]',root).value||'Noch offen']].forEach(([label,value])=>{const div=document.createElement('div'),small=document.createElement('span'),strong=document.createElement('b');small.textContent=label;strong.textContent=value;div.append(small,strong);result.append(div);});result.dataset.valid='true';result.dataset.need=String(need);result.dataset.stock=String(stock);result.dataset.gap=String(gap);
  };root.addEventListener('p12-recalculate',calculate);all('input,select',root).forEach(x=>{x.addEventListener('input',calculate);x.addEventListener('change',calculate);});calculate();
 });
 const questions=[['Standort','Kennen Sie die Bedingungen Ihres Standorts und mögliche Ausweichwege?'],['Selbstschutz','Sind sichere und diskrete Abläufe für Ihren Alltag besprochen?'],['Wasser','Sind persönlicher Bedarf, nutzbarer Bestand und Versorgung geklärt?'],['Nahrung','Gibt es eine nachvollziehbare Planung für Bedarf, Lagerung und Nutzung?'],['Energie','Sind Voraussetzungen und Grenzen wichtiger Versorgungsfunktionen bekannt?'],['Gesundheit','Ist notwendige Unterstützung mit den passenden Personen fachlich abgestimmt?'],['Kommunikation','Sind Kontaktwege und eine passende Alternative vereinbart?'],['Mobilität','Sind notwendige Wege und tatsächliche Transportmöglichkeiten geklärt?'],['Gemeinschaft','Sind gegenseitige Beiträge und Grenzen konkret abgesprochen?'],['Finanzen & Werte','Sind Zahlungsfähigkeit, wichtige Nachweise und der Zugang zu eigenen Ressourcen bedacht?'],['Führung','Sind Zuständigkeiten und geeignete Vertretungen vereinbart?'],['Gesamtsystem','Wurden Zusammenhänge, Abläufe und offene Nachweise gemeinsam betrachtet?']];
 all('[data-selfcheck]').forEach(root=>{const answers={};const questionRoot=one('[data-selfcheck-questions]',root);questions.forEach(([title,q],i)=>{const card=document.createElement('fieldset'),legend=document.createElement('legend');card.className='e-self-question';legend.textContent=(i+1)+'. '+title+' · '+q;card.append(legend);['Noch offen','Teilweise geklärt','Für mich vorbereitet'].forEach((label,j)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.dataset.selfQuestion=String(i);b.dataset.selfAnswer=String(j);b.setAttribute('aria-pressed','false');card.append(b);});questionRoot.append(card);});
  const render=()=>{const n=Object.keys(answers).length;one('[data-selfcheck-progress]',root).textContent=n+' von 12 Bereichen beantwortet';const profile=one('[data-selfcheck-profile]',root);profile.replaceChildren();questions.forEach(([title],i)=>{const d=document.createElement('div');d.className='e-self-cell';d.dataset.status=answers[i]===undefined?'unanswered':String(answers[i]);const strong=document.createElement('b'),span=document.createElement('span');strong.textContent=title;span.textContent=answers[i]===undefined?'Nicht beantwortet':['Noch offen','Teilweise geklärt','Selbst als vorbereitet eingeschätzt'][answers[i]];d.append(strong,span);profile.append(d);});const open=questions.filter((_,i)=>answers[i]===undefined||answers[i]<2).slice(0,3);const prompts=open.length?open.map(([title])=>'Welche Angabe oder Voraussetzung möchten Sie im Bereich '+title+' zuerst klären?'):['Welche Ihrer Einschätzungen ist durch eine praktische Prüfung gestützt?','Wo bestehen gemeinsame Abhängigkeiten zwischen den Bereichen?','Welche Änderung wäre Anlass, Ihren Plan erneut zu betrachten?'];const list=one('[data-selfcheck-prompts]',root);list.replaceChildren();prompts.forEach(t=>{const li=document.createElement('li');li.textContent=t;list.append(li);});};
  questionRoot.addEventListener('click',e=>{const b=e.target.closest('[data-self-question]');if(!b)return;answers[b.dataset.selfQuestion]=Number(b.dataset.selfAnswer);all('[data-self-question="'+b.dataset.selfQuestion+'"]',questionRoot).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
  one('[data-selfcheck-reset]',root).addEventListener('click',()=>{Object.keys(answers).forEach(k=>delete answers[k]);all('[data-self-question]',root).forEach(b=>b.setAttribute('aria-pressed','false'));render();});one('[data-selfcheck-progress]',root).setAttribute('aria-live','polite');render();
 });
})();
