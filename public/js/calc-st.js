/* Sell-through calculator (Site Brief #2). Runs only in the browser: nothing entered is sent or stored.
   Available = beginning + received; A = sold ÷ received; B = sold ÷ available (when beginning > 0);
   On hand = available − sold; weekly pace = sold ÷ weeks; weeks of supply = on hand ÷ weekly pace. */
(function () {
  'use strict';
  var root = document.getElementById('st');
  if (!root) return;
  var form = root.querySelector('form');
  var out = root.querySelector('.calc-out');
  var tracked = false;

  function val(name) { var el = form.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : null; }
  function setErr(input, msg) {
    var id = input.id + '-err', e = document.getElementById(id);
    if (msg) {
      if (!e) { e = document.createElement('p'); e.className = 'ferr'; e.id = id; input.insertAdjacentElement('afterend', e); }
      e.textContent = msg; input.setAttribute('aria-invalid', 'true'); input.setAttribute('aria-describedby', id);
    } else if (e) { e.remove(); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
  }
  // required: '' is an error; optional: '' → null. Units: whole numbers; value: up to two decimals.
  function read(id, required, positive) {
    var input = document.getElementById(id), raw = input.value.trim().replace(/[\s,]/g, ''), units = val('unit') === 'units';
    if (raw === '') { if (required) { setErr(input, 'Enter a value.'); return { bad: true }; } setErr(input, null); return { n: null }; }
    var ok = units ? /^\d+$/.test(raw) : /^\d+(\.\d{1,2})?$/.test(raw);
    if (!ok) { setErr(input, units ? 'Use a whole number of 0 or more.' : 'Use a number of 0 or more, with at most two decimals.'); return { bad: true }; }
    var n = parseFloat(raw);
    if (positive && n <= 0) { setErr(input, 'Weeks must be more than 0.'); return { bad: true }; }
    setErr(input, null); return { n: n };
  }
  function pct(x) { return (Math.round(x * 1000) / 10).toFixed(1) + '%'; }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function num(x) { return val('unit') === 'units' ? Math.round(x).toLocaleString('en-GB') : x.toLocaleString('en-GB', { maximumFractionDigits: 2 }); }

  function setUnit() {
    var units = val('unit') === 'units';
    root.querySelector('[data-basis]').hidden = units;
    root.querySelectorAll('[data-u]').forEach(function (s) { s.textContent = units ? 'units' : 'value'; });
  }
  form.addEventListener('change', function (e) { if (e.target.name === 'unit') setUnit(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var rec = read('st-rec', true), sold = read('st-sold', true), beg = read('st-beg', false), wk = read('st-wk', false, true);
    if (rec.bad || sold.bad || beg.bad || wk.bad) { out.innerHTML = '<p class="calc-msg">Check the highlighted fields.</p>'; return; }
    var b = beg.n || 0, available = b + rec.n;
    if (sold.n > available) {
      out.innerHTML = '<p class="calc-msg err">Units sold exceed units available — check returns, transfers or the beginning inventory.</p>';
      return;
    }
    var onHand = available - sold.n, rows = [];
    rows.push(['Sell-through on received', rec.n > 0 ? pct(sold.n / rec.n) : 'Not available: nothing was received', true]);
    if (b > 0) rows.push(['Sell-through on everything available', available > 0 ? pct(sold.n / available) : '—']);
    rows.push(['On hand', num(onHand)]);
    if (wk.n !== null) {
      var pace = sold.n / wk.n;
      rows.push(['Average weekly sales', one(pace)]);
      rows.push(['Weeks of supply', sold.n === 0 ? 'No sales yet' : one(onHand / pace)]);
    }
    var basis = val('unit') === 'units' ? 'units' : (val('basis') === 'cost' ? 'value at cost' : 'value at original retail');
    out.innerHTML = '<dl class="calc-r">' + rows.map(function (r) { return '<div' + (r[2] ? ' class="main"' : '') + '><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' +
      '<p class="calc-msg">Measured in ' + basis + '.</p>';
    if (!tracked && window.va) { tracked = true; window.va('event', { name: 'calculator_used', calculator: 'sell-through' }); }
  });

  root.classList.add('ready');
  setUnit();
})();
