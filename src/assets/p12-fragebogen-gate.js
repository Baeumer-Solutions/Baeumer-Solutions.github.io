/* ============================================================
   PROTECT-12 · Einwilligungs-Riegel vor dem Fragebogen
   Stand 11.08.2026

   Zweck: Vor der ersten Eingabe muss die Kundin oder der Kunde die
   Datenschutzinformation bestaetigen. Ohne Haken laeuft nichts, damit
   keine Gesundheitsangaben ohne ausdrueckliche Einwilligung nach
   Art. 9 Abs. 2 lit. a DSGVO in unsere Systeme wandern.

   Zusaetzlich: Sperrliste. Wer hier steht, kommt nicht mehr in den
   Bogen. Eintraege sind reversibel, einfach Zeile entfernen.

   Liegt auf protect-12.de/assets/, eingebunden im Webflow-Fusscode.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Sperrliste (Airtable-Record-IDs) ---------- */
  var GESPERRT = {
    "rec2l2xTFuaNuCpFE": "Vincent Sauer",
    "recala6penQM1OCjN": "Frederic Sauer"
  };

  var KEY_PREFIX = "p12-fb-einwilligung-";
  var MELDE_HOOK = "https://hook.eu2.make.com/i44tx5i2o9okgqib6fh4cl239an2jdd7";
  /* Muss zum Token in p12.js und zum Make-Filter passen, sonst wird die
     Einwilligungs-Meldung als Fremd-POST verworfen (Stand 11.08.2026). */
  var P12_TOKEN = "p12web-7Q3xR9tK";

  function pfad() { return (location.pathname || "").replace(/\/+$/, ""); }
  function istFragebogen() { return /\/fragebogen$/i.test(pfad()); }

  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : "";
  }

  function stil() {
    if (document.getElementById("p12gate-style")) return;
    var s = document.createElement("style");
    s.id = "p12gate-style";
    s.textContent = [
      "#p12gate{position:fixed;inset:0;z-index:99999;background:rgba(15,20,28,.94);",
      "overflow:auto;padding:28px 16px;font:400 15px/1.6 Montserrat,system-ui,-apple-system,sans-serif}",
      "#p12gate .k{max-width:760px;margin:0 auto;background:#fff;border-top:4px solid #C31212;",
      "box-shadow:0 18px 50px rgba(0,0,0,.35)}",
      "#p12gate .kopf{background:#1B2430;color:#fff;padding:18px 26px;font-weight:800;",
      "letter-spacing:.14em;font-size:13px}",
      "#p12gate .b{padding:26px 28px;color:#1A1A1A}",
      "#p12gate h2{color:#1B2430;font-size:22px;margin:0 0 12px;line-height:1.3}",
      "#p12gate p{margin:0 0 12px}",
      "#p12gate ul{margin:0 0 14px 20px}#p12gate li{margin-bottom:6px}",
      "#p12gate a{color:#1B2430}",
      "#p12gate label{display:flex;gap:10px;align-items:flex-start;background:#EEF1F4;",
      "border-left:3px solid #1B2430;padding:13px 15px;margin-bottom:10px;cursor:pointer;font-size:14.5px}",
      "#p12gate label input{margin-top:3px;flex:0 0 auto;width:17px;height:17px}",
      "#p12gate .pflicht{border-left-color:#C31212}",
      "#p12gate .btn{display:block;width:100%;border:0;background:#C31212;color:#fff;",
      "font:700 15px Montserrat,system-ui,sans-serif;padding:15px;cursor:pointer;margin-top:16px}",
      "#p12gate .btn:disabled{background:#9aa2ab;cursor:not-allowed}",
      "#p12gate .fein{font-size:13px;color:#5F656C;margin-top:14px}",
      "#p12gate .stop{border-top-color:#1B2430}",
      "@media(max-width:640px){#p12gate .b{padding:20px 18px}#p12gate h2{font-size:19px}}"
    ].join("");
    document.head.appendChild(s);
  }

  function schale(inhalt, klasse) {
    stil();
    var alt = document.getElementById("p12gate");
    if (alt) alt.parentNode.removeChild(alt);
    var d = document.createElement("div");
    d.id = "p12gate";
    d.setAttribute("role", "dialog");
    d.setAttribute("aria-modal", "true");
    d.innerHTML = '<div class="k ' + (klasse || "") + '">' +
      '<div class="kopf">PROTECT-12</div><div class="b">' + inhalt + "</div></div>";
    document.body.appendChild(d);
    document.documentElement.style.overflow = "hidden";
    return d;
  }

  function frei() {
    var d = document.getElementById("p12gate");
    if (d) d.parentNode.removeChild(d);
    document.documentElement.style.overflow = "";
  }

  /* ---------- Sperre ---------- */
  function sperrhinweis(name) {
    schale(
      "<h2>Dieser Fragebogen ist derzeit gesperrt</h2>" +
      "<p>Der Zugang zu diesem Fragebogen wurde vor&uuml;bergehend deaktiviert. " +
      "Ihre bereits gemachten Angaben bleiben unver&auml;ndert gespeichert und werden " +
      "nicht weiterverarbeitet.</p>" +
      "<p>Bitte wenden Sie sich an uns, wenn Sie dazu Fragen haben:</p>" +
      "<p><b>Protect-12</b><br>B&auml;umer Solutions<br>" +
      '<a href="mailto:kontakt@protect-12.de">kontakt@protect-12.de</a><br>' +
      '<a href="tel:+4917623998516">+49 176 23998516</a></p>' +
      '<p class="fein">Kennung: ' + (name || "") + "</p>",
      "stop"
    );
  }

  /* ---------- Einwilligung ---------- */
  function melden(kunde, wahl) {
    try {
      var text = "EINWILLIGUNG FRAGEBOGEN\n" +
        "Kunden-ID: " + kunde + "\n" +
        "Analyse: ja\n" +
        "Gesundheitsangaben (Art. 9): " + (wahl.gesundheit ? "ja" : "nein") + "\n" +
        "KI-gestuetzte Auswertung: " + (wahl.ki ? "ja" : "nein") + "\n" +
        "Zeitpunkt: " + new Date().toISOString();
      fetch(MELDE_HOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formular: "Einwilligung Fragebogen",
          name: "Fragebogen " + kunde,
          email: "",
          telefon: "",
          seite: location.href,
          nachricht: text,
          datenschutz: "ja",
          zeit: new Date().toISOString(),
          token: P12_TOKEN
        })
      }).catch(function () { /* Zustellung ist Kuer, der Riegel ist Pflicht */ });
    } catch (e) { /* still weiter */ }
  }

  function riegel(kunde) {
    var d = schale(
      "<h2>Bevor Sie starten: Datenschutz</h2>" +
      "<p>Ihr Fragebogen enth&auml;lt sehr pers&ouml;nliche Angaben. Deshalb sagen wir Ihnen " +
      "zuerst, was damit passiert, und holen Ihre Einwilligung ein. Erst danach &ouml;ffnet " +
      "sich der Bogen.</p>" +
      "<ul>" +
      "<li>Ihre Angaben dienen <b>ausschlie&szlig;lich</b> Ihrer pers&ouml;nlichen " +
      "Krisenvorsorge-Analyse. Keine Werbung, keine Weitergabe an Unbeteiligte.</li>" +
      "<li>Es sehen nur die Personen Ihre Daten, die an Ihrer Analyse arbeiten.</li>" +
      "<li>Wir l&ouml;schen alles <b>36 Monate</b> nach Auslieferung, auf Ihren Wunsch jederzeit " +
      "fr&uuml;her, sp&auml;testens binnen 30 Tagen.</li>" +
      "<li>Angaben zu Gesundheit oder Medikation sind <b>freiwillig</b>. Ohne sie erstellen wir " +
      "die Analyse trotzdem, sie ist an diesen Stellen dann weniger genau.</li>" +
      "</ul>" +
      '<p>Alle Einzelheiten stehen in unserer <a href="https://protect-12.de/datenschutz/" ' +
      'target="_blank" rel="noopener">Datenschutzerkl&auml;rung</a>.</p>' +
      '<label class="pflicht"><input type="checkbox" id="p12g1">' +
      "<span>Ich habe die Datenschutzinformation gelesen und willige ein, dass B&auml;umer " +
      "Solutions meine Angaben zur Erstellung meiner Protect-12 Analyse verarbeitet. " +
      "<b>(erforderlich)</b></span></label>" +
      '<label><input type="checkbox" id="p12g2">' +
      "<span>Ich willige ausdr&uuml;cklich ein, dass auch meine freiwilligen Angaben zu " +
      "Gesundheit, Medikation oder Hilfsmitteln verarbeitet werden " +
      "(Art. 9 Abs. 2 lit. a DSGVO). <i>freiwillig</i></span></label>" +
      '<label><input type="checkbox" id="p12g3">' +
      "<span>Ich willige ein, dass meine Angaben bei der Auswertung durch KI-gest&uuml;tzte " +
      "Software verarbeitet werden. Jede Bewertung gibt ein Mensch frei. " +
      "<i>freiwillig</i></span></label>" +
      '<button class="btn" id="p12gok" disabled>Einwilligung erteilen und Fragebogen &ouml;ffnen</button>' +
      '<p class="fein">Sie k&ouml;nnen jede Einwilligung jederzeit widerrufen, formlos an ' +
      '<a href="mailto:kontakt@protect-12.de">kontakt@protect-12.de</a>. Die Rechtm&auml;&szlig;igkeit ' +
      "der bis dahin erfolgten Verarbeitung bleibt davon unber&uuml;hrt.</p>"
    );

    var c1 = d.querySelector("#p12g1");
    var c2 = d.querySelector("#p12g2");
    var c3 = d.querySelector("#p12g3");
    var ok = d.querySelector("#p12gok");
    c1.addEventListener("change", function () { ok.disabled = !c1.checked; });

    ok.addEventListener("click", function () {
      if (!c1.checked) return;
      var wahl = {
        analyse: true,
        gesundheit: !!c2.checked,
        ki: !!c3.checked,
        zeit: new Date().toISOString(),
        kunde: kunde
      };
      try { localStorage.setItem(KEY_PREFIX + kunde, JSON.stringify(wahl)); } catch (e) {}
      melden(kunde, wahl);
      frei();
    });
  }

  function start() {
    if (!istFragebogen()) return;
    var kunde = param("k") || param("id") || "unbekannt";

    if (GESPERRT[kunde]) { sperrhinweis(GESPERRT[kunde]); return; }

    var da = null;
    try { da = localStorage.getItem(KEY_PREFIX + kunde); } catch (e) {}
    if (da) return;                       /* schon erteilt, nicht nochmal fragen */
    riegel(kunde);
  }

  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
