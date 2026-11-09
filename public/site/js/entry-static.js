/**
 * Static www.orvum.com hero: "Enter demo" opens the private demo on demo.orvum.com, where the access code is entered.
 * No code, session or form is handled on www (Site Brief #1, R9 / T13).
 */
(function () {
  'use strict';
  var DEMO = 'https://demo.orvum.com/';
  function track(name) {
    try { var p = window.parent; if (p && p !== window && typeof p.va === 'function') p.va('event', { name: name }); } catch (e) { /* analytics never blocks navigation */ }
  }
  document.querySelectorAll('[data-demo]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      track('demo_enter_click');
      document.documentElement.classList.add('warping');
      window.setTimeout(function () { (window.top || window).location.href = DEMO; }, 250);
    });
  });
})();
