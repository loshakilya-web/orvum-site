/* Inner pages: the header is always shown; the menu button opens the links on small screens. */
(function () {
  'use strict';
  var nav = document.getElementById('pnav'); if (!nav) return;
  var toggle = nav.querySelector('.pnav-toggle');
  function setOpen(open) { nav.dataset.open = String(open); if (toggle) toggle.setAttribute('aria-expanded', String(open)); }
  if (toggle) toggle.addEventListener('click', function () { setOpen(nav.dataset.open !== 'true'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.dataset.open === 'true') { setOpen(false); if (toggle) toggle.focus(); } });
})();
