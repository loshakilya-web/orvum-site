/* ORVUM public page — the demo decision card's buttons are a preview: pressing one says so (front-end review, 8 Nov 2026). */
(function () {
  'use strict';
  var card = document.querySelector('.dcard'); if (!card) return;
  var msg = card.querySelector('.dmsg'); if (!msg) return;
  var TEXT = 'Preview only — in the live product, the responsible person approves, adjusts or rejects here.';
  Array.prototype.forEach.call(card.querySelectorAll('button.dbtn'), function (b) {
    b.addEventListener('click', function () { msg.textContent = ''; window.setTimeout(function () { msg.textContent = TEXT; }, 30); });
  });
})();
