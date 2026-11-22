/* ORVUM public sections. Nothing here changes the production hero; it only hosts it (see /hero.html). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 760px)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ── 04 · Explore ───────────────────────────────────────────────────────────── */
  var FUNCS = [
    { k: 'product', name: 'Product Master', kicker: 'Product identity',
      does: 'Gives every item one canonical identity — style, colour, size, supplier, season and price — shared by every module.',
      decision: 'Which products, variants and sizes you are really buying, holding and selling.',
      connects: ['Buying', 'Receiving', 'Inventory', 'Stores & POS', 'Analytics'],
      benefit: 'Figures that agree across teams, with fewer duplicate items and reconciliation errors.' },
    { k: 'buying', name: 'Buying', kicker: 'Demand and buying capital',
      does: 'Plans the buy by category, brand and size against expected demand and the capital available.',
      decision: 'How much to buy, of what — and how much buying capital to hold back for later in the season.',
      connects: ['Planning', 'Finance', 'Analytics', 'Purchase orders'],
      benefit: 'Buying capital directed to what is likely to sell, and less over-buying of slow lines.' },
    { k: 'po', name: 'Purchase orders', kicker: 'Commitments',
      does: 'Turns approved buying into orders with quantities, prices, delivery windows and payment terms.',
      decision: 'What is committed, to which supplier, and when the cash will be needed.',
      connects: ['Buying', 'Receiving', 'Finance'],
      benefit: 'Every commitment is visible before it becomes a payment.' },
    { k: 'receiving', name: 'Receiving & Delivery Match', kicker: 'Goods in',
      does: 'Matches what arrives against what was ordered — item, size, quantity and price — before stock goes on sale.',
      decision: 'Whether to accept, query or reject a delivery, and which differences to raise with the supplier.',
      connects: ['Purchase orders', 'Inventory', 'Finance'],
      benefit: 'Accurate stock from the first day, and differences caught before the supplier invoice is paid.' },
    { k: 'inventory', name: 'Inventory', kicker: 'Stock truth',
      does: 'Shows stock by store, size and age, and highlights where stock and demand do not match.',
      decision: 'Where stock should be, and which stock needs action before it ages further.',
      connects: ['Stores & POS', 'Planning', 'Pricing', 'Analytics'],
      benefit: 'Better availability of key sizes and earlier action on ageing stock, releasing capital tied up in it.' },
    { k: 'stores', name: 'Stores & POS', kicker: 'Sales and returns',
      does: 'Runs sales, exchanges and returns in store and on mobile POS, connected to stock, customers and staff.',
      decision: 'How to serve, exchange or refund correctly — with the right price and the right stock record.',
      connects: ['Inventory', 'CRM', 'People', 'Finance'],
      benefit: 'Each sale and return updates stock, customer and finance records once, and correctly.' },
    { k: 'crm', name: 'CRM & clienteling', kicker: 'Customer insight',
      does: 'Builds one view of each client — purchases, sizes, preferences and contact consent.',
      decision: 'Which clients to contact about which products, and when.',
      connects: ['Stores & POS', 'Inventory', 'Analytics'],
      benefit: 'Relevant outreach that helps sell current stock at full price and builds loyalty.' },
    { k: 'pricing', name: 'Pricing & markdown', kicker: 'Margin',
      does: 'Tracks margin and sell-through by product and compares the timing and depth of possible markdowns.',
      decision: 'When to hold a price, when to mark down, and by how much.',
      connects: ['Inventory', 'Analytics', 'Finance', 'Planning'],
      benefit: 'Gross margin protected, and stock cleared before it loses most of its value.' },
    { k: 'people', name: 'People', kicker: 'Team, tasks and permissions',
      does: 'Organises the team by store and role, with tasks, targets and permissions.',
      decision: 'Who does what, who may approve what, and where the team needs support.',
      connects: ['Stores & POS', 'AI Agents', 'Finance'],
      benefit: 'Clear accountability and less time lost to manual coordination.' },
    { k: 'planning', name: 'Planning & replenishment', kicker: 'Demand and deliveries',
      does: 'Connects demand, deliveries and replenishment into one plan by store and season.',
      decision: 'What to reorder, move or hold, and when deliveries should arrive.',
      connects: ['Buying', 'Purchase orders', 'Inventory', 'Finance'],
      benefit: 'Fewer missing sizes during the season and less excess stock at its end.' },
    { k: 'finance', name: 'Finance', kicker: 'Commitments and cash',
      does: 'Brings commitments, supplier payments, sales and margin together in one financial view.',
      decision: 'Whether the business can afford the plan — and what to change if it cannot.',
      connects: ['Purchase orders', 'Stores & POS', 'Pricing', 'Planning'],
      benefit: 'Working capital planned ahead, and true profit visible by product, store and season.' },
    { k: 'analytics', name: 'Analytics', kicker: 'Drivers, risks, forecasts',
      does: 'Explains what is driving performance, flags risks early and forecasts likely outcomes — showing the source of every number.',
      decision: 'Where to focus: which store, category, size or client group needs action now.',
      connects: ['All functions'],
      benefit: 'Earlier, evidence-based decisions instead of month-end surprises.' },
    { k: 'agents', name: 'AI Agents', kicker: 'Explain · Recommend · Act with approval',
      does: 'Explain what is happening, recommend options with their consequences, and act only after the responsible person approves.',
      decision: 'Which recommendations to approve, change or reject.',
      connects: ['All functions, within each user’s permissions'],
      benefit: 'Faster decisions without losing control or accountability.' },
    { k: 'brands', name: 'Brand Partners', kicker: 'Shared insights', planned: true,
      does: 'Planned: shares agreed sell-through and stock insights with brand partners, under the retailer’s control.',
      decision: 'Joint planning of replenishment, allocation and the next season’s buy.',
      connects: ['Buying', 'Inventory', 'Analytics'],
      benefit: 'Buying better aligned with brands, while the retailer decides what is shared.' }
  ];

  var list = $('#ex-list'), panel = $('#ex-panel');
  if (list && panel) {
    list.innerHTML = FUNCS.map(function (f, i) {
      return '<button type="button" class="ex-tab" role="tab" id="ex-t-' + f.k + '" aria-controls="ex-panel" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-i="' + i + '">' +
        '<span>' + esc(f.name) + (f.planned ? ' <span class="st">Planned</span>' : '') + '</span><span class="chev" aria-hidden="true">›</span></button>';
    }).join('');
    var tabs = $$('.ex-tab', list);
    var render = function (f) {
      panel.setAttribute('aria-labelledby', 'ex-t-' + f.k);
      panel.innerHTML =
        '<p class="px">' + esc(f.kicker) + '</p>' +
        '<h3>' + esc(f.name) + (f.planned ? '<span class="planned">Planned</span>' : '') + '</h3>' +
        '<p class="pdo">' + esc(f.does) + '</p>' +
        '<dl>' +
          '<div><dt>Decision it improves</dt><dd>' + esc(f.decision) + '</dd></div>' +
          '<div><dt>Designed benefit</dt><dd>' + esc(f.benefit) + '</dd></div>' +
          '<div><dt>Connects to</dt><dd class="conn">' + f.connects.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</dd></div>' +
        '</dl>';
    };
    var place = function (tab) {
      // desktop: the panel sits in the right column; mobile: directly under the selected function
      if (narrow.matches) { if (tab.nextElementSibling !== panel) tab.insertAdjacentElement('afterend', panel); }
      else if (panel.parentNode !== list.parentNode || panel.previousElementSibling !== list) list.insertAdjacentElement('afterend', panel);
    };
    var select = function (i, opts) {
      opts = opts || {};
      var tab = tabs[i];
      tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(j === i)); t.tabIndex = j === i ? 0 : -1; });
      render(FUNCS[i]); place(tab);
      if (opts.focus) tab.focus({ preventScroll: true });
      var behavior = reduce.matches ? 'auto' : 'smooth';
      if (narrow.matches && opts.user) {
        window.requestAnimationFrame(function () { tab.scrollIntoView({ block: 'start', behavior: behavior }); });
      } else if (opts.user) {
        var r = panel.getBoundingClientRect();
        if (r.top < 60 || r.bottom > window.innerHeight) panel.scrollIntoView({ block: 'nearest', behavior: behavior });
      }
    };
    list.addEventListener('click', function (e) { var t = e.target.closest('.ex-tab'); if (t) select(+t.dataset.i, { user: true }); });
    list.addEventListener('keydown', function (e) {
      var t = e.target.closest('.ex-tab'); if (!t) return; var i = +t.dataset.i, n = tabs.length, j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0; else if (e.key === 'End') j = n - 1;
      if (j === null) return; e.preventDefault(); select(j, { focus: true, user: true });
    });
    var onMq = function () { var cur = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); place(tabs[cur < 0 ? 0 : cur]); };
    if (narrow.addEventListener) narrow.addEventListener('change', onMq); else narrow.addListener(onMq);
    select(0);
  }

  /* ── 05 · Scenario ──────────────────────────────────────────────────────────── */
  var OPTS = {
    clients: { what: 'Contact the clients whose sizes and taste match the ageing stock, before any price change.',
      cash: 'No new commitment.', gp: 'Supports full-price sales of current stock — only if clients respond.',
      stock: 'Can reduce ageing stock where demand exists.', wc: 'Released as the stock sells.' },
    transfer: { what: 'Move stock to the stores where its sizes are missing. A transfer moves stock; it does not create profit on its own.',
      cash: 'A small handling and transport cost.', gp: 'Can protect full-price sales where the size is missing and demand exists.',
      stock: 'Rebalanced between stores — not reduced unless it sells.', wc: 'Unchanged until the transferred stock sells.' },
    markdown: { what: 'Compare marking down now with holding the price for a few more weeks.',
      cash: 'Earlier cash from clearance.', gp: 'Lower margin per unit, weighed against the risk of deeper markdowns later.',
      stock: 'Reduced, at a lower price.', wc: 'Released sooner.' },
    buying: { what: 'Reduce or reschedule open orders for the next collection, within the supplier terms.',
      cash: 'Lower or later supplier payments.', gp: 'Limits next season’s over-buying; cutting too far risks missed demand.',
      stock: 'Less carry-over risk next season.', wc: 'Fewer commitments ahead of sales.' }
  };
  var opts = $('#opts');
  if (opts) {
    var obtns = $$('button', opts);
    var setOpt = function (b, focus) {
      obtns.forEach(function (x) { var on = x === b; x.setAttribute('aria-checked', String(on)); x.tabIndex = on ? 0 : -1; });
      var o = OPTS[b.dataset.o];
      $('#o-what').textContent = o.what;
      $$('#cons dd').forEach(function (dd) { dd.textContent = o[dd.dataset.c]; });
      if (focus) b.focus();
    };
    opts.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) setOpt(b); });
    opts.addEventListener('keydown', function (e) {
      var i = obtns.indexOf(document.activeElement); if (i < 0) return; var n = obtns.length, j = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') j = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      if (j === null) return; e.preventDefault(); setOpt(obtns[j], true);
    });
    setOpt(obtns[0]);
  }

  /* ── Section navigation ─────────────────────────────────────────────────────── */
  var nav = $('#pnav'), toggle = $('.pnav-toggle'), heroBox = $('.hero-frame');
  var setOpen = function (open) { nav.dataset.open = String(open); toggle.setAttribute('aria-expanded', String(open)); };
  var navSync = function () {
    var shown = window.scrollY > heroBox.offsetHeight - 64;
    if ((nav.dataset.state === 'shown') !== shown) { nav.dataset.state = shown ? 'shown' : 'hidden'; if (!shown) setOpen(false); }
  };
  if (nav && heroBox) { window.addEventListener('scroll', navSync, { passive: true }); window.addEventListener('resize', navSync); navSync(); }
  if (nav && heroBox && 'IntersectionObserver' in window) {
    var links = $$('.pnav-links a');
    var secs = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var io2 = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (!e.isIntersecting) return; links.forEach(function (a) { a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + e.target.id)); }); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { io2.observe(s); });
  }
  if (toggle) toggle.addEventListener('click', function () { setOpen(nav.dataset.open !== 'true'); });
  $$('.pnav-links a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav && nav.dataset.open === 'true') { setOpen(false); toggle.focus(); } });

  if (/[?&]contact\b/.test(location.search)) {
    var c = document.getElementById('contact');
    if (c) window.addEventListener('load', function () { c.scrollIntoView({ behavior: 'auto' }); });
  }

  /* ── Hosting the production hero ────────────────────────────────────────────── */
  var frame = document.getElementById('hero');
  if (frame) {
    // translated pages host their own hero (/de/hero, …): keep the frame's own path
    if (/[?&](?:locked|expired|signed-out)\b/.test(location.search)) frame.src = (frame.getAttribute('src') || '/hero').split('?')[0] + location.search;
    frame.addEventListener('load', function () {
      var w;
      try { w = frame.contentWindow; var p = w.location.pathname; } catch (err) {
        // the hero navigated to another origin (the private demo): continue there at the top level
        window.location.href = 'https://demo.orvum.com/app/#/core'; return;
      }
      if (!/^\/(?:[a-z]{2}\/)?hero(?:\.html)?$/.test(p)) { window.location.href = w.location.href; return; }   // e.g. Privacy
      // Wheel and touch scrolling chain from the hero to this page natively, so nothing is forwarded (avoids double scrolling).
    });
  }
})();
