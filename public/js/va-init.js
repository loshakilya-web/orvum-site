/**
 * Vercel Web Analytics bootstrap for a strict CSP (script-src 'self'): no inline script (Site Brief #1, R2).
 * Events are a fixed list and carry no URLs with query strings, field text, email addresses or access codes.
 */
(function () {
  'use strict';
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var ALLOWED = { email_click: 1, linkedin_click: 1, demo_enter_click: 1, calculator_used: 1 };
  function send(name) { if (ALLOWED[name]) window.va('event', { name: name }); }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!a) return;
    var name = a.getAttribute('data-track');
    if (!name) {
      var href = a.getAttribute('href') || '';
      if (href.indexOf('mailto:') === 0) name = 'email_click';
      else if (/^https:\/\/(www\.)?linkedin\.com\//.test(href)) name = 'linkedin_click';
      else if (/^https:\/\/demo\.orvum\.com\//.test(href)) name = 'demo_enter_click';
    }
    if (name) send(name);
  }, true);
})();
