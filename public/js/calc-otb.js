/* Open-to-buy calculator (Site Brief #2). Runs only in the browser: nothing entered is sent or stored.
   Planned purchases = planned sales + planned reductions + planned EOP inventory − BOP inventory
   Open-to-buy       = planned purchases − on order                                                */
(function () {
  'use strict';
  var root = document.getElementById('otb');
  if (!root) return;
  var SYM = { EUR: '€', USD: '$', GBP: '£' };
  var FIELDS = [
    ['sales', 'Planned sales'],
    ['red', 'Planned reductions'],
    ['eop', 'Planned end-of-period inventory'],
    ['bop', 'Beginning-of-period inventory'],
    ['oo', 'On order for the period'],
  ];
  var form = root.querySelector('form');
  var out = root.querySelector('.calc-out');
  var copyBtn = root.querySelector('[data-copy]');
  var seasonBox = root.querySelector('[data-season]');
  var singleBox = root.querySelector('[data-single]');
  var monthsSel = root.querySelector('#otb-months');
  var tracked = false;
  var lastText = '';

  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; }
  function sym() { return SYM[form.querySelector('#otb-cur').value] || '€'; }
  function fmt(n) { return sym() + Math.round(Math.abs(n)).toLocaleString('en-GB'); }

  // "1 234,5" / "100,000" / "100000.25" → number; '' or invalid → error text
  function read(input) {
    var raw = input.value.trim().replace(/[\s,]/g, '');
    if (raw === '') return { err: 'Enter a value (0 if there is none).' };
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) return { err: 'Use a number of 0 or more, with at most two decimals.' };
    return { n: parseFloat(raw) };
  }
  function setErr(input, msg) {
    var id = input.id + '-err', e = document.getElementById(id);
    if (msg) {
      if (!e) { e = document.createElement('p'); e.className = 'ferr'; e.id = id; input.insertAdjacentElement('afterend', e); }
      e.textContent = msg; input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id);
    } else if (e) { e.remove(); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
  }

  function buildSeason() {
    var n = +monthsSel.value, html = '';
    for (var m = 1; m <= n; m++) {
      html += '<fieldset class="month"><legend>Month ' + m + '</legend><div class="grid">';
      FIELDS.forEach(function (f) {
        var id = 'otb-m' + m + '-' + f[0];
        var auto = f[0] === 'bop' && m > 1;
        html += '<label for="' + id + '">' + f[1] + (auto ? ' <span class="hint">(= end of month ' + (m - 1) + ', editable)</span>' : '') + '</label>' +
          '<input id="' + id + '" data-m="' + m + '" data-f="' + f[0] + '" inputmode="decimal" autocomplete="off"' + (auto ? ' data-auto="1"' : '') + '>';
      });
      html += '</div></fieldset>';
    }
    var keep = {};
    seasonBox.querySelectorAll('input').forEach(function (i) { keep[i.id] = { v: i.value, auto: i.dataset.auto }; });
    seasonBox.innerHTML = html;
    seasonBox.querySelectorAll('input').forEach(function (i) {
      if (keep[i.id]) { i.value = keep[i.id].v; if (keep[i.id].auto === undefined) delete i.dataset.auto; }
    });
    syncBop();
  }
  // BOP of month N+1 follows EOP of month N until the user types into it
  function syncBop() {
    var n = +monthsSel.value;
    for (var m = 2; m <= n; m++) {
      var bop = document.getElementById('otb-m' + m + '-bop'), eop = document.getElementById('otb-m' + (m - 1) + '-eop');
      if (bop && eop && bop.dataset.auto) bop.value = eop.value;
    }
  }
  seasonBox.addEventListener('input', function (e) {
    var i = e.target;
    if (i.dataset.f === 'bop') delete i.dataset.auto;
    if (i.dataset.f === 'eop') syncBop();
  });

  function setMode() {
    var season = val('mode') === 'season';
    seasonBox.hidden = !season; singleBox.hidden = season;
    root.querySelector('[data-months]').hidden = !season;
    if (season && !seasonBox.children.length) buildSeason();
  }
  form.addEventListener('change', function (e) {
    if (e.target.name === 'mode') setMode();
    if (e.target === monthsSel) buildSeason();
    if (e.target.name === 'basis') root.querySelectorAll('[data-basis]').forEach(function (s) { s.textContent = e.target.value === 'cost' ? 'at cost' : 'at retail'; });
  });

  function calcPeriod(get) {
    var ok = true, v = {};
    FIELDS.forEach(function (f) { var inp = get(f[0]); var r = read(inp); setErr(inp, r.err); if (r.err) ok = false; else v[f[0]] = r.n; });
    if (!ok) return null;
    var pp = v.sales + v.red + v.eop - v.bop;
    return { pp: pp, oo: v.oo, otb: pp - v.oo };
  }
  function line(label, res) {
    return res.otb < 0 ? label + 'Over-bought by ' + fmt(res.otb) : label + 'Open-to-buy ' + fmt(res.otb);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var basis = val('basis') === 'cost' ? 'at cost' : 'at retail', rows = [], text = [];
    if (val('mode') === 'season') {
      var n = +monthsSel.value, total = 0, all = true;
      for (var m = 1; m <= n; m++) {
        var r = calcPeriod(function (f) { return document.getElementById('otb-m' + m + '-' + f); });
        if (!r) { all = false; continue; }
        total += r.otb; rows.push([m, r]);
      }
      if (!all) { out.innerHTML = '<p class="calc-msg">Check the highlighted fields.</p>'; copyBtn.hidden = true; return; }
      var h = '<table class="calc-t"><caption>Open-to-buy by month (' + basis + ')</caption><thead><tr><th scope="col">Month</th><th scope="col">Planned purchases</th><th scope="col">On order</th><th scope="col">Open-to-buy</th></tr></thead><tbody>';
      rows.forEach(function (x) {
        var r = x[1];
        h += '<tr><th scope="row">Month ' + x[0] + '</th><td>' + (r.pp < 0 ? '−' : '') + fmt(r.pp) + '</td><td>' + fmt(r.oo) + '</td><td class="' + (r.otb < 0 ? 'neg' : '') + '">' + (r.otb < 0 ? 'Over-bought by ' + fmt(r.otb) : fmt(r.otb)) + '</td></tr>';
        text.push('Month ' + x[0] + ': planned purchases ' + (r.pp < 0 ? '−' : '') + fmt(r.pp) + ', on order ' + fmt(r.oo) + ', ' + line('', r).toLowerCase());
      });
      h += '</tbody><tfoot><tr><th scope="row">Season</th><td></td><td></td><td class="' + (total < 0 ? 'neg' : '') + '">' + (total < 0 ? 'Over-bought by ' + fmt(total) : fmt(total)) + '</td></tr></tfoot></table>';
      out.innerHTML = h;
      text.push('Season total: ' + (total < 0 ? 'over-bought by ' + fmt(total) : 'open-to-buy ' + fmt(total)));
    } else {
      var r1 = calcPeriod(function (f) { return document.getElementById('otb-' + f); });
      if (!r1) { out.innerHTML = '<p class="calc-msg">Check the highlighted fields.</p>'; copyBtn.hidden = true; return; }
      out.innerHTML = '<dl class="calc-r">' +
        '<div><dt>Planned purchases</dt><dd>' + (r1.pp < 0 ? '−' : '') + fmt(r1.pp) + '</dd></div>' +
        '<div><dt>On order</dt><dd>' + fmt(r1.oo) + '</dd></div>' +
        '<div class="main' + (r1.otb < 0 ? ' neg' : '') + '"><dt>' + (r1.otb < 0 ? 'Over-bought' : 'Open-to-buy') + '</dt><dd>' + (r1.otb < 0 ? 'Over-bought by ' + fmt(r1.otb) : fmt(r1.otb)) + '</dd></div></dl>' +
        (r1.otb < 0 ? '<p class="calc-msg">Orders already placed exceed the plan for this period. Options: delay or cancel orders, revisit the sales plan only if it is realistic, or accept a higher closing stock.</p>' : '');
      text.push('Planned purchases ' + (r1.pp < 0 ? '−' : '') + fmt(r1.pp) + '; on order ' + fmt(r1.oo) + '; ' + line('', r1).toLowerCase());
    }
    lastText = 'Open-to-buy (' + basis + ')\n' + text.join('\n') + '\nCalculated with the ORVUM open-to-buy calculator — figures are your own inputs.';
    copyBtn.hidden = false;
    if (!tracked && window.va) { tracked = true; window.va('event', { name: 'calculator_used', calculator: 'open-to-buy' }); }
  });

  copyBtn.addEventListener('click', function () {
    if (!lastText || !navigator.clipboard) return;
    navigator.clipboard.writeText(lastText).then(function () { copyBtn.textContent = 'Copied'; setTimeout(function () { copyBtn.textContent = 'Copy result'; }, 1600); });
  });

  root.classList.add('ready');
  setMode();
})();
