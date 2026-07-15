import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = path.resolve(".");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
const SITE = "https://protect-12.de";
marked.setOptions({ gfm: true, breaks: false });

// ---------- helpers ----------
const escAttr = s => String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
const escText = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const rmDir = d => fs.existsSync(d) && fs.rmSync(d, {recursive:true, force:true});
const ensure = d => fs.mkdirSync(d, {recursive:true});
const write = (p, c) => { ensure(path.dirname(p)); fs.writeFileSync(p, c); };

// clean-URL + root-relative rewrite for static HTML pages
function rewriteHtml(html){
  return html
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace(/href="downloads\//g, 'href="/downloads/')
    .replace(/href="index\.html"/g, 'href="/"')
    .replace(/(href|src)="([a-z0-9-]+)\.html(#[^"]*)?"/g, (m, attr, name, anchor) => `${attr}="/${name}/${anchor||""}"`)
    // data-page muss dieselbe Form haben wie die NAV-hrefs in p12.js (die rewriteJs auf Clean-URLs zieht),
    // sonst greift der Aktiv-Marker im Menue nie. Kein href/src, also eigener Schritt.
    .replace(/data-page="index\.html"/g, 'data-page="/"')
    .replace(/data-page="([a-z0-9-]+)\.html"/g, (m, name) => `data-page="/${name}/"`);
}
// same idea for the shared p12.js (nav hrefs + logo live as JS string literals)
function rewriteJs(js){
  const map = {
    "index.html":"/", "das-system.html":"/das-system/", "ablauf-experten.html":"/ablauf-experten/",
    "lagebild.html":"/lagebild/", "community.html":"/community/", "faq-kontakt.html":"/faq-kontakt/",
    "ratgeber.html":"/ratgeber/", "downloads.html":"/downloads/"
  };
  for (const [k,v] of Object.entries(map)) js = js.split(k).join(v);
  return js.split("assets/logo-weiss.png").join("/assets/logo-weiss.png");
}

// ---------- reset ----------
rmDir(DIST); ensure(DIST);

// ---------- assets ----------
ensure(path.join(DIST,"assets"));
for (const f of fs.readdirSync(path.join(SRC,"assets"))){
  const from = path.join(SRC,"assets",f), to = path.join(DIST,"assets",f);
  if (f === "p12.js") write(to, rewriteJs(fs.readFileSync(from,"utf8")));
  else fs.copyFileSync(from, to);
}

// ---------- downloads (PDF/XLSX, unveraendert durchreichen) ----------
const dlSrc = path.join(SRC,"downloads");
let downloads = [];
if (fs.existsSync(dlSrc)){
  ensure(path.join(DIST,"downloads"));
  for (const f of fs.readdirSync(dlSrc)){
    fs.copyFileSync(path.join(dlSrc,f), path.join(DIST,"downloads",f));
    downloads.push({ datei:f, groesse: fs.statSync(path.join(dlSrc,f)).size });
  }
}

// ---------- static pages ----------
const routes = [];
// Nur .html wird zur Route. Ohne den Filter macht jede beliebige Datei in src/pages eine Seite auf.
for (const f of fs.readdirSync(path.join(SRC,"pages")).filter(f => f.endsWith(".html"))){
  const name = f.replace(/\.html$/,"");
  const html = rewriteHtml(fs.readFileSync(path.join(SRC,"pages",f),"utf8"));
  if (name === "index"){ write(path.join(DIST,"index.html"), html); routes.push("/"); }
  else { write(path.join(DIST,name,"index.html"), html); routes.push(`/${name}/`); }
}

// ---------- ratgeber articles ----------
const tpl = fs.readFileSync(path.join(ROOT,"templates","article.html"),"utf8");
const dir = path.join(ROOT,"content","ratgeber");
let articles = [];
if (fs.existsSync(dir)){
  for (const f of fs.readdirSync(dir).filter(f=>f.endsWith(".md"))){
    const { data, content } = matter(fs.readFileSync(path.join(dir,f),"utf8"));
    if (data.draft) continue;
    const slug = data.slug || f.replace(/\.md$/,"");
    const canonical = `${SITE}/ratgeber/${slug}`;
    const body = marked.parse(content);
    const out = tpl
      .replaceAll("{{TITLE}}", escAttr(data.title))
      .replaceAll("{{DESC}}", escAttr(data.description||""))
      .replaceAll("{{CANONICAL}}", canonical)
      .replaceAll("{{KICKER}}", escText(data.kicker||"Ratgeber"))
      .replaceAll("{{H1}}", escText(data.h1||data.title))
      .replaceAll("{{LEAD}}", escText(data.lead||""))
      .replaceAll("{{DATE}}", data.date||"")
      .replaceAll("{{TITLE_JSON}}", JSON.stringify(String(data.h1||data.title)))
      .replaceAll("{{DESC_JSON}}", JSON.stringify(String(data.description||"")))
      .replace("{{BODY}}", body);
    write(path.join(DIST,"ratgeber",slug,"index.html"), out);
    routes.push(`/ratgeber/${slug}/`);
    articles.push({ slug, ...data });
  }
}
articles.sort((a,b)=>(a.order||99)-(b.order||99));

