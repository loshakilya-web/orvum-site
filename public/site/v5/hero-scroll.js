/* ORVUM public page — phones and tablets (< 1100 px).
   The hero is a full-screen frame whose content is taller than the screen. When it scrolled inside its frame,
   iOS kept the finger in the frame at its end (Brand Partners) and the page below could not be reached.
   Now only this page scrolls: the hero frame stays on screen (sticky) and its content follows this page's scroll. */
(function () {
  'use strict';
  var box = document.querySelector('.hero-frame'), frame = document.getElementById('hero');
  if (!box || !frame || !window.matchMedia) return;
  var mq = window.matchMedia('(max-width: 1099px)');
  var on = false, max = 0, lastSet = 0, ro = null;
  var screenH = window.CSS && CSS.supports && CSS.supports('height', '100svh') ? '100svh' : '100vh';

  function doc() { try { var d = frame.contentDocument; return d && d.documentElement && d.body ? d : null; } catch (e) { return null; } }
  function scroller(d) { return d.scrollingElement || d.documentElement; }
  // this page has smooth scrolling for its links; moves made here must be instant
  function jump(y) { var h = document.documentElement, b = h.style.scrollBehavior; h.style.scrollBehavior = 'auto'; window.scrollTo(0, y); h.style.scrollBehavior = b; }

  // this page's scroll → the hero's scroll
  function follow() {
    var d = doc(); if (!d || !on) return;
    var s = scroller(d), y = Math.min(Math.max(window.scrollY - box.offsetTop, 0), max);
    if (Math.abs(s.scrollTop - y) >= 1) s.scrollTop = y;
    lastSet = s.scrollTop;
  }
  // the hero moved by itself (focus, keyboard): move this page with it
  function heroMoved() {
    var d = doc(); if (!d || !on) return;
    var t = scroller(d).scrollTop;
    if (Math.abs(t - lastSet) < 2) return;
    lastSet = t; jump(box.offsetTop + t);
  }
  // the hero's height decides how long the frame stays on screen
  function measure() {
    var d = doc(); if (!d || !on) return;
    var oldH = box.offsetHeight, oldBottom = box.offsetTop + oldH;
    max = Math.max(0, scroller(d).scrollHeight - frame.clientHeight);
    var h = frame.clientHeight + max;
    if (Math.abs(h - oldH) >= 1) {
      var below = window.scrollY >= oldBottom - 1;   // reading the sections under the hero: keep the place
      box.style.height = h + 'px';
      if (below) jump(window.scrollY + h - oldH);
    }
    follow();
  }
  function setup() {
    var d = doc(); if (!d) return;
    if (ro) { ro.disconnect(); ro = null; }
    on = mq.matches;
    d.documentElement.classList.toggle('orvum-hosted', on);
    if (on) {
      frame.setAttribute('scrolling', 'no');
      frame.style.position = 'sticky'; frame.style.top = '0'; frame.style.height = screenH;
      document.documentElement.style.overflowAnchor = 'none';
      if (!d.orvumHosted) { d.orvumHosted = true; d.defaultView.addEventListener('scroll', heroMoved, { passive: true }); }
      var RO = d.defaultView.ResizeObserver || window.ResizeObserver;
      if (RO) { ro = new RO(measure); ro.observe(d.body); }
      measure();
    } else {
      frame.removeAttribute('scrolling');
      frame.style.position = ''; frame.style.top = ''; frame.style.height = '';
      box.style.height = ''; document.documentElement.style.overflowAnchor = '';
    }
  }
  window.addEventListener('scroll', follow, { passive: true });
  window.addEventListener('resize', setup);
  if (mq.addEventListener) mq.addEventListener('change', setup); else if (mq.addListener) mq.addListener(setup);
  frame.addEventListener('load', setup);
  setup();
})();

/* ORVUM public page — all screen sizes (9 Nov 2026). The hero's globe drew every frame even when the hero was scrolled
   out of view: measured 60 frames a second while reading the sections below, and slower scrolling there.
   It now pauses while the hero frame is off screen and resumes when the hero comes back into view. */
(function () {
  'use strict';
  var frame = document.getElementById('hero');
  if (!frame || !window.IntersectionObserver) return;
  var visible = true;
  function apply() {
    var w; try { w = frame.contentWindow; } catch (e) { return; }
    if (w && w.CONN && typeof w.CONN.pause === 'function' && !!w.CONN.paused === visible) w.CONN.pause(!visible);
  }
  new IntersectionObserver(function (es) { visible = es[es.length - 1].isIntersecting; apply(); }).observe(frame);
  frame.addEventListener('load', apply);
})();
