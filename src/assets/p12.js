/* ============================================================
   PROTECT-12 · Website-Relaunch v57 · gemeinsame Interaktion
   Header + Footer (echtes Logo), Mobile-Nav, Reveal, Zaehler,
   Impressum/Datenschutz-Overlays und die Anfrage-/Community-Formulare.
   ============================================================ */
(function(){
  "use strict";
  /* Markiert, dass JS lebt. Ohne diese Klasse zeigt das CSS alle .reveal-Bloecke
     voll an, damit ein Skriptfehler nie wieder Texte unsichtbar macht. */
  document.documentElement.className += " p12js";
  var MAIL = "kontakt@protect-12.de";
  var TEL = "+49 176 23998516";
  var TELHREF = "tel:+4917623998516";

  /* Make-Webhooks. Beim Deploy bestaetigen/ersetzen (Kontakt-Hook aus altem Live-Bundle als Default). */
  var P12_HOOKS = {
    contact:   "https://hook.eu2.make.com/i44tx5i2o9okgqib6fh4cl239an2jdd7",
    community: "https://hook.eu2.make.com/i44tx5i2o9okgqib6fh4cl239an2jdd7"
  };

  var MAILTO_CONTACT = "mailto:"+MAIL+"?subject=Protect-12%20Gespr%C3%A4ch%20vereinbaren&body="+
    encodeURIComponent("Guten Tag,\n\nich interessiere mich fuer eine Protect-12 Krisenvorsorge-Analyse und wuerde gern ein unverbindliches Gespraech vereinbaren.\n\nName:\nWohnort (ungefaehr):\nHaushalt (Personen):\nTelefonisch erreichbar:\n\nViele Gruesse");
  var MAILTO_COMMUNITY = "mailto:"+MAIL+"?subject=Voranmeldung%20Krisenvorsorge-Netzwerk&body="+
    encodeURIComponent("Guten Tag,\n\nich moechte mich fuer das Protect-12 Krisenvorsorge-Netzwerk vormerken lassen.\n\nName:\nRegion/PLZ (optional):\nWarum ich dabei sein moechte:\n\nViele Gruesse");

  /* Echtes Protect-12 Schild (Marke, aus dem Logo vektorisiert). Fuellregel evenodd
     wegen der Spirale. Wird als angeschnittenes Wasserzeichen an den Rand gesetzt. */
  var SHIELD_D = "M4.89 36.97 1.71 39.02 3.75 49.26 6.03 57.22 8.87 64.85 12.51 72.92 15.47 78.38 22.87 89.76 31.17 99.77 40.05 108.42 49.83 116.04 55.18 112.29 63.03 105.57 71.22 97.04 77.47 89.19 83.39 80.2 88.62 70.42 92.72 60.52 95.34 52.33 93.86 50.85 85.55 45.96 75.65 41.75 64.16 38.79 52.1 37.54 54.84 45.85 63.59 46.99 71.1 48.92 80.09 52.45 84.87 54.95 85.67 55.86 82.94 63.03 79.41 70.53 72.24 82.37 63.48 93.4 56.66 100.23 49.94 105.92 42.89 99.89 36.86 93.86 31.63 87.71 26.96 81.34 21.16 71.79 15.81 60.18 11.95 48.24 10.01 39.36 9.44 34.81ZM0.8 25.03 0.46 27.42 1.14 34.36 7.39 30.83 12.97 28.44 14.22 38.79 16.61 49.26 19.45 57.91 24.69 69.4 29.92 78.16 36.52 87.03 42.21 93.4 49.94 100.46 58.36 92.72 67.46 81.8 74.63 70.53 80.55 57.45 74.18 54.49 66.89 52.1 60.41 50.74 52.1 50.06 49.03 42.32 46.87 33.45 53.81 33.33 60.41 33.9 72.24 36.29 85.21 41.07 96.47 47.67 98.07 40.16 98.07 38.79 87.94 33.33 79.07 29.81 70.19 27.3 63.59 26.05 54.15 25.14 45.73 25.14 37.77 25.94 38.68 34.47 40.39 41.98 42.78 49.26 46.87 58.13 58.48 58.7 69.85 61.66 66.55 68.15 61.21 76.45 54.95 84.3 49.94 89.42 43.8 82.94 37.88 75.31 32.99 67.46 28.1 57.45 24.57 47.33 22.18 36.86 21.05 26.96 21.05 16.84 10.69 20.36ZM90.33 20.82 82.14 17.75 73.15 15.24 62.91 13.42 54.04 12.74 42.89 12.86 33.11 13.99 25.26 15.7 25.26 26.39 25.82 32.54 27.65 42.32 30.49 51.88 34.02 60.3 39.25 69.74 44.48 77.13 49.94 83.39 53.01 80.09 57.68 74.18 61.32 68.71 63.82 64.16 58.59 63.03 55.29 62.68 49.94 70.65 45.05 63.48 41.98 57.91 39.7 53.01 37.43 46.87 35.72 40.96 34.47 35.04 33.56 27.53 33.33 22.41 36.41 21.73 46.19 20.93 55.86 21.05 67.01 22.3 75.77 24.35 82.82 26.62 91.35 30.26 98.75 34.36 99.54 25.37ZM0.68 11.26 0.34 20.59 6.03 17.75 12.4 15.13 17.63 13.31 23.32 11.72 29.92 10.24 36.41 9.22 42.21 8.65 48.01 8.42 59.04 8.76 67.35 9.78 73.38 10.92 81.11 12.97 87.83 15.24 94.88 18.2 99.54 20.59 99.54 16.04 99.2 11.15 90.33 7.39 81.23 4.44 71.22 2.16 62.68 0.91 55.4 0.34 44.48 0.34 37.2 0.91 29.35 2.05 23.32 3.3 21.5 3.87 20.82 3.87 14.56 5.69 6.14 8.76Z";

  var NAV = [
    {href:"das-system.html", label:"Das System"},
    {href:"ablauf-experten.html", label:"Ablauf & Experten"},
    {href:"lagebild.html", label:"Lagebild"},
    {href:"ratgeber.html", label:"Ratgeber"},
    {href:"downloads.html", label:"Downloads"},
    {href:"community.html", label:"Community"},
    {href:"faq-kontakt.html", label:"FAQ & Kontakt"}
  ];
  function navLinks(active){
    return NAV.map(function(n){
      var a = (active===n.href)?' class="active"':'';
      return '<a href="'+n.href+'"'+a+'>'+n.label+'</a>';
    }).join("");
  }

  function buildHeader(active){
    return '<header class="site-header"><div class="wrap">'+
      '<a class="brand" href="index.html"><img class="brandlogo" src="assets/logo-weiss.png" alt="Protect-12"></a>'+
      '<nav class="nav-main">'+navLinks(active)+'<a class="nav-cta" href="#" data-cta>Gespr&auml;ch vereinbaren</a></nav>'+
      '<button class="burger" aria-label="Men&uuml;" id="p12burger"><span></span><span></span><span></span></button>'+
      '</div></header>'+
      '<div class="mnav" id="p12mnav">'+
      '<a href="index.html">Start</a>'+navLinks(active)+
      '<a href="#" data-cta style="color:var(--red-soft)">Gespr&auml;ch vereinbaren</a></div>';
  }

  function buildFooter(){
    return '<footer class="site-footer"><div class="wrap">'+
      '<div class="cols">'+
        '<div><img class="brandlogo" src="assets/logo-weiss.png" alt="Protect-12" style="height:34px">'+
          '<p class="brand-blurb">Krisenvorsorge mit System. Eine strukturierte Analyse Ihres Haushalts, ein laufendes Lagebild und ein gepr&uuml;ftes Netzwerk.</p></div>'+
        '<div><h4>Das System</h4>'+
          '<a href="das-system.html">Zw&ouml;lf Bereiche</a><a href="das-system.html#szenarien">Acht Szenarien</a>'+
          '<a href="das-system.html#unterlagen">F&uuml;nfzehn Unterlagen</a><a href="lagebild.html">Lagebild</a></div>'+
        '<div><h4>Mehr</h4>'+
          '<a href="ablauf-experten.html">Ihr Weg</a><a href="ablauf-experten.html#experten">Expertennetzwerk</a>'+
          '<a href="community.html">Community</a><a href="ratgeber.html">Ratgeber</a>'+
          '<a href="downloads.html">Checklisten zum Download</a>'+
          '<a href="faq-kontakt.html">Fragen &amp; Antworten</a></div>'+
        '<div><h4>Kontakt</h4>'+
          '<a href="mailto:'+MAIL+'">'+MAIL+'</a>'+
          '<a href="#" data-cta>Gespr&auml;ch vereinbaren</a>'+
          '<a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></div>'+
      '</div>'+
      '<div class="legal"><span>&copy; Protect-12 &middot; Krisenvorsorge mit System</span>'+
        '<span>protect-12.de</span></div>'+
      '</div></footer>';
  }

  /* ------------------------------------------------------------------
     Das wandernde Schild. Ein einziges Wasserzeichen, fest am rechten
     Rand, angeschnitten. Beim Scrollen wandert es langsam mit nach
     unten und laeuft dabei ueber Navy- und ueber weisse Flaechen.
     Die Farbe macht mix-blend-mode:difference von selbst: auf dunklem
     Grund wird das Schild hell, auf hellem Grund dunkel. Pixelgenau,
     auch mitten auf einer Sektionskante.
     ------------------------------------------------------------------ */
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;

  function mountSchild(){
    if(document.querySelector(".p12-schild")) return;
    var el = document.createElement("div");
    el.className = "p12-schild"; el.setAttribute("aria-hidden","true");
    el.innerHTML = '<svg viewBox="0 0 100 116.5"><path d="'+SHIELD_D+'" fill="#ffffff" fill-rule="evenodd"/></svg>';
    document.body.appendChild(el);

    function bahn(){ return Math.max(0, innerHeight - el.offsetHeight) ; }
    function fortschritt(){
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      return Math.min(1, Math.max(0, (window.pageYOffset||0) / max));
    }
    function setzen(p){
      /* von knapp unter dem Kopf bis knapp ueber den Fuss */
      var y = 40 + p * Math.max(0, innerHeight - el.offsetHeight - 40);
      el.style.transform = "translateY("+y.toFixed(1)+"px)";
    }
    if(RM){ setzen(.5); return; }

    var ziel = fortschritt(), ist = ziel;
    setzen(ist);
    addEventListener("scroll", function(){ ziel = fortschritt(); }, {passive:true});
    addEventListener("resize", function(){ ziel = fortschritt(); });
    function frame(){
      requestAnimationFrame(frame);
      if(document.hidden) return;
      var d = ziel - ist;
      if(Math.abs(d) < 0.0004){ ist = ziel; return; }
      ist += d * 0.07;                    /* laeuft dem Scrollen weich hinterher */
      setzen(ist);
    }
    requestAnimationFrame(frame);
  }

  function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }
  function bindAll(sel, fn){ each(sel, function(el){ el.addEventListener("click", fn); }); }
  function bindWithin(root, sel, fn){ Array.prototype.forEach.call(root.querySelectorAll(sel), function(el){ el.addEventListener("click", fn); }); }

  function mount(){
    var active = document.body.getAttribute("data-page") || "";
    var h = document.getElementById("p12-header");
    if(h) h.outerHTML = buildHeader(active);
    var f = document.getElementById("p12-footer");
    if(f) f.outerHTML = buildFooter();

    mountSchild();

    var b = document.getElementById("p12burger"), m = document.getElementById("p12mnav");
    if(b && m){ b.addEventListener("click", function(){ m.classList.toggle("open"); }); }

    bindAll("[data-cta]", function(ev){ ev.preventDefault(); openForm("contact"); });
    bindAll("[data-community]", function(ev){ ev.preventDefault(); openForm("community"); });
    bindAll("[data-legal]", function(ev){ ev.preventDefault(); openLegal(ev.currentTarget.getAttribute("data-legal")); });

    /* threshold 0 statt .12: Bloecke, die hoeher sind als der Bildschirm (ganze
       Ratgeber-Artikel auf dem Handy), erreichen nie 12 Prozent Sichtbarkeit und
       blieben sonst dauerhaft auf opacity 0, also unsichtbar. */
    if("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, {threshold:0, rootMargin:"0px 0px -8% 0px"});
      each(".reveal", function(el){ io.observe(el); });
    } else {
      each(".reveal", function(el){ el.classList.add("in"); });
    }
    var cio = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ runCount(e.target); cio.unobserve(e.target); } }); }, {threshold:.5});
    each("[data-count]", function(el){ cio.observe(el); });
  }

  function runCount(el){
    var target = parseFloat(el.getAttribute("data-count")), dur=1300, t0=null;
    function step(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/dur,1); el.textContent=Math.floor(p*target).toLocaleString("de-DE");
      if(p<1) requestAnimationFrame(step); else el.textContent=target.toLocaleString("de-DE"); }
    requestAnimationFrame(step);
  }

  function overlay(innerHTML){
    var ov = document.createElement("div"); ov.className="p12ov";
    ov.style.cssText="position:fixed;inset:0;z-index:200;background:rgba(15,20,28,.62);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:34px 16px";
    ov.innerHTML = innerHTML;
    document.body.appendChild(ov); document.body.style.overflow="hidden";
    function close(){ ov.remove(); document.body.style.overflow=""; }
    ov.addEventListener("click", function(e){ if(e.target===ov) close(); });
    var x = ov.querySelector("[data-x]"); if(x) x.addEventListener("click", close);
    return {ov:ov, close:close};
  }

  function field(f){
    var id="p12f_"+f.name;
    var lab='<label for="'+id+'">'+f.label+(f.req?' <span style="color:var(--red)">*</span>':'')+'</label>';
    if(f.type==="textarea") return '<div class="ff full">'+lab+'<textarea id="'+id+'" name="'+f.name+'" rows="3"'+(f.req?' required':'')+'></textarea></div>';
    return '<div class="ff'+(f.full?' full':'')+'">'+lab+'<input id="'+id+'" name="'+f.name+'" type="'+(f.type||"text")+'"'+(f.req?' required':'')+'></div>';
  }

  function openForm(type){
    var cfg = type==="community" ? {
      title:"Voranmeldung Krisenvorsorge-Netzwerk",
      sub:"Lassen Sie sich unverbindlich vormerken. Sie erfahren als Erstes, wenn es losgeht.",
      submit:"Vormerken lassen", hook:P12_HOOKS.community, mailto:MAILTO_COMMUNITY, formular:"Community-Voranmeldung",
      fields:[{name:"name",label:"Name",req:true},{name:"email",label:"E-Mail",type:"email",req:true},
              {name:"region",label:"Region / PLZ (optional)"},{name:"reason",label:"Warum moechten Sie dabei sein? (optional)",type:"textarea",full:true}]
    } : {
      title:"Gespraech vereinbaren",
      sub:"Schildern Sie uns kurz Ihre Situation. Wir melden uns fuer ein unverbindliches Gespraech.",
      submit:"Anfrage senden", hook:P12_HOOKS.contact, mailto:MAILTO_CONTACT, formular:"Kontakt",
      fields:[{name:"name",label:"Name",req:true},{name:"email",label:"E-Mail",type:"email",req:true},
              {name:"phone",label:"Telefon (optional)",type:"tel"},{name:"ort",label:"Wohnort, ungefaehr (optional)"},
              {name:"haushalt",label:"Haushalt, Personen (optional)"},{name:"message",label:"Ihre Nachricht (optional)",type:"textarea",full:true}]
    };
    var html = '<div class="p12modal"><div class="p12modal-head"><span>PROTECT-12</span>'+
      '<button data-x aria-label="Schlie&szlig;en">&#10005;</button></div>'+
      '<div class="p12modal-body"><div class="p12form-intro"><h3>'+cfg.title+'</h3><p>'+cfg.sub+'</p></div>'+
      '<form class="p12form" novalidate><div class="ff-grid">'+cfg.fields.map(field).join("")+'</div>'+
      '<label class="consent"><input type="checkbox" required id="p12f_consent"> Ich habe die '+
        '<a href="datenschutz.html" target="_blank" rel="noopener">Datenschutzerkl&auml;rung</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage einverstanden. <span style="color:var(--red)">*</span></label>'+
      '<div class="p12form-err" style="display:none"></div>'+
      '<button type="submit" class="btn btn-red" style="width:100%;justify-content:center;margin-top:6px">'+cfg.submit+'</button>'+
      '<p class="p12form-alt">Lieber direkt? <a href="'+cfg.mailto+'">Schreiben Sie uns eine E-Mail</a> oder rufen Sie an: <a href="'+TELHREF+'">'+TEL+'</a></p>'+
      '</form></div></div>';
    var o = overlay(html);
    bindWithin(o.ov, "[data-legal]", function(ev){ ev.preventDefault(); openLegal(ev.currentTarget.getAttribute("data-legal")); });
    var form = o.ov.querySelector("form");
    var errBox = o.ov.querySelector(".p12form-err");
    form.addEventListener("submit", function(ev){
      ev.preventDefault();
      errBox.style.display="none";
      var raw={};
      var ok=true;
      cfg.fields.forEach(function(f){ var el=form.querySelector('[name="'+f.name+'"]'); raw[f.name]=el?el.value.trim():"";
        if(f.req && !raw[f.name]) ok=false; });
      if(!form.querySelector("#p12f_consent").checked) ok=false;
      if(!ok){ errBox.innerHTML="Bitte f&uuml;llen Sie die Pflichtfelder aus und best&auml;tigen Sie die Datenschutzerkl&auml;rung."; errBox.style.display="block"; return; }
      var btn=form.querySelector("button[type=submit]"); btn.disabled=true; btn.textContent="Wird gesendet ...";
      var nachricht = (type==="community") ? ("VORANMELDUNG Krisenvorsorge-Netzwerk.\n"+(raw.region?("Region/PLZ: "+raw.region+"\n"):"")+(raw.reason?("Begruendung: "+raw.reason):"")) : ((raw.message||"")+(raw.ort?("\nWohnort: "+raw.ort):"")+(raw.haushalt?("\nHaushalt: "+raw.haushalt):""));
      var data={ formular:cfg.formular, name:(raw.name||""), email:(raw.email||""), telefon:(raw.phone||""), seite:location.href, nachricht:nachricht, datenschutz:"ja", zeit:new Date().toISOString() };
      fetch(cfg.hook, {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(data)})
        .then(function(r){ if(!r.ok) throw new Error(r.status); return r; })
        .then(function(){ success(o); })
        .catch(function(){
          errBox.innerHTML='Das Formular ist gerade nicht erreichbar. Bitte nutzen Sie kurz die <a href="'+cfg.mailto+'">E-Mail</a> oder rufen Sie an: <a href="'+TELHREF+'">'+TEL+'</a>. Wir k&uuml;mmern uns direkt.';
          errBox.style.display="block"; btn.disabled=false; btn.textContent=cfg.submit;
        });
    });
  }
  function success(o){
    o.ov.querySelector(".p12modal-body").innerHTML =
      '<div class="p12form-done"><div class="tick">&#10003;</div><h3>Danke, wir haben Ihre Anfrage.</h3>'+
      '<p>Wir melden uns pers&ouml;nlich bei Ihnen. Wenn es eilt, erreichen Sie uns direkt unter '+
      '<a href="'+TELHREF+'">'+TEL+'</a>.</p>'+
      '<button class="btn btn-navy" data-x style="margin-top:10px">Schlie&szlig;en</button></div>';
    /* ALLE data-x-Knoepfe binden: querySelector traf nur das X im Kopf,
       der neue Schliessen-Button im Erfolgstext blieb ohne Listener. */
    Array.prototype.forEach.call(o.ov.querySelectorAll("[data-x]"), function(x){ x.addEventListener("click", o.close); });
  }

  function openLegal(which){
    var t = (which==="impressum")? LEGAL.impressum : LEGAL.datenschutz;
    overlay('<div class="p12modal"><div class="p12modal-head"><span>PROTECT-12</span><button data-x aria-label="Schlie&szlig;en">&#10005;</button></div><div class="p12modal-body legal-body">'+t+'</div></div>');
  }

  var LEGAL = {
    impressum: '<h2 style="font-size:24px;margin-bottom:14px">Impressum</h2>'+
      '<p><b>Angaben gem&auml;&szlig; &sect; 5 Digitale-Dienste-Gesetz (DDG)</b><br>B&auml;umer Solutions<br>Inhaber: Kevin B&auml;umer<br>Donzenbachstra&szlig;e 5<br>57572 Niederfischbach<br>Deutschland</p>'+
      '<p style="margin-top:14px">Protect-12 ist ein Angebot von B&auml;umer Solutions.</p>'+
      '<p style="margin-top:14px"><b>Kontakt</b><br>Telefon: +49 176 23998516<br>E-Mail: kontakt@protect-12.de</p>'+
      '<p style="margin-top:14px"><b>Umsatzsteuer-ID</b><br>USt-IdNr. gem&auml;&szlig; &sect; 27a UStG: DE462173157</p>'+
      '<p style="margin-top:14px"><b>Redaktionell verantwortlich (&sect; 18 Abs. 2 MStV)</b><br>Kevin B&auml;umer, Anschrift wie oben.</p>'+
      '<p style="margin-top:14px"><b>EU-Streitschlichtung</b><br>Plattform der EU-Kommission: ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>'+
      '<p style="margin-top:14px">Standardklauseln zur Haftung f&uuml;r Inhalte (&sect; 7 Abs. 1 DDG; &sect;&sect; 8 bis 10 DDG), Haftung f&uuml;r Links und Urheberrecht gelten unver&auml;ndert.</p>'+
      '<p style="margin-top:14px;color:var(--muted)">Stand: Juli 2026</p>',
    datenschutz: '<h2 style="font-size:24px;margin-bottom:14px">Datenschutzerkl&auml;rung</h2>'+
      '<p><b>1. Verantwortlicher</b><br>B&auml;umer Solutions, Inhaber Kevin B&auml;umer, Donzenbachstra&szlig;e 5, 57572 Niederfischbach. Telefon +49 176 23998516, kontakt@protect-12.de.</p>'+
      '<p style="margin-top:12px"><b>2. Hosting</b><br>Die Seite wird bei einem Dienstleister gehostet, auf Grundlage eines Auftragsverarbeitungsvertrags und, soweit einschl&auml;gig, der EU-Standardvertragsklauseln.</p>'+
      '<p style="margin-top:12px"><b>3. Server-Logfiles</b><br>Beim Aufruf werden technisch notwendige Daten verarbeitet (Browsertyp, Betriebssystem, Referrer-URL, Uhrzeit, IP-Adresse).</p>'+
      '<p style="margin-top:12px"><b>4. Cookies und lokale Speicherung</b><br>Keine Tracking-Cookies ohne Einwilligung. Technisch notwendig gespeichert wird nur die Cookie-Auswahl (&sect; 25 Abs. 2 TDDDG). Optionale Statistik nur nach Einwilligung.</p>'+
      '<p style="margin-top:12px"><b>5. Live-Lagebild</b><br>Die Lagebild-Seite ruft &ouml;ffentlich zug&auml;ngliche Fachdaten direkt in Ihrem Browser ab (u.a. BBK/NINA, USGS, GDACS, NOAA). Dabei erhalten die Anbieter technisch Ihre IP-Adresse. Es werden keine personenbezogenen Daten an uns &uuml;bermittelt.</p>'+
      '<p style="margin-top:12px"><b>6. Anfrage- und Voranmelde-Formular</b><br>Ihre Angaben werden zur Bearbeitung Ihrer Anfrage verarbeitet, technisch &uuml;ber unseren Auftragsverarbeiter Make (EU-Rechenzentrum) an unser Postfach. Eine Verwendung f&uuml;r Werbezwecke findet nicht statt.</p>'+
      '<p style="margin-top:12px"><b>7. Fragebogen und Onlineportal</b><br>Auftragsverarbeiter Airtable (USA) als Datenbank sowie Make. Bei besonderen Kategorien Art. 9 Abs. 2 lit. a DSGVO.</p>'+
      '<p style="margin-top:12px"><b>8. Eingebundene Inhalte</b><br>Google Fonts (Google Ireland Limited); Skript-Bibliotheken &uuml;ber cdnjs (Cloudflare, Inc.).</p>'+
      '<p style="margin-top:12px"><b>9. Ihre Rechte</b><br>Auskunft, Berichtigung, L&ouml;schung, Einschr&auml;nkung, Daten&uuml;bertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Widerruf an kontakt@protect-12.de.</p>'+
      '<p style="margin-top:12px"><b>10. Beschwerderecht</b><br>Zust&auml;ndig u.a. der Landesbeauftragte f&uuml;r Datenschutz Rheinland-Pfalz, Hintere Bleiche 34, 55116 Mainz.</p>'+
      '<p style="margin-top:14px;color:var(--muted)">Stand: Juli 2026</p>'
  };

  if(document.readyState!=="loading") mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
