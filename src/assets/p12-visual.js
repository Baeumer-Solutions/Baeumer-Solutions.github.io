/* Public presentation only. No customer data, network requests or storage. */
(function () {
  "use strict";
  document.querySelectorAll('[data-dashboard-demo]').forEach(function (demo) {
    demo.querySelectorAll('[data-demo-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        demo.querySelectorAll('[data-demo-tab]').forEach(function (tab) {
          var active = tab === button;
          tab.classList.toggle('is-active', active);
          tab.setAttribute('aria-pressed', String(active));
        });
        demo.querySelectorAll('[data-demo-panel]').forEach(function (panel) {
          panel.hidden = panel.dataset.demoPanel !== button.dataset.demoTab;
        });
      });
    });
    demo.querySelectorAll('input[type="checkbox"]').forEach(function (check) {
      check.addEventListener('change', function () {
        var count = demo.querySelectorAll('input[type="checkbox"]:checked').length;
        demo.querySelector('.v-task-result').textContent = count + ' von 3 Beispielaufgaben abgehakt';
      });
    });
  });
  var search = document.getElementById('module-search');
  if (search) {
    var modules = Array.from(document.querySelectorAll('.v-module'));
    var normalize = function (str) { return str.toLocaleLowerCase('de-DE').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss'); };
    search.addEventListener('input', function () {
      var query = normalize(search.value.trim());
      var count = 0;
      modules.forEach(function (module) {
        var match = !query || normalize(module.textContent).includes(query);
        module.hidden = !match;
        if (match) count += 1;
        // A search also reveals matching criteria; clearing it restores the compact overview.
        module.querySelector('details').open = Boolean(query && match);
      });
      document.getElementById('module-search-count').textContent = query ? count + ' passende Lebensbereiche' : '12 Lebensbereiche · 144 Kriterien';
      document.querySelector('.v-no-results').hidden = count > 0;
    });
    function revealAnchor() {
      if (!/^#m\d{2}$/.test(window.location.hash)) return;
      var module = document.getElementById(window.location.hash.slice(1));
      if (module) { module.hidden = false; module.querySelector('details').open = true; }
    }
    window.addEventListener('hashchange', revealAnchor);
    revealAnchor();
  }
})();
