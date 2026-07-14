/* ============================================================
   PROTECT-12 · Lagebild-Engine · Live-Abruf im Browser
   Quellen (alle oeffentlich, CORS-faehig):
   - BBK / NINA  warnung.bund.de/api31/mowas/mapData.json
   - GDACS       gdacs.org/gdacsapi
   - USGS        earthquake.usgs.gov feed
   - NOAA SWPC   services.swpc.noaa.gov (Kp-Index)
   - Metaculus   metaculus.com/api2 (best effort, Fallback: Link)
   Jede Quelle wird unabhaengig geladen und degradiert einzeln.
   ============================================================ */
(function(){
  "use strict";
  var STATE = {nina:null, gdacs:null, eq:null, kp:null};

  function esc(s){ return (s||"").replace(/[<>&]/g,function(c){return {"<":"&lt;",">":"&gt;","&":"&amp;"}[c];}); }
  function fmtDate(d){ try{ return new Date(d).toLocaleString("de-DE",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } }
  function ago(ms){ var m=Math.floor((Date.now()-ms)/60000); if(m<60) return "vor "+m+" Min"; var h=Math.floor(m/60); if(h<24) return "vor "+h+" Std"; return "vor "+Math.floor(h/24)+" Tg"; }
  function get(url){ return fetch(url,{mode:"cors",cache:"no-store"}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }); }

  /* ---------- Gauge (Halbkreis 0..100) ---------- */
  function drawGauge(svg, pct, color){
    var cx=110, cy=112, r=88, a0=Math.PI, a1=0;
    function pt(a){ return [cx+r*Math.cos(a), cy+r*Math.sin(a)]; }
    function arc(from,to,col,w){ var p0=pt(from),p1=pt(to),large=(Math.abs(to-from)>Math.PI)?1:0;
      return '<path d="M'+p0[0].toFixed(1)+' '+p0[1].toFixed(1)+' A'+r+' '+r+' 0 '+large+' 1 '+p1[0].toFixed(1)+' '+p1[1].toFixed(1)+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"/>'; }
    var ang = a0 + (pct/100)*(a1-a0);
    var np = pt(ang);
    svg.innerHTML = arc(a0,a1,"#DDE1E6",16) + arc(a0,ang,color,16) +
      '<line x1="'+cx+'" y1="'+cy+'" x2="'+np[0].toFixed(1)+'" y2="'+np[1].toFixed(1)+'" stroke="#1B2430" stroke-width="4"/>'+
      '<circle cx="'+cx+'" cy="'+cy+'" r="7" fill="#1B2430"/>'+
      '<text x="'+cx+'" y="'+(cy-24)+'" text-anchor="middle" font-family="Montserrat" font-weight="800" font-size="30" fill="#1B2430">'+Math.round(pct)+'</text>';
  }

  /* ---------- BBK / NINA ---------- */
  function loadNina(){
    var box=document.getElementById("nina");
    get("https://warnung.bund.de/api31/mowas/mapData.json").then(function(list){
      var active = list.filter(function(w){ return w.type!=="Cancel"; });
      var severe = active.filter(function(w){ return w.severity==="Severe"||w.severity==="Extreme"; }).length;
      STATE.nina = {count:active.length, severe:severe};
      document.getElementById("kpi-nina").textContent = active.length;
      var sorted = active.slice().sort(function(a,b){ return new Date(b.startDate)-new Date(a.startDate); }).slice(0,6);
      box.innerHTML = sorted.map(function(w){
        var sv=w.severity, chip = sv==="Extreme"||sv==="Severe" ? "r" : (sv==="Moderate"?"o":"");
        var lbl = {Extreme:"Extrem",Severe:"Schwer",Moderate:"Mittel",Minor:"Gering"}[sv]||sv;
        var title=(w.i18nTitle&&w.i18nTitle.de)||"Warnung";
        return '<div class="lb-item"><div class="mag '+chip+'" style="font-size:10px;line-height:1.15;padding:0 4px;text-align:center">'+lbl+'</div>'+
          '<div class="txt"><div class="h">'+esc(title)+'</div><div class="m">'+fmtDate(w.startDate)+'</div></div></div>';
      }).join("") || '<div class="loading">Aktuell keine aktiven Warnungen gemeldet.</div>';
      refreshIndex();
    }).catch(function(){ box.innerHTML=srcFail("BBK / NINA","https://warnung.bund.de"); document.getElementById("kpi-nina").textContent="k. A."; });
  }

  /* ---------- GDACS ---------- */
  function loadGdacs(){
    var box=document.getElementById("gdacs");
    get("https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?alertlevel=Orange;Red&eventlist=EQ;TC;FL;VO;DR;WF").then(function(j){
      var feats=(j.features||[]);
      var now=Date.now(), rec = feats.filter(function(f){ return (now-new Date(f.properties.fromdate).getTime()) < 45*864e5; });
      STATE.gdacs={count:rec.length, red:feats.filter(function(f){return f.properties.alertlevel==="Red";}).length};
      document.getElementById("kpi-gdacs").textContent = rec.length;
      var sorted=feats.slice().sort(function(a,b){ return new Date(b.properties.fromdate)-new Date(a.properties.fromdate); }).slice(0,6);
      var TYP={EQ:"Erdbeben",TC:"Wirbelsturm",FL:"Hochwasser",VO:"Vulkan",DR:"D&uuml;rre",WF:"Waldbrand"};
      box.innerHTML = sorted.map(function(f){ var p=f.properties, col=p.alertlevel==="Red"?"r":"o";
        var sev=p.severitydata&&p.severitydata.severity?p.severitydata.severity:"";
        return '<div class="lb-item"><div class="mag '+col+'" style="font-size:10px">'+(TYP[p.eventtype]||p.eventtype)+'</div>'+
          '<div class="txt"><div class="h">'+esc(p.country||p.name)+(sev?' &middot; '+sev+' '+(p.severitydata.severityunit||''):'')+'</div>'+
          '<div class="m">'+fmtDate(p.fromdate)+' &middot; Stufe '+p.alertlevel+'</div></div></div>';
      }).join("") || '<div class="loading">Keine aktuellen Ereignisse.</div>';
      refreshIndex();
    }).catch(function(){ box.innerHTML=srcFail("GDACS","https://www.gdacs.org"); document.getElementById("kpi-gdacs").textContent="k. A."; });
  }

  /* ---------- USGS ---------- */
  function loadUsgs(){
    var box=document.getElementById("usgs");
    get("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson").then(function(j){
      var feats=(j.features||[]); var maxMag=feats.reduce(function(m,f){return Math.max(m,f.properties.mag||0);},0);
      STATE.eq={count:feats.length, max:maxMag};
      document.getElementById("kpi-eq").textContent = feats.length;
      var sorted=feats.slice().sort(function(a,b){return b.properties.mag-a.properties.mag;}).slice(0,6);
      box.innerHTML = sorted.map(function(f){ var p=f.properties, cls=p.mag>=6?"r":(p.mag>=5?"o":"");
        var place=p.place||""; place=place.replace(/^\d+\s*km\s+\w+\s+of\s+/,"");
        return '<div class="lb-item"><div class="mag '+cls+'">'+p.mag.toFixed(1)+'<small>Mag</small></div>'+
          '<div class="txt"><div class="h">'+esc(place)+'</div><div class="m">'+ago(p.time)+'</div></div></div>';
      }).join("") || '<div class="loading">Keine Beben ab M4,5 in den letzten 24 Stunden.</div>';
      refreshIndex();
    }).catch(function(){ box.innerHTML=srcFail("USGS","https://earthquake.usgs.gov"); document.getElementById("kpi-eq").textContent="k. A."; });
  }

  /* ---------- NOAA Kp ---------- */
  function loadNoaa(){
    get("https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json").then(function(rows){
      var last=rows[rows.length-1]; var kp=parseFloat(last.Kp||last[1]);
      STATE.kp={kp:kp};
      document.getElementById("kpi-kp").textContent = kp.toFixed(1).replace(".",",");
      var col = kp>=7?"#C31212":(kp>=5?"#B0770A":"#0D5C33");
      drawGauge(document.getElementById("kpgauge"), (kp/9)*100, col);
      var lbl = kp>=7?"Starker Sturm":(kp>=5?"Aktiv":"Ruhig");
      document.getElementById("kp-label").textContent = "Kp "+kp.toFixed(1).replace(".",",")+" &middot; "+lbl;
      document.getElementById("kp-label").innerHTML = "Kp "+kp.toFixed(1).replace(".",",")+" &middot; "+lbl;
      var t = kp>=5 ? "Erh&ouml;hte geomagnetische Aktivit&auml;t. Bei l&auml;nger hohen Werten sind St&ouml;rungen an Stromnetzen, GPS und Funk m&ouml;glich." :
        "Das geomagnetische Feld ist ruhig. Keine sturmbedingten St&ouml;rungen an Strom, GPS oder Funk zu erwarten.";
      document.getElementById("kp-text").innerHTML = t;
      refreshIndex();
    }).catch(function(){ document.getElementById("kpi-kp").textContent="k. A."; document.getElementById("kp-label").textContent="nicht erreichbar"; });
  }

  /* ---------- Metaculus (best effort) ---------- */
  var MQ = [
    {term:"global recession 2026", fb:"Globale Rezession im Jahr 2026"},
    {term:"nuclear weapon detonation", fb:"Einsatz einer Atomwaffe (laufende Frage)"},
    {term:"influenza pandemic", fb:"Neue Pandemie-Erkl&auml;rung der WHO"},
    {term:"cyberattack critical infrastructure", fb:"Schwerer Cyberangriff auf kritische Infrastruktur"},
    {term:"Russia NATO", fb:"Direkter Konflikt zwischen Russland und der NATO"},
    {term:"Taiwan China blockade", fb:"Milit&auml;rische Eskalation um Taiwan"}
  ];
  function loadMetaculus(){
    var box=document.getElementById("metaculus");
    box.innerHTML="";
    var done=0, any=false;
    MQ.forEach(function(q,i){
      var card=document.createElement("div"); card.className="fc";
      card.innerHTML='<div class="qq">'+q.fb+'</div><div class="barrow"><div class="track"><div class="fill" style="width:0%"></div></div><div class="pct">&hellip;</div></div><a href="https://www.metaculus.com/questions/?search='+encodeURIComponent(q.term)+'" target="_blank" rel="noopener">Auf Metaculus ansehen &rarr;</a>';
      box.appendChild(card);
      get("https://www.metaculus.com/api2/questions/?search="+encodeURIComponent(q.term)+"&limit=1&status=open&forecast_type=binary")
        .then(function(j){ var r=(j.results||[])[0]; if(!r) throw new Error("none");
          var p=null;
          try{ p = r.community_prediction.full.q2; }catch(e){}
          if(p==null){ try{ p=r.question.aggregations.recency_weighted.latest.centers[0]; }catch(e){} }
          if(p==null) throw new Error("noP");
          any=true; var pct=Math.round(p*100);
          card.querySelector(".qq").textContent = (r.title||q.fb);
          card.querySelector(".fill").style.width=pct+"%";
          card.querySelector(".pct").textContent=pct+"%";
          card.querySelector("a").href = "https://www.metaculus.com"+(r.page_url||("/questions/?search="+encodeURIComponent(q.term)));
        }).catch(function(){ card.querySelector(".pct").textContent="k. A."; card.querySelector(".pct").innerHTML="k. A."; })
        .then(function(){ done++; if(done===MQ.length && !any){
          var note=document.createElement("p"); note.className="disc"; note.style.gridColumn="1 / -1";
          note.innerHTML="Die Live-Werte von Metaculus konnten in Ihrem Browser gerade nicht geladen werden. Die Fragen sind &uuml;ber die Links oben weiterhin erreichbar.";
          box.appendChild(note); } });
    });
  }

  /* ---------- Composite Aufmerksamkeitsindex ---------- */
  function refreshIndex(){
    if(!STATE.nina && !STATE.gdacs && !STATE.eq && !STATE.kp) return;
    var s=0;
    if(STATE.nina) s += Math.min(STATE.nina.severe*14 + STATE.nina.count*1.5, 34);
    if(STATE.gdacs) s += Math.min(STATE.gdacs.count*4 + STATE.gdacs.red*10, 30);
    if(STATE.eq) s += Math.min(Math.max(0,(STATE.eq.max-4.5))*10, 22);
    if(STATE.kp) s += Math.min(Math.max(0,(STATE.kp.kp-3))*4, 14);
    s=Math.max(4,Math.min(100,Math.round(s)));
    var col, lab, txt;
    if(s<34){ col="#0D5C33"; lab="Ruhig"; txt="Die Lage ist insgesamt ruhig. Kein akuter Anlass zur Sorge, aber der beste Zeitpunkt, Vorsorge in Ordnung zu bringen, ist immer der ruhige."; }
    else if(s<66){ col="#B0770A"; lab="Erh&ouml;ht"; txt="Es gibt mehrere beachtenswerte Meldungen. Kein Grund zur Panik, aber ein guter Anlass, den eigenen Stand zu pr&uuml;fen: Wasser, Energie, Kommunikation, Vorrat."; }
    else { col="#C31212"; lab="Angespannt"; txt="Mehrere Quellen zeigen erh&ouml;hte Aktivit&auml;t. Wer jetzt wei&szlig;, wo er steht, handelt fr&uuml;her und ruhiger. Genau daf&uuml;r ist ein gepr&uuml;fter Plan da."; }
    drawGauge(document.getElementById("gauge"), s, col);
    var gl=document.getElementById("gauge-label"); gl.innerHTML=lab; gl.style.color=col;
    document.getElementById("gauge-text").innerHTML = txt;
  }

  function srcFail(name,url){ return '<div class="loading">'+name+' ist gerade nicht erreichbar. <a href="'+url+'" target="_blank" rel="noopener">Direkt &ouml;ffnen &rarr;</a></div>'; }

  function loadAll(){
    document.getElementById("lb-stand").textContent = new Date().toLocaleString("de-DE",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})+" Uhr";
    loadNina(); loadGdacs(); loadUsgs(); loadNoaa(); loadMetaculus();
  }

  function init(){
    loadAll();
    var b=document.getElementById("lb-refresh"); if(b) b.addEventListener("click",loadAll);
    setInterval(loadAll, 10*60*1000); // alle 10 Minuten
  }
  if(document.readyState!=="loading") init(); else document.addEventListener("DOMContentLoaded", init);
})();
