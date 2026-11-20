/* ORVUM public page — the demo decision cards' buttons are a preview: pressing one says so (front-end review, 8 Nov 2026;
   since 9 Nov there is one card per Section 01 tab). */
(function () {
  'use strict';
  var TEXT = 'Preview only — in the live product, the responsible person approves, adjusts or rejects here.';
  Array.prototype.forEach.call(document.querySelectorAll('.dcard'), function (card) {
    var msg = card.querySelector('.dmsg'); if (!msg) return;
    Array.prototype.forEach.call(card.querySelectorAll('button.dbtn'), function (b) {
      b.addEventListener('click', function () { msg.textContent = ''; window.setTimeout(function () { msg.textContent = TEXT; }, 30); });
    });
  });
})();

/* ORVUM public page — Section 01 shows three decisions in tabs (owner brief, 9 Nov 2026): showroom, deliveries, in-season.
   Panels B and C are hidden in the markup, so without JavaScript the showroom decision is shown.
   Left and right arrows, Home and End move between tabs. */
(function () {
  'use strict';
  var list = document.querySelector('.dtabs'); if (!list) return;
  var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
  var select = function (t, focus) {
    tabs.forEach(function (x) {
      var on = x === t, p = document.getElementById(x.getAttribute('aria-controls'));
      x.setAttribute('aria-selected', String(on)); x.tabIndex = on ? 0 : -1;
      if (p) p.hidden = !on;
    });
    if (focus) t.focus();
  };
  list.addEventListener('click', function (e) { var t = e.target.closest('[role="tab"]'); if (t) select(t); });
  list.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var n = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (n === undefined) return;
    e.preventDefault(); select(tabs[(n + tabs.length) % tabs.length], true);
  });
})();

/* ORVUM public page — the hero's "Explore a retail decision" buttons scroll this page to Section 01 (owner brief, 9 Nov 2026). */
(function () {
  'use strict';
  var frame = document.getElementById('hero'), target = document.getElementById('decision');
  if (!frame || !target) return;
  var hook = function () {
    var d; try { d = frame.contentDocument; } catch (err) { return; }
    if (!d || !d.defaultView || d.orvumDecision || !/\/hero(\.html)?$/.test(d.location.pathname)) return;
    d.orvumDecision = true;
    d.defaultView.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('[data-go="decision"]') : null;
      if (!a) return;
      e.preventDefault(); e.stopImmediatePropagation();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, true);
  };
  frame.addEventListener('load', hook);
  hook();
})();

/* ORVUM public page — the request form (owner, 9 Nov 2026): validated here, sent to /api/lead, which stores the request and emails
   the team. The hero's "Contact ORVUM" buttons lead to this form instead of the hero's own contact panel. */
(function () {
  'use strict';
  var form = document.getElementById('lead-form');
  if (form && window.fetch && window.JSON) {
    var status = form.querySelector('.lf-status'), btn = form.querySelector('button[type="submit"]'), started = Date.now();
    var FAIL = 'Sorry, the request could not be sent. Please email truth@orvum.com.';
    var say = function (t, cls) { status.className = 'lf-status' + (cls ? ' ' + cls : ''); status.textContent = t; };
    var val = function (n) { return (form.elements[n] && form.elements[n].value || '').trim(); };
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      ['name', 'email', 'message'].forEach(function (n) {
        var v = val(n), ok = !!v && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) && (n !== 'message' || v.length >= 10);
        form.elements[n].setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (!ok && !bad) bad = form.elements[n];
      });
      if (bad) { say('Please add your name, a valid email address and a short message.', 'err'); bad.focus(); return; }
      btn.disabled = true; say('Sending…');
      fetch('/api/lead', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: val('name'), email: val('email'), company: val('company'), role: val('role'), message: val('message'),
          website: val('website'), elapsed: Date.now() - started, page: location.pathname }) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok && j.ok === true, error: j.error }; }); })
        .then(function (x) {
          if (x.ok) { form.reset(); form.classList.add('sent'); say('Thank you — your request has reached the ORVUM team. We will reply by email.', 'ok'); return; }
          btn.disabled = false;
          say(x.error === 'rate' ? 'Too many requests from this connection. Please try again later or email truth@orvum.com.' : FAIL, 'err');
        })
        .catch(function () { btn.disabled = false; say(FAIL, 'err'); });
    });
  }
  var frame = document.getElementById('hero'), contact = document.getElementById('contact');
  if (!frame || !contact) return;
  var hook = function () {
    var d; try { d = frame.contentDocument; } catch (err) { return; }
    if (!d || !d.defaultView || d.orvumContact || !/\/hero(\.html)?$/.test(d.location.pathname)) return;
    d.orvumContact = true;
    d.defaultView.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('[data-go="contact"]') : null;
      if (!a) return;
      e.preventDefault(); e.stopImmediatePropagation();
      contact.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var first = document.querySelector('#lead-form input[name="name"]');
      if (first) window.setTimeout(function () { first.focus({ preventScroll: true }); }, 700);
    }, true);
  };
  frame.addEventListener('load', hook);
  hook();
})();
