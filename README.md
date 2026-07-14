# Protect-12 Website (p12-web)

Statische Marketing- und Content-Website in Dossier-Optik. Skalierbar, versioniert, CMS-getrieben.
Die dynamischen Teile (Fragebogen, Mitgliederbereich) bleiben in Webflow + Airtable + Make.

## Struktur
- `src/pages/`   Statische Seiten (Start, Das System, Ablauf & Experten, Lagebild, Community, FAQ & Kontakt)
- `src/assets/`  Gemeinsame Optik (p12.css), Interaktion + Formulare (p12.js), Live-Lagebild (lagebild.js), Logo
- `content/ratgeber/`  Ratgeber-Artikel als Markdown (das pflegt das CMS)
- `templates/article.html`  Vorlage, in die jeder Artikel gegossen wird
- `build.mjs`    Baut alles nach `dist/`: Clean-URLs, Ratgeber-Hub, Sitemap
- `admin/`       Redaktions-Oberflaeche (Decap CMS)
- `.github/workflows/deploy.yml`  Baut und deployt bei jedem Push automatisch auf GitHub Pages

## Neuen Artikel schreiben
Zwei Wege, beide landen im selben Ergebnis:
1. **Bequem (CMS):** `https://protect-12.de/admin/` oeffnen, anmelden, "Ratgeber-Artikel" -> Neu. Felder ausfuellen,
   Inhalt schreiben, speichern. Es entsteht ein Pull Request, nach Freigabe ist der Artikel live.
2. **Direkt:** eine neue Datei `content/ratgeber/mein-thema.md` anlegen (Kopf wie bei `notvorrat-anlegen.md`),
   committen. Der Rest passiert automatisch.

Der Artikel bekommt automatisch die Dossier-Optik, saubere SEO (Title, Meta, Canonical, JSON-LD) und landet
im Ratgeber-Hub. Kein Code noetig.

## Lokal ansehen
```
npm install
npm run build      # baut nach dist/
npm run serve      # baut und startet lokalen Server (Clean-URLs funktionieren)
```
Hinweis: `dist/` nutzt root-relative Pfade (/assets/...), also per lokalem Server ansehen, nicht per Doppelklick.

## Live gehen / Deploy
Push auf `main` -> GitHub Action baut und veroeffentlicht auf GitHub Pages. Domain via `CNAME` (protect-12.de).
Einrichtung Schritt fuer Schritt: siehe SETUP_Skalierbar.md.

## Arbeitsteilung (Hybrid)
- Diese Seite (Marketing, Ratgeber, Lagebild, Community-Landing): hier im Repo, statisch, schnell skalierbar.
- Fragebogen und Mitgliederbereich: bleiben in Webflow + Airtable + Make. Verlinkt, nicht vermischt.