// ---------- ratgeber hub ----------
const cards = articles.map(a =>
  `<a class="art" href="/ratgeber/${a.slug}/"><div class="lbl">Ratgeber</div><div class="b"><div class="k">Anleitung</div><h3>${escText(a.h1||a.title)}</h3><p>${escText(a.description||"")}</p></div><div class="foot"><span class="btn btn-line">Artikel lesen &rarr;</span></div></a>`
).join("\n      ");
const hub = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Krisenvorsorge-Ratgeber: Checklisten &amp; Anleitungen | Protect-12</title>
<meta name="description" content="Praktische Anleitungen zur Krisenvorsorge: Notvorrat-Liste, Wasservorrat, Blackout-Vorsorge, Checkliste. Klar, ehrlich, ohne Panikmache.">
<meta name="robots" content="index,follow"><link rel="canonical" href="${SITE}/ratgeber">
<meta property="og:type" content="website"><meta property="og:title" content="Krisenvorsorge-Ratgeber | Protect-12">
<meta property="og:image" content="https://protect12.de/assets/og.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/p12.css">
<style>.art{background:#fff;border:1px solid var(--line);box-shadow:var(--shadow);overflow:hidden;position:relative;display:flex;flex-direction:column;border-top:3px solid var(--navy);text-decoration:none}
.art .lbl{background:linear-gradient(180deg,#233042,#1B2430);color:#fff;padding:16px 22px;font-weight:800;letter-spacing:.03em}
.art .b{padding:20px 22px;flex:1}.art .k{font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--red)}
.art h3{margin:8px 0 8px;font-size:19px}.art p{color:var(--muted);font-size:14.5px}.art .foot{padding:0 22px 20px}</style>
</head>
<body data-page="/ratgeber/">
<div id="p12-header"></div>
<header class="hero"><div id="radar-slot"></div><div class="wrap">
  <span class="kicker">Ratgeber</span><h1>Krisenvorsorge-Ratgeber</h1>
  <p class="lead">Praktische Anleitungen zur Krisenvorsorge: klar, ehrlich, ohne Panikmache. Jeder Artikel zeigt, was wirklich z&auml;hlt, und wo eine individuelle Analyse den Unterschied macht.</p>
  <div class="cta-row"><a class="btn btn-red" href="/downloads/">Checklisten herunterladen</a><a class="btn btn-ghost" href="/faq-kontakt/#selfcheck">Zum kostenlosen Schnelltest</a></div>
</div></header>
<section><div class="wrap">
  <div class="section-head reveal"><span class="kicker">Anleitungen &amp; Checklisten</span><h2>Wo m&ouml;chten Sie anfangen?</h2></div>
  <div class="grid g3 reveal">
      ${cards || '<p>Artikel folgen in K&uuml;rze.</p>'}
  </div>
</div></section>
<section class="band"><div id="radar-slot2"></div><div class="wrap">
  <span class="kicker">Von der Liste zum Plan</span><h2>Eine Liste ist ein Anfang. Ihr Plan ist das Ziel.</h2>
  <p>Ratgeber zeigen, was man haben k&ouml;nnte. Die Protect-12 Analyse zeigt, was bei Ihnen fehlt und was zuerst dran ist.</p>
  <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn btn-red" data-cta href="#">Gespr&auml;ch vereinbaren &rarr;</a><a class="btn btn-ghost" href="/das-system/">Das System ansehen</a></div>
</div></section>
<div id="p12-footer"></div>
<script src="/assets/p12.js"></script>
<script>document.getElementById("radar-slot").innerHTML='<svg class="radar" viewBox="0 0 600 600" aria-hidden="true"><g fill="none" stroke="#33465c" stroke-width="1"><circle cx="300" cy="300" r="70"/><circle cx="300" cy="300" r="140"/><circle cx="300" cy="300" r="210"/><circle cx="300" cy="300" r="280"/><line x1="300" y1="10" x2="300" y2="590"/><line x1="10" y1="300" x2="590" y2="300"/></g><circle cx="380" cy="228" r="4" fill="#C31212"/></svg><svg class="shield-wm" viewBox="0 0 100 120" aria-hidden="true"><path d="M50 4 L92 20 V60 C92 90 72 108 50 116 C28 108 8 90 8 60 V20 Z" fill="#ffffff"/></svg>';document.getElementById("radar-slot2").innerHTML=document.querySelector("#radar-slot .radar").outerHTML;</script>
</body></html>`;
write(path.join(DIST,"ratgeber","index.html"), hub);
routes.push("/ratgeber/");

// ---------- admin (CMS) ----------
const adminSrc = path.join(ROOT,"admin");
if (fs.existsSync(adminSrc)){ ensure(path.join(DIST,"admin")); for (const f of fs.readdirSync(adminSrc)) fs.copyFileSync(path.join(adminSrc,f), path.join(DIST,"admin",f)); }

// ---------- sitemap + robots + CNAME ----------
// /lagebild/ liegt NICHT in diesem Repo: es kommt aus der GitHub-Pages-Projektseite
// Baeumer-Solutions/lagebild (Lageupdate, gerendert von Kestrel/RiskCompass_HorizonScan/render_p12.py).
// Eine Projektseite ueberdeckt den gleichnamigen Pfad der Org-Pages. Die URL existiert also,
// nur eben nicht als Route dieses Builds, deshalb hier von Hand in die Sitemap.
const EXTERN = ["/lagebild/"];
const uniq = [...new Set([...routes, ...EXTERN])];
const sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`+
  uniq.map(r=>`  <url><loc>${SITE}${r}</loc><lastmod>${new Date().toISOString().slice(0,10)}</lastmod></url>`).join("\n")+
  `\n</urlset>\n`;
write(path.join(DIST,"sitemap.xml"), sm);
write(path.join(DIST,"robots.txt"), `User-agent: *\nAllow: /\nDisallow: /fragebogen\nDisallow: /mein-bereich\n\nSitemap: ${SITE}/sitemap.xml\n`);
if (fs.existsSync(path.join(ROOT,"CNAME"))) fs.copyFileSync(path.join(ROOT,"CNAME"), path.join(DIST,"CNAME"));

console.log(`Build fertig: ${uniq.length} Seiten, ${articles.length} Artikel.`);
console.log(uniq.sort().join("\n"));
