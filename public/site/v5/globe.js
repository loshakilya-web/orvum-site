/* ORVUM prototype · the Intelligence Core globe. This is the founder-selected website globe (Direction A, from
   baseline/direction-a/stage.js) with three additions for the private demo: mood states, pause/resume, LOOK 'A' default.
   ORVUM · Connected business scene. A glass world of retail on a lit platform in a night store; the business
   modules (HTML cards) gather around it and the world answers them.
   window.CONN: project(), ack(dx, dy, s), impact(dx, dy), setShift(px), pulse(), arrive(), skip(), step(), manual.
   Reactions (all restrained, all tied to a module):
   - idle: slow internal warmth moving under the surface, a quiet heartbeat, the land breathing;
   - ack: the glass and the land facing a hovered module warm up;
   - impact: a signal from a selected module arrives; a ring runs over the land from that side, the glass and
     ribbons answer once, then everything settles;
   - setShift: the camera glides aside so the decision can stand next to the world, not on top of it. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('stage');
  const root = document.documentElement;
  const noop = () => {};
  const CONN = (window.CONN = { ok: false, project: () => null, ack: noop, impact: noop, setShift: noop, pulse: noop, step: noop, arrive: noop, skip: noop, manual: false, t: 99, clock: 0, onFrame: null, quality: 'none' });
  if (!window.THREE) { root.classList.add('no-gl'); return; }
  // ask for WebGL quietly first, so a browser without it gets the still image and no console error
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) { root.classList.add('no-gl'); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); } catch { root.classList.add('no-gl'); return; }
  if (!renderer.getContext()) { root.classList.add('no-gl'); return; }
  CONN.ok = true; CONN.quality = 'high'; root.classList.add('gl');
  const low = (navigator.deviceMemory && navigator.deviceMemory <= 4) || innerWidth < 700;
  let ratio = Math.min(low ? 1.5 : 2, devicePixelRatio || 1), mirror = true;
  renderer.setPixelRatio(ratio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputEncoding = THREE.sRGBEncoding; renderer.autoClear = false;
  // if the GPU drops the context, fall back to the still image and keep the page usable
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault(); CONN.ok = false; CONN.lost = true; root.classList.remove('gl'); root.classList.add('no-gl');
    dispatchEvent(new Event('conn-lost'));
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 300);
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
  const V3 = THREE.Vector3;
  const ORANGE = lin(0xfc5609);
  const LOOK = window.CONN_LOOK == null ? 'A' : window.CONN_LOOK;   // '' = the current night store; 'A' = keynote stage; 'B' = keynote stage with retail architecture

  /* environment the metal reflects: a night store with warm lamps and cool silver panels */
  const env = LOOK ? (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#1b1a19'); sky.addColorStop(.5, '#0d0c0c'); sky.addColorStop(1, '#040404');
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    const soft = (x, y, r, col) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); };
    soft(512, 20, 300, 'rgba(236,233,228,.30)');     // one wide platinum softbox overhead
    soft(170, 210, 150, 'rgba(226,229,234,.13)'); soft(860, 200, 160, 'rgba(232,235,240,.15)');   // two quiet silver side panels
    soft(512, 470, 230, 'rgba(252,120,50,.10)');     // a low warm reflection from the stage
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding;
    const pm = new THREE.PMREMGenerator(renderer); const e = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose(); return e;
  })() : (() => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    const sky = g.createLinearGradient(0, 0, 0, 512); sky.addColorStop(0, '#1d1915'); sky.addColorStop(.5, '#0e0c0b'); sky.addColorStop(1, '#040404');
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    for (const [x, w, a, col] of [[120, 40, .8, '#ffd9b0'], [200, 18, .6, '#ffe6c8'], [560, 26, .7, '#eef2f8'], [600, 10, .5, '#ffffff'], [700, 90, .35, '#9fb6ff'], [880, 44, .55, '#e3e9f2'], [430, 160, .28, '#ffb070']]) { g.globalAlpha = a; g.fillStyle = col; g.fillRect(x, 60, w, 260); }
    g.globalAlpha = .55; g.fillStyle = '#f4efe8'; g.fillRect(300, 12, 420, 30);   // a long soft ceiling light
    g.globalAlpha = 1;
    const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.encoding = THREE.sRGBEncoding;
    const pm = new THREE.PMREMGenerator(renderer); const e = pm.fromEquirectangular(t).texture; t.dispose(); pm.dispose(); return e;
  })();
  scene.environment = env;
  const radial = (stops) => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([o, s]) => r.addColorStop(o, s)); g.fillStyle = r; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); };
  const soft = radial([[0, 'rgba(255,255,255,1)'], [.3, 'rgba(255,255,255,.4)'], [1, 'rgba(255,255,255,0)']]);

  const U = {
    uTime: { value: 0 }, uMirror: { value: 0 }, uFlare: { value: 0 }, uReveal: { value: 1 }, uRings: { value: 1 }, uGlass: { value: 1 },
    uHeart: { value: 0 }, uAck: { value: 0 }, uAckDir: { value: new V3(1, 0, 0.3).normalize() },
    uImp: { value: 99 }, uImpDir: { value: new V3(1, 0, 0.3).normalize() },
  };
  const world = new THREE.Group(); scene.add(world);

  /* ── the night store around it ── */
  const hall = new THREE.Group(); world.add(hall);
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(80, 30), new THREE.MeshStandardMaterial({ color: lin(LOOK ? 0x121110 : 0x1a1612), roughness: 0.75, metalness: 0.15 }));
  backWall.position.set(0, 15, -16); hall.add(backWall);
  const wash = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: lin(0x6a4a34), transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  wash.scale.set(30, 16, 1); wash.position.set(0, 5.5, -15); hall.add(wash);   // warm light on the back wall: the world stands out from the room
  const strips = [];
  const colTex = radial([[0, 'rgba(255,255,255,1)'], [.25, 'rgba(255,255,255,.5)'], [1, 'rgba(255,255,255,0)']]);
  for (const [x, z, h, w, o, col] of [[-12.5, -12, 13, 1.6, .75, 0xffc89a], [-9.4, -14, 12, 1.1, .55, 0xffd6b0], [-15.5, -9, 14, 2.0, .6, 0xffc89a], [7.5, -14.5, 12, 1.0, .45, 0xe8eef8], [9.6, -13.5, 12, 0.5, .5, 0xffffff]]) {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: colTex, color: lin(col), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    m.scale.set(w, h, 1); m.position.set(x, h / 2 - 0.5, z); hall.add(m); strips.push(m);
  }
  for (let i = 0; i < 4; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: colTex, color: lin(0xffe0bc), transparent: true, opacity: .42, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.scale.set(4.5, 0.14, 1); m.position.set(-12.2, 2.0 + i * 1.7, -10.5); hall.add(m); strips.push(m); }
  const city = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 640; const g = c.getContext('2d');
    const s = g.createLinearGradient(0, 0, 0, 640); s.addColorStop(0, '#0e1426'); s.addColorStop(.62, '#2e2636'); s.addColorStop(.74, '#8a5434'); s.addColorStop(.8, '#1c1411'); s.addColorStop(1, '#070606');
    g.fillStyle = s; g.fillRect(0, 0, 512, 640);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 520; i++) { const x = rnd() * 512, y = 470 + Math.pow(rnd(), 1.6) * 150, r = 0.6 + rnd() * 1.8; g.fillStyle = rnd() < 0.7 ? `rgba(255,${170 + rnd() * 60 | 0},110,${.4 + rnd() * .6})` : `rgba(190,210,255,${.3 + rnd() * .5})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  })();
  const win = new THREE.Mesh(new THREE.PlaneGeometry(9, 11.25), new THREE.MeshBasicMaterial({ map: city, toneMapped: false, transparent: true, opacity: 1 }));
  win.position.set(12.5, 5.6, -11.5); win.rotation.y = -0.45; hall.add(win);
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 11.4, 0.14), new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: .85, roughness: .3 })); f.position.set(12.5 + Math.cos(0.45) * (-4.5 + i * 3), 5.6, -11.5 + Math.sin(0.45) * (-4.5 + i * 3)); hall.add(f); }

  if (LOOK) {
    // the keynote stage: no lamps, columns or window; graphite, a platinum ambient from above, a gentle horizon
    for (const ch of hall.children) if (ch !== backWall && ch !== wash) ch.visible = false;
    wash.material.color.set(lin(0x5f5b57)); wash.scale.set(36, 18, 1); wash.position.set(0, 6.2, -15);
    const add = (col, o, sx, sy, x, y, z) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: lin(col), transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false })); m.scale.set(sx, sy, 1); m.position.set(x, y, z); hall.add(m); strips.push(m); return m; };
    add(0x8f8a84, 0.20, 44, 12, 0, 13.5, -15.5);      // platinum light falling from above
    add(0xa49e96, 0.16, 70, 2.4, 0, 1.15, -15.6);     // the horizon: a soft band where floor meets wall
    add(0xfc5609, 0.07, 15, 2.6, 0, 0.35, -6.5);      // restrained warm reflection behind the pedestal
    if (LOOK === 'B') {
      // retail architecture, abstracted: a quiet rhythm of store bays with shelf lines, one thread of light connecting them
      const c = document.createElement('canvas'); c.width = 2048; c.height = 768; const g = c.getContext('2d');
      const bays = 11, bw = 2048 / bays;
      for (let i = 0; i < bays; i++) {
        const x = i * bw + bw * 0.14, w = bw * 0.72, top = 170 + (i % 2) * 22, bottom = 700;
        g.strokeStyle = 'rgba(214,206,196,.10)'; g.lineWidth = 2; g.strokeRect(x, top, w, bottom - top);
        g.strokeStyle = 'rgba(214,206,196,.055)'; g.lineWidth = 1.5;
        for (let k = 1; k <= 4; k++) { const y = top + (bottom - top) * (0.22 + k * 0.15); g.beginPath(); g.moveTo(x + 10, y); g.lineTo(x + w - 10, y); g.stroke(); }
        if (i === 3 || i === 7) { const gr = g.createLinearGradient(0, top, 0, bottom); gr.addColorStop(0, 'rgba(252,140,70,.0)'); gr.addColorStop(1, 'rgba(252,140,70,.07)'); g.fillStyle = gr; g.fillRect(x + 2, top + 2, w - 4, bottom - top - 4); }
      }
      g.strokeStyle = 'rgba(252,110,40,.16)'; g.lineWidth = 1.5; g.setLineDash([2, 10]); g.beginPath(); g.moveTo(0, 150); g.lineTo(2048, 150); g.stroke();
      const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
      const arch = new THREE.Mesh(new THREE.PlaneGeometry(64, 24), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 1, depthWrite: false, toneMapped: false }));
      arch.position.set(0, 11.2, -15.8); hall.add(arch); strips.push(arch);
    }
  }
  /* ── the platform: brushed graphite with silver edges ── */
  const metal = new THREE.MeshStandardMaterial({ color: lin(0x1c1c1e), metalness: 0.9, roughness: 0.22, envMapIntensity: 1.6 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(4.1, 4.22, 0.32, 128), metal); base.position.y = 0.16; world.add(base);
  const step = new THREE.Mesh(new THREE.CylinderGeometry(2.9, 2.98, 0.24, 128), metal); step.position.y = 0.32 + 0.12; world.add(step);
  const edgeMat = (o, c = ORANGE) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
  const edgeTop = new THREE.Mesh(new THREE.TorusGeometry(2.9, 0.012, 6, 200), edgeMat(.9)); edgeTop.rotation.x = Math.PI / 2; edgeTop.position.y = 0.56; world.add(edgeTop);
  const edgeBase = new THREE.Mesh(new THREE.TorusGeometry(4.1, 0.01, 6, 200), edgeMat(.5)); edgeBase.rotation.x = Math.PI / 2; edgeBase.position.y = 0.325; world.add(edgeBase);
  const edgeSilver = new THREE.Mesh(new THREE.TorusGeometry(4.16, 0.008, 6, 200), edgeMat(.35, lin(0xdfe6f0))); edgeSilver.rotation.x = Math.PI / 2; edgeSilver.position.y = 0.0; world.add(edgeSilver);
  const ringMat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec2 vP; uniform float uTime, uFlare, uRings, uMirror, uImp, uHeart;
      void main(){
        float r = length(vP);
        float rings = 0.0;
        for (int i = 0; i < 6; i++) { float rr = 0.7 + float(i) * 0.4; rings += exp(-pow((r - rr) / 0.012, 2.0)) * (0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.1 - rr * 2.4))); }
        float wave = exp(-pow((r - mod(uTime * 0.9, 3.4)) / 0.25, 2.0)) * 0.22;
        float hit = exp(-pow((r - uImp * 3.2) / 0.22, 2.0)) * exp(-uImp * 1.6) * 1.2;      // the answer runs out over the platform
        float pool = exp(-r * r * 0.9) * (0.45 + uHeart * 0.25);
        float reveal = smoothstep(uRings * 3.0 + 0.2, uRings * 3.0 - 0.4, r);
        float a = (rings * 0.6 + wave + hit + pool * (1.0 + uFlare)) * reveal * smoothstep(2.88, 2.5, r);
        gl_FragColor = vec4(vec3(0.99, 0.42, 0.10) * a * (1.0 - uMirror * 0.6), 1.0);
      }`,
  });
  const rings = new THREE.Mesh(new THREE.CircleGeometry(2.88, 96), ringMat); rings.rotation.x = -Math.PI / 2; rings.position.y = 0.565; world.add(rings);

  /* ── the globe ── */
  const globe = new THREE.Group(); globe.position.set(0, 2.6, 0); world.add(globe);
  const R = 1.5;
  const tilt = new THREE.Group(); tilt.rotation.set(0.32, 0, -0.18); globe.add(tilt);
  const spin = new THREE.Group(); tilt.add(spin);
  // graphite core with silver reflections; warmth moves slowly under its surface
  const coreMat = new THREE.MeshPhysicalMaterial({ color: lin(0x17140f), metalness: 0.75, roughness: LOOK ? 0.52 : 0.34, clearcoat: LOOK ? 0.5 : 0.8, clearcoatRoughness: LOOK ? 0.5 : 0.22, envMapIntensity: LOOK ? 0.95 : 1.15 });
  coreMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uTime: U.uTime, uHeart: U.uHeart, uImp: U.uImp, uFlare: U.uFlare });
    sh.vertexShader = 'varying vec3 vObj;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vObj = position;');
    sh.fragmentShader = 'varying vec3 vObj;\nuniform float uTime, uHeart, uImp, uFlare;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      vec3 q = normalize(vObj);
      float bands = pow(0.5 + 0.5 * sin(q.y * 7.0 + sin(q.x * 3.0 + uTime * 0.35) * 1.6 - uTime * 0.45), 14.0);
      float deep = 0.035 + 0.04 * uHeart + 0.06 * uFlare + 0.2 * exp(-uImp * 2.2);
      totalEmissiveRadiance += vec3(0.99, 0.36, 0.08) * (bands * (0.08 + 0.1 * exp(-uImp * 1.5)) + deep * (0.4 + 0.6 * (0.5 + 0.5 * q.y)));`);
  };
  const core = new THREE.Mesh(new THREE.SphereGeometry(R * 0.95, 96, 64), coreMat); spin.add(core);
  // land as points of light
  const L = window.LAND || []; const n = L.length / 2;
  const pos = new Float32Array(n * 3), rnd = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lon = L[i * 2] * Math.PI / 180, lat = L[i * 2 + 1] * Math.PI / 180, r = R * 0.965;
    pos[i * 3] = r * Math.cos(lat) * Math.sin(lon); pos[i * 3 + 1] = r * Math.sin(lat); pos[i * 3 + 2] = r * Math.cos(lat) * Math.cos(lon);
    rnd[i] = Math.abs(Math.sin(i * 12.9898 + L[i * 2] * 78.233) * 43758.5453) % 1;
  }
  const dg = new THREE.BufferGeometry(); dg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); dg.setAttribute('aR', new THREE.BufferAttribute(rnd, 1));
  const dotMat = new THREE.ShaderMaterial({
    uniforms: Object.assign({ uScale: { value: 1 } }, U), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aR; uniform float uTime, uScale, uReveal, uFlare, uHeart, uAck, uImp; uniform vec3 uAckDir, uImpDir; varying float vA; varying float vHot;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec3 nrm = normalize(normalMatrix * position);
        float facing = clamp(dot(nrm, normalize(-mv.xyz)), 0.0, 1.0);
        float lat = position.y / 1.45;
        float th = -1.25 + uReveal * 2.7; float rev = smoothstep(th + 0.25, th, lat + aR * 0.12);
        float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aR * 1.4) + aR * 40.0);
        float ack = pow(max(dot(nrm, uAckDir), 0.0), 3.0) * uAck;                         // the side facing a hovered module warms
        float ang = acos(clamp(dot(nrm, uImpDir), -1.0, 1.0));
        float ring = exp(-pow((ang - uImp * 2.6) * 5.0, 2.0)) * exp(-uImp * 1.1);         // a ring runs over the land from where the signal arrived
        vHot = max(step(0.93, aR) * (0.6 + 0.4 * sin(uTime * 2.0 + aR * 30.0)), ring);
        vA = (0.12 + 1.5 * pow(facing, 0.8)) * rev * (0.6 + 0.4 * tw) * (1.0 + uFlare * 0.5 + uHeart * 0.25 + ack * 1.4 + ring * 2.2);
        gl_PointSize = (2.3 + vHot * 2.0 + ack * 0.8) * uScale * (14.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying float vA; varying float vHot; uniform float uMirror;
      void main(){ vec2 c = gl_PointCoord - 0.5; float d = length(c); if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d) * vA;
        vec3 col = mix(vec3(1.0, 0.55, 0.22), vec3(1.0, 0.88, 0.70), clamp(vHot, 0.0, 1.0));
        gl_FragColor = vec4(col * a * (1.0 - uMirror * 0.7), 1.0); }`,
  });
  const dots = new THREE.Points(dg, dotMat); spin.add(dots);
  // atmosphere and glass: silver reflections, warm where a module is speaking to it
  const fres = (inner, outer, power, k) => new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: inner ? THREE.BackSide : THREE.FrontSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
    fragmentShader: `varying vec3 vN; varying vec3 vV; uniform float uTime, uFlare, uGlass, uMirror, uAck, uImp, uHeart; uniform vec3 uAckDir, uImpDir;
      void main(){
        vec3 nn = normalize(vN);
        float f = pow(1.0 - abs(dot(nn, vV)), ${power.toFixed(1)});
        vec3 r = reflect(-vV, nn);
        float streak = smoothstep(0.86, 1.0, sin(r.y * 6.0 + r.x * 2.0) * 0.5 + 0.5) * 0.25 + smoothstep(0.97, 1.0, dot(r, normalize(vec3(-0.5, 0.6, 0.6)))) * 0.9 + smoothstep(0.985, 1.0, dot(r, normalize(vec3(0.6, 0.5, 0.4)))) * 0.5;
        vec3 warm = vec3(1.0, 0.5, 0.18), silver = vec3(0.9, 0.94, 1.0), white = vec3(1.0, 0.95, 0.9);
        float ack = pow(max(dot(nn, uAckDir), 0.0), 4.0) * uAck;
        float hit = pow(max(dot(nn, uImpDir), 0.0), 3.0) * exp(-uImp * 2.0);
        vec3 col = ${outer
          ? 'mix(silver, warm, 0.25) * f * 0.6 + white * streak * 0.55 + warm * (ack * 0.55 + hit * 1.1) * f'
          : 'warm * f * (0.55 + uFlare * 0.6 + uHeart * 0.2 + ack * 0.6 + hit * 1.2)'};
        gl_FragColor = vec4(col * uGlass * ${k.toFixed(2)} * (1.0 - uMirror * 0.6), 1.0);
      }`,
  });
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.04, 96, 64), fres(true, false, 2.6, 0.95)); globe.add(atmo);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 96, 64), fres(false, true, 3.0, 1.1)); globe.add(shell);

  /* ── glass ribbons ── */
  function ribbon(Rr, width, twist, phase) {
    const N = 260, posA = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N * Math.PI * 2;
      const c = new V3(Math.cos(u) * Rr, Math.sin(u * 2 + phase) * 0.22, Math.sin(u) * Rr);
      const radialV = new V3(Math.cos(u), 0, Math.sin(u)), up = new V3(0, 1, 0);
      const a = Math.sin(u * twist + phase) * 0.9;
      const dir = up.clone().multiplyScalar(Math.cos(a)).add(radialV.multiplyScalar(Math.sin(a)));
      const w = width * (0.35 + 0.65 * Math.pow(Math.sin(u * 1.0 + phase) * 0.5 + 0.5, 0.8));
      const p0 = c.clone().addScaledVector(dir, -w / 2), p1 = c.clone().addScaledVector(dir, w / 2);
      posA.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z); uv.push(i / N, 0, i / N, 1);
      if (i < N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(posA, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uTime, uGlass, uFlare, uMirror, uImp;
        void main(){
          float e = abs(vUv.y - 0.5) * 2.0;
          float edge = smoothstep(0.78, 1.0, e);
          float f = pow(1.0 - abs(dot(normalize(vN), vV)), 2.0);
          float run = 0.5 + 0.5 * sin(vUv.x * 18.0 - uTime * 0.8);
          float answer = exp(-pow((fract(vUv.x - uImp * 0.55) - 0.5) * 6.0, 2.0)) * exp(-uImp * 1.4);   // one light runs round each ribbon after a signal arrives
          vec3 silver = vec3(0.92, 0.95, 1.0), warm = vec3(1.0, 0.45, 0.12);
          vec3 col = silver * (edge * 0.6 + f * 0.14) + warm * (edge * 0.35 * run + f * 0.08) * (1.0 + uFlare) + warm * edge * answer * 1.6;
          gl_FragColor = vec4(col * uGlass * (1.0 - uMirror * 0.65), 1.0);
        }`,
    });
    return new THREE.Mesh(g, m);
  }
  const ribs = [
    { m: ribbon(2.05, 0.42, 3, 0.4), rx: 0.55, rz: -0.35, sp: 0.16 },
    { m: ribbon(2.3, 0.26, 2, 2.1), rx: -0.4, rz: 0.5, sp: -0.11 },
    { m: ribbon(1.85, 0.6, 1, 4.0), rx: 1.2, rz: 0.15, sp: 0.07 },
  ];
  ribs.forEach((r) => { const holder = new THREE.Group(); holder.rotation.set(r.rx, 0, r.rz); holder.add(r.m); globe.add(holder); r.h = holder; });
  const beam = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: lin(0xff7a2a), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: .55 }));
  beam.scale.set(3.0, 1.8, 1); beam.position.set(0, 0.9, 0.4); world.add(beam);
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: lin(0xfc5609), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, opacity: .18 }));
  glow.scale.set(7.5, 7.5, 1); glow.position.set(0, 2.6, -1.6); world.add(glow);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshBasicMaterial({ color: lin(0x060606), transparent: true, opacity: 0.78, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.renderOrder = -1; scene.add(floor);
  const hemi = new THREE.HemisphereLight(0xfff0e0, 0x0a0806, 0.6); scene.add(hemi);
  const key = new THREE.DirectionalLight(0xffe8d0, 1.15); key.position.set(-6, 10, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0xdfe8ff, 1.0); rim.position.set(7, 8, -8); scene.add(rim);    // silver rim: the world separates from the room
  const warm = new THREE.PointLight(ORANGE, 2.2, 6, 2); warm.position.set(0, 1.3, 0); world.add(warm);

  // the globe, its platform and its light move together; the room and the camera stay still,
  // so nothing in the page (the logo above all) seems to drift against a sliding background
  const stageG = new THREE.Group(); world.add(stageG);
  for (const ch of [...world.children]) if (ch !== hall && ch !== stageG) { world.remove(ch); stageG.add(ch); }

  /* ── interaction ── */
  let flare = 0, nx = 0, ny = 0, ackT = 0, ack = 0, imp = 99, heart = 0, nextBeat = 5;
  const ackDir = new V3(1, 0, 0.3).normalize(), impDir = new V3(1, 0, 0.3).normalize();
  const dirFrom = (dx, dy, v) => v.set(dx, -dy, 0.45).normalize();
  CONN.ack = (dx, dy, s = 1) => { if (dx != null) dirFrom(dx, dy, ackDir); ackT = s; kick(); };
  CONN.impact = (dx, dy) => { dirFrom(dx, dy, impDir); imp = 0; flare = Math.max(flare, 0.9); tight = 1; kick(); };
  CONN.pulse = () => { flare = Math.max(flare, 0.35); kick(); };
  CONN.pointer = (x, y) => { nx = x; ny = y; kick(); };
  // Intelligence Core states (prototype): quiet · attentive · listening · thinking · responding · alert · celebration · calm.
  // Each is a restrained change to reactions the globe already has; none adds a new effect. Reduced motion: no movement.
  let mood = 'quiet', moodAt = 0, spinMul = 1;
  CONN.mood = (m) => { mood = m; moodAt = time; if (m === 'responding') { dirFrom(0.25, -0.15, impDir); imp = 0; flare = Math.max(flare, 0.6); } if (m === 'alert') flare = Math.max(flare, 0.55); if (m === 'celebration') flare = Math.max(flare, 0.9); kick(); };
  CONN.getMood = () => mood;
  CONN.paused = false;
  CONN.pause = (p) => { CONN.paused = !!p; if (!p) kick(); };
  // the camera glides aside by a number of screen pixels (a critically damped spring: no overshoot, no snap)
  let shiftT = 0, shift = 0, shiftV = 0, tight = 0;
  CONN.setShift = (px) => { shiftT = px; kick(); };
  let clock = 0, arriveAt = null;
  CONN.arrive = (from = 0) => { arriveAt = clock - from; kick(); };
  CONN.skip = () => { if (arriveAt !== null && clock - arriveAt < 4.6) arriveAt = clock - 4.6; kick(); };

  let narrow = false;
  // framing (ORVUM app addition): the page may name the free band between its header and its lists (setFrame). When the
  // world would not fit there (laptop screens), the camera steps back and aims lower so the whole globe and pedestal sit
  // centred in that band; otherwise the original framing is kept unchanged. The website never calls it.
  const TAN14 = Math.tan(THREE.MathUtils.degToRad(14));
  let camD = 17.5, camLook = 2.3, frame = null;
  function fitFrame() {
    camD = 17.5; camLook = 2.3;
    if (!frame || narrow || !(frame.bottom - frame.top > 120)) return;
    const target = (frame.top + frame.bottom) / 2, span = frame.bottom - frame.top;
    const probe = new THREE.PerspectiveCamera(28, innerWidth / innerHeight, 0.1, 300);
    const extent = () => {
      probe.position.set(0, camLook + 1.2 * camD / 17.5, camD); probe.lookAt(0, camLook, 0); probe.updateMatrixWorld(); probe.updateProjectionMatrix();
      const py = (v) => (-v.project(probe).y * 0.5 + 0.5) * innerHeight;
      return [py(new V3(0, 2.6 + R * 1.62, 0)), py(new V3(0, 0, 4.25))];   // top of the orbit ribs; front edge of the pedestal
    };
    let [t, b] = extent();
    if (t >= frame.top && b <= frame.bottom) return;   // it already fits: keep the original framing
    for (let i = 0; i < 4; i++) {
      camD = Math.min(17.5 * 1.7, Math.max(17.5, camD * (b - t) / span));
      [t, b] = extent(); camLook -= ((t + b) / 2 - target) * 2 * camD * TAN14 / innerHeight; [t, b] = extent();
    }
  }
  CONN.setFrame = (top, bottom) => { frame = Number.isFinite(top) && Number.isFinite(bottom) ? { top, bottom } : null; fitFrame(); kick(); };
  function layout() { narrow = innerWidth < 1100; renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); fitFrame(); kick(); }
  addEventListener('resize', layout);
  const tmp = new V3();
  CONN.project = () => {
    globe.getWorldPosition(tmp); const c = tmp.clone().project(camera);
    const e = tmp.clone().add(new V3(R * 1.12, 0, 0)).project(camera);
    const x = (c.x * 0.5 + 0.5) * innerWidth, y = (-c.y * 0.5 + 0.5) * innerHeight;
    return { x, y, r: Math.abs((e.x * 0.5 + 0.5) * innerWidth - x) };
  };

  // slow devices (ORVUM demo addition, 6 Nov 2026: Safari reported slow): after the arrival, keep measuring in windows of
  // 60 frames. Below ~45 fps: drop the reflection pass and the pixel ratio, and mark the page `gl-lite` so the glass
  // panels over the globe stop re-blurring it every frame. Still below ~33 fps: draw the globe at most 30 times a second.
  // Fast devices keep the full picture; the look of a frame does not change otherwise.
  // (a paused stage or a hidden tab stops the loop and restarts its timer, so a pause never counts as a slow frame)
  let perfN = 0, perfSum = 0, frameCap = 0, measuredFor = 0;
  // lite keeps a dense screen sharp: at 1:1 on a 3× phone the background turned coarse and shimmered behind thin text
  function lite() { mirror = false; ratio = Math.min(ratio, (devicePixelRatio || 1) >= 2 ? 1.5 : 1); renderer.setPixelRatio(ratio); layout(); document.documentElement.classList.add('gl-lite'); }
  function adapt(dtReal) {
    if (CONN.manual || CONN.quality === 'low') return;
    measuredFor += dtReal; if (measuredFor < 3) return;       // the first 3 s (loading, first frames) are not measured
    perfN++; perfSum += Math.min(dtReal, 0.25);
    if (perfN < 60 && perfSum < 2) return;                    // decide after 60 frames or 2 s, whichever comes first
    const avg = perfSum / perfN; perfN = 0; perfSum = 0;
    if (CONN.quality === 'high' || CONN.quality === 'checked') { if (avg > 0.022) { lite(); CONN.quality = 'reduced'; } else CONN.quality = 'checked'; }
    else if (CONN.quality === 'reduced' && avg > 0.030) { frameCap = 1 / 30; CONN.quality = 'low'; }
  }

  let running = false, last = 0, time = 0, spinA = 0, ribA = [0, 0, 0], ry = 0, rx = 0, sinceDraw = 0;
  function kick() { if (CONN.manual || running || !CONN.ok || CONN.paused) return; running = true; last = performance.now(); requestAnimationFrame(loop); }
  function loop(now) {
    if (CONN.manual || !CONN.ok || CONN.paused) { running = false; return; }
    const real = Math.max(0, (now - last) / 1000); last = now;
    sinceDraw += real;
    if (frameCap && sinceDraw < frameCap - 0.004) { if (!document.hidden) requestAnimationFrame(loop); else running = false; return; }
    advance(Math.min(0.25, sinceDraw)); adapt(sinceDraw); sinceDraw = 0;
    if (!document.hidden) requestAnimationFrame(loop); else running = false;
  }
  CONN.step = (dt, draw = true) => advance(dt, draw);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function advance(dt, draw = true) {
    if (!CONN.ok) return;
    clock += dt; time += reduced ? 0 : dt; CONN.clock = clock;
    const at = arriveAt !== null ? clock - arriveAt : 99; CONN.t = at;
    const A = reduced ? 99 : at;
    const hallOn = sm(0.1, 2.0, A), ringsOn = sm(0.15, 1.2, A), reveal = sm(0.5, 1.8, A), glass = sm(0.9, 2.0, A);
    U.uRings.value = ringsOn; U.uReveal.value = reveal; U.uGlass.value = glass; U.uTime.value = time;
    // reactions
    flare += (0 - flare) * (1 - Math.pow(0.25, dt));
    ack += (ackT - ack) * (1 - Math.pow(0.004, dt));
    imp = Math.min(99, imp + dt);
    tight += (0 - tight) * (1 - Math.pow(0.05, dt));
    if (!reduced && time > nextBeat) { nextBeat = time + 5.5; }
    if (!reduced) {   // mood: gentle floors and tempo on the existing reactions
      const mt = time - moodAt;
      if (mood === 'listening') { flare = Math.max(flare, 0.18 + 0.12 * (0.5 + 0.5 * Math.sin(time * 4.2))); ackT = 0.55; ackDir.set(0, 0, 1); }
      else if (mood === 'thinking') { flare = Math.max(flare, 0.22 + 0.08 * Math.sin(time * 7)); }
      else if (mood === 'attentive') { ackT = 0.45; }
      else if (mood === 'alert') { flare = Math.max(flare, 0.3 + 0.2 * (0.5 + 0.5 * Math.sin(time * 3))); if (mt > 4) mood = 'calm'; }
      else if (mood === 'celebration') { flare = Math.max(flare, 0.5 * Math.max(0, 1 - mt / 5)); if (mt > 5) mood = 'calm'; }
      else if (mood === 'responding' && mt > 2.2) mood = 'calm';
      else if (mood === 'calm' && mt > 3) { mood = 'quiet'; ackT = 0; }
      const target = mood === 'thinking' ? 2.2 : mood === 'celebration' ? 1.6 : 1; spinMul += (target - spinMul) * (1 - Math.pow(0.1, dt));
    }
    const beatP = reduced ? 0 : Math.max(0, 1 - Math.abs((time - (nextBeat - 5.5)) - 0.6) / 0.6);
    heart = beatP * beatP * (3 - 2 * beatP);
    U.uFlare.value = flare + (A > 1.6 && A < 3.0 ? Math.sin((A - 1.6) / 1.4 * Math.PI) * 0.6 : 0);
    U.uAck.value = ack; U.uAckDir.value.copy(ackDir); U.uImp.value = imp; U.uImpDir.value.copy(impDir); U.uHeart.value = heart;
    strips.forEach((s) => { s.material.opacity = (s.userData.o ??= s.material.opacity) * hallOn; });
    wash.material.opacity = (LOOK ? 0.42 : 0.55) * hallOn; win.material.opacity = hallOn;
    edgeTop.material.opacity = (0.9 + 0.1 * heart) * ringsOn; edgeBase.material.opacity = 0.5 * ringsOn; edgeSilver.material.opacity = 0.35 * hallOn;
    beam.material.opacity = (0.45 + flare * 0.25 + heart * 0.08) * ringsOn; glow.material.opacity = (0.17 + flare * 0.12 + ack * 0.05) * glass;
    warm.intensity = (1.8 + flare * 1.6 + heart * 0.4) * ringsOn; key.intensity = (LOOK ? 0.8 : 1.15) * hallOn; rim.intensity = (LOOK ? 0.8 : 1.0) * hallOn; hemi.intensity = 0.6 * hallOn;
    renderer.toneMappingExposure = 0.3 + 1.12 * sm(0, 1.5, A);
    // motion: one slow turn; the arrival spins the ribbons into place; a module turns the world a little towards it
    const spinUp = 1 + 5 * (1 - sm(0.9, 3.0, A));
    spinA += dt * (0.08 + flare * 0.04) * (reduced ? 0 : 1);
    spin.rotation.y = spinA + 1.9;
    ribs.forEach((r, i) => { ribA[i] += dt * r.sp * spinUp * spinMul * (1 + flare * 0.6) * (reduced ? 0 : 1); r.m.rotation.y = ribA[i]; r.h.scale.setScalar((0.85 + 0.15 * glass) * (1 - 0.05 * tight)); });
    const k = 1 - Math.pow(0.05, dt);
    ry += ((ackDir.x * 0.28 * ack + nx * 0.08) - ry) * k; rx += ((-ackDir.y * 0.12 * ack + ny * 0.04) - rx) * k;
    globe.rotation.set(rx, ry, 0);
    globe.position.y = 2.6 + (reduced ? 0 : Math.sin(time * 0.8) * 0.04);
    dotMat.uniforms.uScale.value = renderer.getPixelRatio() * (narrow ? 1.8 : (innerHeight / 900) * 1.4 * (17.5 / camD));
    // camera: the decision gets the room it needs; the spring keeps the move physical
    if (reduced) { shift = shiftT; shiftV = 0; } else { const w = 7.0, nSub = Math.max(1, Math.ceil(dt / 0.008)), h = dt / nSub; for (let i = 0; i < nSub; i++) { const acc = w * w * (shiftT - shift) - 2 * w * shiftV; shiftV += acc * h; shift += shiftV * h; } if (!isFinite(shift)) { shift = shiftT; shiftV = 0; } }
    if (narrow) { camera.position.set(0, 2.3, 44); camera.lookAt(0, -3.56, 0); }
    else {
      const upp = 2 * camD * TAN14 / innerHeight;
      const f = Math.min(1, Math.abs(shift) / 260);
      stageG.position.x = shift * upp; stageG.scale.setScalar(1 - 0.04 * f);
      camera.position.set(nx * 0.12 * (1 - f), camLook + 1.2 * camD / 17.5 - ny * 0.05 * (1 - f), camD);
      camera.lookAt(0, camLook, 0);
    }
    if (!draw) { if (CONN.onFrame) CONN.onFrame(at, clock); return; }
    renderer.setClearColor(lin(0x060606)); renderer.clear();
    if (mirror) {
      floor.visible = false; world.scale.y = -1; U.uMirror.value = 1; world.updateMatrixWorld(true);
      renderer.render(scene, camera);
      floor.visible = true; world.scale.y = 1; U.uMirror.value = 0; world.updateMatrixWorld(true);
      renderer.clearDepth();
    } else floor.material.opacity = 1;
    renderer.render(scene, camera);
    if (CONN.onFrame) CONN.onFrame(at, clock);
  }
  CONN._lose = () => { const e = renderer.getContext().getExtension('WEBGL_lose_context'); if (e) e.loseContext(); };
  layout();
})();
