/* ============================================================
   PROTECT-12 · Website-Relaunch v57 · gemeinsame Interaktion
   Header + Footer (echtes Logo), Mobile-Nav, Reveal, Zaehler,
   Impressum/Datenschutz-Overlays und die Anfrage-/Community-Formulare.
   ============================================================ */
(function(){
  "use strict";
  var MAIL = "Kontakt@protect-12.de";
  var TEL = "+49 176 23998516";
  var TELHREF = "tel:+4917623998516";

  /* Make-Webhooks. Beim Deploy bestaetigen/ersetzen (Kontakt-Hook aus altem Live-Bundle als Default). */
  var P12_HOOKS = {
    contact:   "https://hook.eu2.make.com/eqbua98cd14jyhwlov7nach5wa8kyo14",
    community: "https://hook.eu2.make.com/eqbua98cd14jyhwlov7nach5wa8kyo14"
  };

  var MAILTO_CONTACT = "mailto:"+MAIL+"?subject=Protect-12%20Gespr%C3%A4ch%20vereinbaren&body="+
    encodeURIComponent("Guten Tag,\n\nich interessiere mich fuer eine Protect-12 Krisenvorsorge-Analyse und wuerde gern ein unverbindliches Gespraech vereinbaren.\n\nName:\nWohnort (ungefaehr):\nHaushalt (Personen):\nTelefonisch erreichbar:\n\nViele Gruesse");
  var MAILTO_COMMUNITY = "mailto:"+MAIL+"?subject=Voranmeldung%20Krisenvorsorge-Netzwerk&body="+
    encodeURIComponent("Guten Tag,\n\nich moechte mich fuer das Protect-12 Krisenvorsorge-Netzwerk vormerken lassen.\n\nName:\nRegion/PLZ (optional):\nWarum ich dabei sein moechte:\n\nViele Gruesse");

  var SHIELD = '<svg class="shield-wm" viewBox="0 0 100 120" aria-hidden="true">'+
    '<path d="M50 4 L92 20 V60 C92 90 72 108 50 116 C28 108 8 90 8 60 V20 Z" fill="#ffffff"/></svg>';

  var NAV = [
    {href:"das-system.html", label:"Das System"},
    {href:"ablauf-experten.html", label:"Ablauf & Experten"},
    {href:"lagebild.html", label:"Lagebild"},
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
    return '<footer class="site-footer">'+SHIELD+'<div class="wrap">'+
      '<div class="cols">'+
        '<div><img class="brandlogo" src="assets/logo-weiss.png" alt="Protect-12" style="height:34px">'+
          '<p class="brand-blurb">Krisenvorsorge mit System. Eine strukturierte Analyse Ihres Haushalts, ein laufendes Lagebild und ein gepr&uuml;ftes Netzwerk. Eine Leistung von B&auml;umer Solutions.</p></div>'+
        '<div><h4>Das System</h4>'+
          '<a href="das-system.html">Zw&ouml;lf Bereiche</a><a href="das-system.html#szenarien">Acht Szenarien</a>'+
          '<a href="das-system.html#unterlagen">F&uuml;nfzehn Unterlagen</a><a href="lagebild.html">Lagebild</a></div>'+
        '<div><h4>Mehr</h4>'+
          '<a href="ablauf-experten.html">Ihr Weg</a><a href="ablauf-experten.html#experten">Expertennetzwerk</a>'+
          '<a href="community.html">Community</a><a href="ratgeber.html">Ratgeber</a>'+
          '<a href="faq-kontakt.html">Fragen &amp; Antworten</a></div>'+
        '<div><h4>Kontakt</h4>'+
          '<a href="mailto:'+MAIL+'">'+MAIL+'</a><a href="'+TELHREF+'">'+TEL+'</a>'+
          '<a href="#" data-cta>Gespr&auml;ch vereinbaren</a>'+
          '<a href="#" data-legal="impressum">Impressum</a><a href="#" data-legal="datenschutz">Datenschutz</a></div>'+
      '</div>'+
      '<div class="legal"><span>&copy; Protect-12 &middot; Krisenvorsorge mit System &middot; Konzept und Umsetzung: B&auml;umer Solutions</span>'+
        '<span>protect-12.de</span></div>'+
      '</div></footer>';
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

    var b = document.getElementById("p12burger"), m = document.getElementById("p12mnav");
    if(b && m){ b.addEventListener("click", function(){ m.classList.toggle("open"); }); }

    bindAll("[data-cta]", function(ev){ ev.preventDefault(); openForm("contact"); });
    bindAll("[data-community]", function(ev){ ev.preventDefault(); openForm("community"); });
    bindAll("[data-legal]", function(ev){ ev.preventDefault(); openLegal(ev.currentTarget.getAttribute("data-legal")); });

    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }); }, {threshold:.12});
    each(".reveal", function(el){ io.observe(el); });
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
        '<a href="#" data-legal="datenschutz">Datenschutzerkl&auml;rung</a> gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage einverstanden. <span style="color:var(--red)">*</span></label>'+
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
      var data={ formular:cfg.formular, seite:location.pathname, zeit:new Date().toISOString() };
      var ok=true;
      cfg.fields.forEach(function(f){ var el=form.querySelector('[name="'+f.name+'"]'); data[f.name]=el?el.value.trim():"";
        if(f.req && !data[f.name]) ok=false; });
      if(!form.querySelector("#p12f_consent").checked) ok=false;
      if(!ok){ errBox.innerHTML="Bitte f&uuml;llen Sie die Pflichtfelder aus und best&auml;tigen Sie die Datenschutzerkl&auml;rung."; errBox.style.display="block"; return; }
      var btn=form.querySelector("button[type=submit]"); btn.disabled=true; btn.textContent="Wird gesendet ...";
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
    var x=o.ov.querySelector("[data-x]"); if(x) x.addEventListener("click", o.close);
  }

  function openLegal(which){
    var t = (which==="impressum")? LEGAL.impressum : LEGAL.datenschutz;
    overlay('<div class="p12modal"><div class="p12modal-head"><span>PROTECT-12</span><button data-x aria-label="Schlie&szlig;en">&#10005;</button></div><div class="p12modal-body legal-body">'+t+'</div></div>');
  }

  var LEGAL = {
    impressum: '<h2 style="font-size:24px;margin-bottom:14px">Impressum</h2>'+
      '<p><b>Angaben gem&auml;&szlig; &sect; 5 Digitale-Dienste-Gesetz (DDG)</b><br>B&auml;umer Solutions<br>Inhaber: Kevin B&auml;umer<br>Donzenbachstra&szlig;e 5<br>57572 Niederfischbach<br>Deutschland</p>'+
      '<p style="margin-top:14px">Protect-12 ist ein Angebot von B&auml;umer Solutions.</p>'+
      '<p style="margin-top:14px"><b>Kontakt</b><br>Telefon: +49 176 23998516<br>E-Mail: Kontakt@protect-12.de</p>'+
      '<p style="margin-top:14px"><b>Umsatzsteuer-ID</b><br>USt-IdNr. gem&auml;&szlig; &sect; 27a UStG: DE462173157</p>'+
      '<p style="margin-top:14px"><b>Redaktionell verantwortlich (&sect; 18 Abs. 2 MStV)</b><br>Kevin B&auml;umer, Anschrift wie oben.</p>'+
      '<p style="margin-top:14px"><b>EU-Streitschlichtung</b><br>Plattform der EU-Kommission: ec.europa.eu/consumers/odr. Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>'+
      '<p style="margin-top:14px">Standardklauseln zur Haftung f&uuml;r Inhalte (&sect; 7 Abs. 1 DDG; &sect;&sect; 8 bis 10 DDG), Haftung f&uuml;r Links und Urheberrecht gelten unver&auml;ndert.</p>'+
      '<p style="margin-top:14px;color:var(--muted)">Stand: Juli 2026</p>',
    datenschutz: '<h2 style="font-size:24px;margin-bottom:14px">Datenschutzerkl&auml;rung</h2>'+
      '<p><b>1. Verantwortlicher</b><br>B&auml;umer Solutions, Inhaber Kevin B&auml;umer, Donzenbachstra&szlig;e 5, 57572 Niederfischbach. Telefon +49 176 23998516, Kontakt@protect-12.de.</p>'+
      '<p style="margin-top:12px"><b>2. Hosting</b><br>Die Seite wird bei einem Dienstleister gehostet, auf Grundlage eines Auftragsverarbeitungsvertrags und, soweit einschl&auml;gig, der EU-Standardvertragsklauseln.</p>'+
      '<p style="margin-top:12px"><b>3. Server-Logfiles</b><br>Beim Aufruf werden technisch notwendige Daten verarbeitet (Browsertyp, Betriebssystem, Referrer-URL, Uhrzeit, IP-Adresse).</p>'+
      '<p style="margin-top:12px"><b>4. Cookies und lokale Speicherung</b><br>Keine Tracking-Cookies ohne Einwilligung. Technisch notwendig gespeichert wird nur die Cookie-Auswahl (&sect; 25 Abs. 2 TDDDG). Optionale Statistik nur nach Einwilligung.</p>'+
      '<p style="margin-top:12px"><b>5. Live-Lagebild</b><br>Die Lagebild-Seite ruft &ouml;ffentlich zug&auml;ngliche Fachdaten direkt in Ihrem Browser ab (u.a. BBK/NINA, USGS, GDACS, NOAA). Dabei erhalten die Anbieter technisch Ihre IP-Adresse. Es werden keine personenbezogenen Daten an uns &uuml;bermittelt.</p>'+
      '<p style="margin-top:12px"><b>6. Anfrage- und Voranmelde-Formular</b><br>Ihre Angaben werden zur Bearbeitung Ihrer Anfrage verarbeitet, technisch &uuml;ber unseren Auftragsverarbeiter Make (EU-Rechenzentrum) an unser Postfach. Eine Verwendung f&uuml;r Werbezwecke findet nicht statt.</p>'+
      '<p style="margin-top:12px"><b>7. Fragebogen und Onlineportal</b><br>Auftragsverarbeiter Airtable (USA) als Datenbank sowie Make. Bei besonderen Kategorien Art. 9 Abs. 2 lit. a DSGVO.</p>'+
      '<p style="margin-top:12px"><b>8. Eingebundene Inhalte</b><br>Google Fonts (Google Ireland Limited); Skript-Bibliotheken &uuml;ber cdnjs (Cloudflare, Inc.).</p>'+
      '<p style="margin-top:12px"><b>9. Ihre Rechte</b><br>Auskunft, Berichtigung, L&ouml;schung, Einschr&auml;nkung, Daten&uuml;bertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Widerruf an Kontakt@protect-12.de.</p>'+
      '<p style="margin-top:12px"><b>10. Beschwerderecht</b><br>Zust&auml;ndig u.a. der Landesbeauftragte f&uuml;r Datenschutz Rheinland-Pfalz, Hintere Bleiche 34, 55116 Mainz.</p>'+
      '<p style="margin-top:14px;color:var(--muted)">Stand: Juli 2026</p>'
  };

  if(document.readyState!=="loading") mount(); else document.addEventListener("DOMContentLoaded", mount);
})();
