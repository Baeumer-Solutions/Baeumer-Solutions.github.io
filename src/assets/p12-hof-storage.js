/* Protect-12 Hof forms: durable local drafts and verified server snapshots. */
(function () {
  'use strict';
  window.P12HofStorage = function (opts) {
    const form = opts.form, ref = opts.reference, status = opts.status;
    const consent = document.getElementById('consent');
    const saveButton = document.getElementById('save');
    const submitButton = document.getElementById('submit-online');
    const key = 'p12-hof-draft-v2:' + ref;
    let customer = null, baseline = {}, ready = false, busy = false;
    let revision = 0, dirty = false, timer = null, conflict = false;
    const statusBottom = document.createElement('p');
    statusBottom.setAttribute('role', 'status');
    submitButton.insertAdjacentElement('afterend', statusBottom);
    const choice = document.createElement('div');
    status.insertAdjacentElement('afterend', choice);
    const note = document.createElement('p');
    note.className = 'hint';
    note.textContent = 'Eingaben werden zusätzlich auf diesem Gerät gesichert. Nach Bestätigung des Verarbeitungshinweises wird ein Zwischenstand automatisch online gespeichert. Nur „Online gespeichert“ bestätigt die Sicherung für ein anderes Gerät. Auf gemeinsam genutzten Geräten bitte nach Abschluss „Lokale Sicherung entfernen“ verwenden.';
    status.insertAdjacentElement('beforebegin', note);
    const clear = document.createElement('button');
    clear.type = 'button'; clear.textContent = 'Lokale Sicherung entfernen';
    note.appendChild(document.createTextNode(' ')); note.appendChild(clear);
    function message(text) { status.textContent = text; statusBottom.textContent = text; }
    function canonical(value) {
      if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
      if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
      return JSON.stringify(value);
    }
    const equal = (a, b) => canonical(a) === canonical(b);
    function draft() { try { const d = JSON.parse(localStorage.getItem(key)); return d && d.reference === ref && d.answers && typeof d.answers === 'object' && !Array.isArray(d.answers) ? d : null; } catch (_) { return null; } }
    function snapshot() { return opts.answers(); }
    function persist() {
      if (!ready || !dirty) return true;
      try {
        localStorage.setItem(key, JSON.stringify({ reference: ref, customer, answers: snapshot(), baseline, consent: consent.checked, updated: Date.now() }));
        return true;
      } catch (_) { return false; }
    }
    clear.onclick = function () {
      if (dirty) { message('Es gibt noch nicht online bestätigte Änderungen. Bitte zuerst online speichern.'); return; }
      try { localStorage.removeItem(key); message('Lokale Sicherung entfernt. Der bestätigte Online-Stand bleibt erhalten.'); }
      catch (_) { message('Die lokale Sicherung konnte nicht entfernt werden.'); }
    };
    async function api(payload) {
      const controller = typeof AbortController === 'function' ? new AbortController() : null;
      let timeout;
      const request = fetch(opts.api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), ...(controller ? { signal: controller.signal } : {}) });
      try {
        const r = await Promise.race([request, new Promise((_, reject) => { timeout = setTimeout(() => { if (controller) controller.abort(); reject(new Error('Zeitüberschreitung')); }, 30000); })]);
        if (!r.ok) throw new Error('Übertragung');
        const text = await r.text(); return text ? JSON.parse(text) : {};
      } finally { clearTimeout(timeout); }
    }
    function record(data) {
      const rows = data.records;
      if (!Array.isArray(rows) || !rows.length) throw new Error('Zugang nicht gefunden');
      const sorted = rows.slice().sort((a, b) => String(b.fields.Eingegangen || b.createdTime || '').localeCompare(String(a.fields.Eingegangen || a.createdTime || '')));
      const f = sorted[0].fields;
      if (!f || !f.Kunde || !f.Kunde[0]) throw new Error('Zugang nicht gefunden');
      const a = JSON.parse(f['Antworten-JSON'] || '{}');
      if (!a || typeof a !== 'object' || Array.isArray(a)) throw new Error('Antwortformat');
      return { customer: f.Kunde[0], answers: a };
    }
    function enable() { for (const e of form.elements) e.disabled = false; saveButton.disabled = false; if (opts.addButton) opts.addButton.disabled = false; }
    function schedule() {
      clearTimeout(timer);
      if (consent.checked && !conflict) timer = setTimeout(() => save(false), 5000);
    }
    function changed() {
      if (!ready) return;
      revision++; dirty = true;
      const stored = persist();
      message(stored ? 'Änderungen auf diesem Gerät gesichert. ' + (consent.checked ? 'Online-Speicherung folgt …' : 'Für die Online-Speicherung bitte den Verarbeitungshinweis bestätigen.') : 'Lokale Sicherung ist in diesem Browser nicht möglich. Bitte online speichern und die Bestätigung abwarten.');
      schedule();
    }
    function resolve(server, local) {
      conflict = true; clearTimeout(timer); choice.replaceChildren();
      message('Es gibt unterschiedliche gespeicherte Stände. Nichts wurde überschrieben. Bitte wähle, welchen Stand Du weiterbearbeiten möchtest.');
      for (const [label, useLocal] of [['Stand dieses Geräts weiterbearbeiten', true], ['Online-Stand laden', false]]) {
        const b = document.createElement('button'); b.type = 'button'; b.textContent = label;
        b.onclick = () => {
          baseline = server.answers; customer = server.customer;
          opts.restore(useLocal ? local.answers : server.answers);
          consent.checked = useLocal ? !!local.consent : !!server.answers._hof_processing_confirmed;
          conflict = false; choice.replaceChildren(); revision++; dirty = useLocal;
          if (useLocal) { persist(); message('Stand dieses Geräts wiederhergestellt. Bitte prüfen und mit „Online speichern“ bestätigen.'); }
          else { try { localStorage.removeItem(key); } catch (_) {} message('Online-Stand geladen.'); }
        };
        choice.appendChild(b);
      }
    }
    async function save(final) {
      clearTimeout(timer);
      if (!ready || busy || conflict) return;
      if (!consent.checked) { persist(); message('Auf diesem Gerät gesichert. Für die Online-Speicherung bitte den Verarbeitungshinweis bestätigen.'); consent.focus(); return; }
      // Partial input, including an unfinished email, must be saveable.
      if (final && !form.reportValidity()) { persist(); message('Bitte das markierte Feld korrigieren. Dein Zwischenstand bleibt erhalten.'); return; }
      const atRevision = revision, a = snapshot();
      a._hof_version = opts.version; a._hof_status = final ? 'abgeschickt' : 'Zwischenstand';
      a._hof_processing_confirmed = new Date().toISOString();
      busy = true; saveButton.disabled = true; submitButton.disabled = true;
      persist(); message('Online-Speicherung wird geprüft …');
      try {
        const before = record(await api({ action: 'load', respondentId: ref }));
        if (before.customer !== customer || !equal(before.answers, baseline)) {
          resolve(before, { answers: snapshot(), consent: consent.checked }); return;
        }
        await api({ action: 'save', respondentId: ref, kundeId: customer, gespeichert: new Date().toISOString(), beantwortet: opts.answered(a), gesamt: opts.total(), antwortenJson: JSON.stringify(a) });
        const after = record(await api({ action: 'load', respondentId: ref }));
        if (after.customer !== customer || !equal(after.answers, a)) throw new Error('Bestätigung fehlt');
        baseline = a;
        if (revision === atRevision) {
          dirty = false;
          // Keep a confirmed fallback without silently overwriting another tab's draft.
          const current = draft();
          if (!current || equal(current.answers, snapshot())) {
            try { localStorage.setItem(key, JSON.stringify({ reference: ref, customer, answers: a, baseline: a, consent: true, updated: Date.now() })); } catch (_) {}
          }
          message(final ? 'Vielen Dank! Dein Fragebogen wurde abgeschickt und online gespeichert.' : 'Online gespeichert. Beim nächsten Öffnen desselben Links sind Deine Angaben wieder da.');
        } else { persist(); message('Vorheriger Stand online gespeichert. Neuere Änderungen sind noch nicht online bestätigt.'); schedule(); }
      } catch (_) {
        const stored = persist();
        message('Online-Speicherung nicht bestätigt. ' + (stored ? 'Deine Eingaben bleiben auf diesem Gerät erhalten. Bitte erneut speichern, sobald die Verbindung wieder da ist.' : 'Bitte diese Seite offen lassen und erneut speichern. Lokale Sicherung ist nicht verfügbar.'));
      } finally { busy = false; saveButton.disabled = false; submitButton.disabled = false; }
    }
    form.addEventListener('input', changed); form.addEventListener('change', changed);
    form.addEventListener('submit', e => { e.preventDefault(); save(false); });
    if (opts.addButton) opts.addButton.addEventListener('click', changed);
    window.addEventListener('pagehide', persist);
    document.addEventListener('visibilitychange', () => { if (document.hidden) persist(); });
    window.addEventListener('beforeunload', e => { if (dirty) { persist(); e.preventDefault(); e.returnValue = ''; } });
    saveButton.onclick = () => save(false); submitButton.onclick = () => save(true);
    async function start() {
      for (const e of form.elements) e.disabled = true;
      saveButton.disabled = true; if (opts.addButton) opts.addButton.disabled = true;
      if (!opts.validReference(ref)) { message('Bitte öffne Deinen persönlichen Fragebogenlink aus der E-Mail.'); return; }
      const local = draft();
      try {
        message('Dein Fragebogen wird geladen …');
        const server = record(await api({ action: 'load', respondentId: ref }));
        customer = server.customer; baseline = server.answers;
        opts.restore(server.answers); consent.checked = !!server.answers._hof_processing_confirmed;
        ready = true; enable();
        if (local && !equal(local.answers, server.answers)) {
          if (local.customer === customer && equal(local.baseline, server.answers)) {
            opts.restore(local.answers); consent.checked = !!local.consent; dirty = true; revision++;
            message('Noch nicht online gespeicherte Eingaben von diesem Gerät wiederhergestellt. Bitte prüfen und online speichern.');
          } else resolve(server, local);
        } else message(server.answers._hof_status === 'abgeschickt' ? 'Dein abgeschickter Fragebogen wurde vollständig geladen.' : Object.keys(server.answers).length ? 'Dein gespeicherter Stand wurde geladen.' : 'Dein persönlicher Fragebogen ist bereit.');
      } catch (_) {
        if (local && local.customer) {
          customer = local.customer; baseline = local.baseline || {}; opts.restore(local.answers); consent.checked = !!local.consent;
          ready = true; dirty = true; enable();
          message('Online-Verbindung nicht verfügbar. Deine lokale Sicherung wurde wiederhergestellt. Bitte später online speichern.');
        } else message('Dein Fragebogen konnte nicht geladen werden. Bitte lade die Seite erneut. Es werden keine leeren Daten gespeichert.');
      }
    }
    start();
  };
})();
