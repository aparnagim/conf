/* ===== Boot Loader Logic + Network Lines Background ===== */
(function(){
  const boot = document.getElementById('boot');
  if (!boot) return;

  const pctEl = document.getElementById('boot-pct');
  const barEl = document.getElementById('boot-bar');
  const statusEl = document.getElementById('boot-status');

  let prog = 0, done = false;
  const statuses = [
    "Initializing LEARN Experience…",
    "Loading assets…",
    "Warming up modules…",
    "Connecting services…",
    "Almost ready…"
  ];
  let si = 0;

  function tick() {
    if (done) return;
    const target = 92;
    prog += (target - prog) * 0.06 + 0.18;
    if (prog > target) prog = target;
    render(prog);
    if (Math.random() < .05 && si < statuses.length-1) statusEl.textContent = statuses[++si];
    requestAnimationFrame(tick);
  }
  function render(p){
    const val = Math.max(0, Math.min(100, p|0));
    pctEl.textContent = val;
    barEl.style.width = val + '%';
  }
  function finish(){
    if (done) return;
    done = true;
    let val = prog|0;
    const iv = setInterval(()=>{
      val += 1;
      render(val);
      if (val >= 100){
        clearInterval(iv);
        boot.classList.add('fade-out');
        setTimeout(()=>boot.remove(), 650);
      }
    }, 22);
  }
  window.addEventListener('load', finish);
  setTimeout(finish, 9000);
  tick();

  // Animated network lines
  const canvas = document.getElementById('boot-net');
  const ctx = canvas.getContext('2d');
  let w, h, dpr;

  function resize(){
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    initNodes();
  }
  window.addEventListener('resize', resize, {passive:true});

  let nodes = [];
  function initNodes(){
    const count = Math.floor((w*h) / 22000);
    nodes = Array.from({length: count}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      vx: (Math.random()-.5)*0.16,
      vy: (Math.random()-.5)*0.16,
      r: 1 + Math.random()*1.8
    }));
  }

  function step(){
    ctx.clearRect(0,0,w,h);

    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#cbe0ff';
    const grid = 42;
    ctx.beginPath();
    for(let x=0;x<w;x+=grid){ ctx.moveTo(x,0); ctx.lineTo(x,h); }
    for(let y=0;y<h;y+=grid){ ctx.moveTo(0,y); ctx.lineTo(w,y); }
    ctx.stroke();

    const maxDist = 120;
    for (let i=0;i<nodes.length;i++){
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x< -20) a.x=w+20; if (a.x>w+20) a.x=-20;
      if (a.y< -20) a.y=h+20; if (a.y>h+20) a.y=-20;

      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'rgba(51,225,198,.9)';
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI*2); ctx.fill();

      for (let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < maxDist){
          const alpha = 1 - (dist / maxDist);
          ctx.globalAlpha = alpha * 0.5;
          const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
          grad.addColorStop(0, '#b60144');
          grad.addColorStop(1, '#06b6d4');
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  resize(); step();
})();

/* ===== Ambient Background Dots (parallax) ===== */
(function(){
  const c = document.getElementById('bg-dots');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w,h,dpr, dots=[];

  function resize(){
    dpr = Math.max(1, window.devicePixelRatio||1);
    w = c.clientWidth; h = c.clientHeight;
    c.width = w*dpr; c.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    dots = Array.from({length: Math.floor(w*h/22000)}, ()=>({
      x: Math.random()*w,
      y: Math.random()*h,
      r: Math.random()*2 + .4,
      s: Math.random()*0.3 + 0.05
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(173,216,255,.12)';
    dots.forEach(d=>{
      d.y += d.s;
      if (d.y > h) d.y = -10;
      ctx.beginPath(); ctx.arc(d.x,d.y,d.r,0,Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize(); step();
})();

/* ===== Drawer ===== */
const burger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
if (burger && drawer){
  burger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    drawer.style.display = open ? 'block' : 'none';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>{
    drawer.style.display='none'; drawer.classList.remove('open')
  }));
}

/* ===== Tabs + animated underline ===== */
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tabpane');
const underline = document.getElementById('tab-underline');
function moveUnderline(btn){
  const r = btn.getBoundingClientRect();
  const pr = btn.parentElement.getBoundingClientRect();
  underline.style.left = (r.left - pr.left) + 'px';
  underline.style.width = r.width + 'px';
}
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));
  t.classList.add('active');
  const id = t.dataset.target;
  document.getElementById(id)?.classList.add('active');
  moveUnderline(t);
}));
if (tabs[0]) moveUnderline(tabs[0]);

/* ===== Smooth scroll ===== */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({behavior:'smooth', block:'start'});
});

/* ===== Countdown (Colombo) ===== */
/* ===== Countdown (Colombo) – supports all .countdown elements ===== */
(function(){
  const target = new Date('2025-10-23T03:30:00Z');
  const els = Array.from(document.querySelectorAll('.countdown')); // <- all
  if (!els.length) return;
  const pad = (n)=>String(n).padStart(2,'0');
  function tick(){
    const now = new Date();
    let ms = target - now;
    const label = (ms <= 0)
      ? 'Event is live!'
      : (()=> {
          const d = Math.floor(ms/86400000); ms%=86400000;
          const h = Math.floor(ms/3600000);  ms%=3600000;
          const m = Math.floor(ms/60000);    ms%=60000;
          const s = Math.floor(ms/1000);
          return `Starts in ${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
        })();
    els.forEach(el => el.textContent = label);
    setTimeout(tick, 1000);
  }
  tick();
})();


/* ===== Parallax tilt on hero art ===== */
const art = document.querySelector('.hero-art');
if (art){
  art.addEventListener('mousemove', (e)=>{
    const b = art.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5;
    const y = (e.clientY - b.top) / b.height - .5;
    art.style.transform = `rotateX(${y*-6}deg) rotateY(${x*6}deg)`;
  });
  art.addEventListener('mouseleave', ()=> art.style.transform = 'rotateX(0) rotateY(0)');
}

/* ===== Counter-up KPIs when visible ===== */
function countUp(el, to){
  const start = 0;
  const dur = 1000 + Math.min(1500, to*10);
  const t0 = performance.now();
  function step(t){
    const p = Math.min(1, (t - t0)/dur);
    el.textContent = Math.floor(start + (to-start)*p);
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ===== Scroll reveal (enter + exit) ===== */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    const el = ent.target;
    if (ent.isIntersecting){
      // entering viewport
      el.classList.add('visible');
      el.classList.remove('leaving');

      // start KPI count-up when any .kpis enters
      if (el.classList.contains('kpis')){
        el.querySelectorAll('strong').forEach(s=>{
          const to = parseInt(s.dataset.count, 10) || 0;
          // prevent recount if already done
          if (!s.dataset._counted){
            s.dataset._counted = '1';
            countUp(s, to);
          }
        });
      }
    } else {
      // leaving viewport – only apply fade-out when it scrolls upward out
      const rect = ent.boundingClientRect;
      if (rect.top < 0){
        el.classList.add('leaving');
        el.classList.remove('visible');
      }
    }
  });
}, {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px'
});

// observe all revealables including the metrics block
document
  .querySelectorAll('.reveal,.reveal-up,.pop,.anim-metrics,.kpis')
  .forEach(el => io.observe(el));


/* ===== Page load state ===== */
window.addEventListener('load', ()=>{
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
  document.querySelector('.preloader')?.classList.add('done');
  document.querySelector('.hero h1.stagger')?.classList.add('ready');
});

/* ===== Optional: URL param for registration link (?reg=) ===== */
const params = new URLSearchParams(location.search);
const reg = params.get('reg');
if (reg) document.getElementById('regLink')?.setAttribute('href', reg);

/* ===== Scroll progress bar (header) ===== */
(function(){
  const bar = document.getElementById('scrollbar');
  if (!bar) return;
  function onScroll(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = Math.max(0, Math.min(1, window.scrollY / max));
    bar.style.width = (pct*100) + '%';
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
})();

/* ===== Metrics: Network Hub + Packets animation ===== */
(function(){
  const canvas = document.getElementById('metrics-net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w=0,h=0,dpr=1, nodes=[], edges=[], packets=[];
  const GRID=42;

  function resize(){
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    setup();
  }
  window.addEventListener('resize', resize, {passive:true});

  function setup(){
    // make a center "hub" and satellites
    const cx = w*0.5, cy = h*0.5;
    const radius = Math.min(w,h)*0.26;

    nodes = [{x:cx, y:cy, r:8, hub:true}];
    for (let i=0;i<10;i++){
      const ang = (i/10)*Math.PI*2 + (i%2?0.18:-0.12);
      const rr = radius * (0.75 + Math.random()*0.5);
      nodes.push({
        x: cx + Math.cos(ang)*rr,
        y: cy + Math.sin(ang)*rr,
        r: 2 + Math.random()*2,
        hub:false
      });
    }

    // connect satellites to hub and a few cross links
    edges = [];
    for (let i=1;i<nodes.length;i++) edges.push([0,i]);
    for (let i=1;i<nodes.length;i++){
      const j = 1 + Math.floor(Math.random()*(nodes.length-1));
      if (j!==i) edges.push([i,j]);
    }

    // spawn packets that move along edges
    packets = [];
    for (let k=0;k<18;k++){
      const e = edges[Math.floor(Math.random()*edges.length)];
      packets.push({
        e, t: Math.random(), speed: 0.0016 + Math.random()*0.0032
      });
    }
  }

  function drawGrid(){
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#cbe0ff';
    ctx.beginPath();
    for(let x=0;x<w;x+=GRID){ ctx.moveTo(x,0); ctx.lineTo(x,h); }
    for(let y=0;y<h;y+=GRID){ ctx.moveTo(0,y); ctx.lineTo(w,y); }
    ctx.stroke();
  }

  function drawHub(){
    const hub = nodes[0];
    // soft glow disc
    const g = ctx.createRadialGradient(hub.x,hub.y,6, hub.x,hub.y,80);
    g.addColorStop(0,'rgba(130, 200, 255, .45)');
    g.addColorStop(1,'rgba(130, 200, 255, 0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(hub.x,hub.y,80,0,Math.PI*2); ctx.fill();

    // inner badge ring (network vibe)
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3;
    let ring = ctx.createLinearGradient(hub.x-40,hub.y-40,hub.x+40,hub.y+40);
    ring.addColorStop(0,'#b60144'); ring.addColorStop(1,'#06b6d4');
    ctx.strokeStyle = ring;
    ctx.beginPath(); ctx.arc(hub.x,hub.y,28,0,Math.PI*2); ctx.stroke();

    // small "node-lines" icon (three dots connected)
    ctx.fillStyle = '#e6f3ff';
    const d = 8;
    ctx.beginPath(); ctx.arc(hub.x-10, hub.y, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hub.x+10, hub.y-6, 2, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(hub.x+6, hub.y+10, 2, 0, Math.PI*2); ctx.fill();
    ctx.globalAlpha = 0.9; ctx.lineWidth = 1.5; ctx.strokeStyle = '#9cc9ff';
    ctx.beginPath(); ctx.moveTo(hub.x-10,hub.y); ctx.lineTo(hub.x+10,hub.y-6); ctx.lineTo(hub.x+6,hub.y+10); ctx.lineTo(hub.x-10,hub.y); ctx.stroke();
  }

  function step(tms){
    ctx.clearRect(0,0,w,h);

    drawGrid();

    // links
    for (const [ai,bi] of edges){
      const a = nodes[ai], b = nodes[bi];
      const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      grad.addColorStop(0,'#b60144');
      grad.addColorStop(1,'#06b6d4');
      // faint cable
      ctx.globalAlpha = 0.12; ctx.lineWidth = 2; ctx.strokeStyle = '#9fb6ff';
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      // colored overlay toward the hub + pulse
      ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.strokeStyle = grad;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }

    // nodes
    for (const n of nodes){
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = n.hub ? 'rgba(180, 230, 255, .95)' : 'rgba(51,225,198,.95)';
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
      if (!n.hub){
        // tiny breathing glow
        ctx.globalAlpha = 0.12;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r+6*Math.abs(Math.sin(Date.now()/1200)),0,Math.PI*2); ctx.strokeStyle='#7ac8ff'; ctx.stroke();
      }
    }

    // packets moving along edges
    for (const p of packets){
      p.t += p.speed;
      if (p.t>1) { p.t = 0; p.e = edges[Math.floor(Math.random()*edges.length)]; }
      const a = nodes[p.e[0]], b = nodes[p.e[1]];
      const x = a.x + (b.x-a.x)*p.t;
      const y = a.y + (b.y-a.y)*p.t;
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill();
      // trailing glow
      ctx.globalAlpha = 0.25;
      ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fillStyle = 'rgba(6,182,212,.35)'; ctx.fill();
    }

    drawHub();

    requestAnimationFrame(step);
  }

  resize(); setup(); step();
})();


/* ===== HERO: Realistic Digital World Globe (with cables + slow beads) ===== */
(function(){
  const canvas = document.getElementById("world-real");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // --- Theme ---
  const CYAN      = "#1ecfff";
  const MAGENTA   = "#ff2d75";
  const GRID_CLR  = "rgba(255,255,255,0.14)";
  const RATIO     = 0.90;         // globe size vs canvas

  // --- Motion (slow & premium) ---
  const ROT_SEC   = 42;           // spin period (seconds per full turn)
  const BEAD_V_MIN= 0.00005;      // bead speed (min)
  const BEAD_V_MAX= 0.00010;      // bead speed (max)

  // --- Densities ---
  const LAND_DOT_CAP      = 3200; // number of dots for continents
  const SURFACE_LINKS     = 260;  // mesh links across land
  const CABLE_COUNT       = 110;  // long cables across globe
  const BEADS_PER_CABLE   = 7;    // moving beads on each cable

  // --- Sizing ---
  let w=0,h=0,dpr=1,cx=0,cy=0,R=0, t0=performance.now();
  function resize(){
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx = w/2; cy = h/2; R = Math.min(w,h)/2 * RATIO;
  }
  window.addEventListener("resize", resize, {passive:true});
  resize();

  // --- Helpers ---
  const toRad = d => d*Math.PI/180;
  const toDeg = r => r*180/Math.PI;

  function ll2xyz(lat, lon){
    const φ = toRad(lat), λ = toRad(lon);
    return { x: Math.cos(φ)*Math.cos(λ), y: Math.sin(φ), z: Math.cos(φ)*Math.sin(λ) };
  }
  function rotY(p, a){ const s=Math.sin(a), c=Math.cos(a); return {x:c*p.x+s*p.z, y:p.y, z:-s*p.x+c*p.z}; }
  function rotX(p, a){ const s=Math.sin(a), c=Math.cos(a); return {x:p.x, y:c*p.y-s*p.z, z:s*p.y+c*p.z}; }
  function project(p){ if (p.z <= 0) return null; return {x: cx+R*p.x, y: cy-R*p.y, z: p.z}; }
  function slerp(a,b,t){
    const d=Math.max(-1,Math.min(1,a.x*b.x+a.y*b.y+a.z*b.z)), th=Math.acos(d);
    if (th<1e-5) return a;
    const s=Math.sin(th), A=Math.sin((1-t)*th)/s, B=Math.sin(t*th)/s;
    return {x:A*a.x+B*b.x, y:A*a.y+B*b.y, z:A*a.z+B*b.z};
  }

  // --- Seed data: cities & filler stars ---
  const cities = [
    {name:'Colombo',       lat:  6.9271, lon:  79.8612},
    {name:'Delhi',         lat: 28.6139, lon:  77.2090},
    {name:'Singapore',     lat:  1.3521, lon: 103.8198},
    {name:'Tokyo',         lat: 35.6762, lon: 139.6503},
    {name:'Sydney',        lat:-33.8688, lon: 151.2093},
    {name:'London',        lat: 51.5074, lon:  -0.1278},
    {name:'Paris',         lat: 48.8566, lon:   2.3522},
    {name:'New York',      lat: 40.7128, lon: -74.0060},
    {name:'San Francisco', lat: 37.7749, lon:-122.4194},
    {name:'Johannesburg',  lat:-26.2041, lon:  28.0473},
    {name:'Dubai',         lat: 25.2048, lon:  55.2708},
    {name:'São Paulo',     lat:-23.5558, lon: -46.6396}
  ];
  const nodes = [
    ...cities,
    ...Array.from({length:150}, ()=>({lat:Math.random()*180-90, lon:Math.random()*360-180}))
  ];

  // --- Continents as dots (TopoJSON sampling) ---
  let landDots=[], landReady=false, surfaceLinks=[];
  fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json')
    .then(r=>r.json())
    .then(topology=>{
      const land = topojson.feature(topology, topology.objects.land);
      const polys = land.type==='MultiPolygon' ? land.coordinates : [land.coordinates];
      landDots = sampleDots(polys);
      surfaceLinks = buildSurfaceLinks(landDots, SURFACE_LINKS);
      landReady = true;
    }).catch(()=>{ landReady=false; });

  function pointInRing(pt, ring){
    let x=pt[0], y=pt[1], inside=false;
    for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const xi=ring[i][0], yi=ring[i][1], xj=ring[j][0], yj=ring[j][1];
      const hit=((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi+1e-12)+xi);
      if(hit) inside=!inside;
    }
    return inside;
  }
  function pointInPolys(pt, polys){
    for(const poly of polys){ if(pointInRing(pt, poly[0])) return true; }
    return false;
  }
  function sampleDots(polys){
    const pts=[];
    for(let lat=-60; lat<=80; lat+=1.6){
      for(let lon=-180; lon<=180; lon+=1.6){
        const P=[lon+(Math.random()-.5)*0.8, lat+(Math.random()-.5)*0.8];
        if(pointInPolys(P, polys)) pts.push({lon:P[0], lat:P[1]});
      }
    }
    for(let lat=-70; lat<=85; lat+=2.4){
      for(let lon=-180; lon<=180; lon+=2.4){
        const P=[lon+(Math.random()-.5)*0.6, lat+(Math.random()-.5)*0.6];
        if(pointInPolys(P, polys)) pts.push({lon:P[0], lat:P[1]});
      }
    }
    return pts.slice(0, LAND_DOT_CAP);
  }
  function geoAngle(A,B){
    const φ1=toRad(A.lat), φ2=toRad(B.lat), Δλ=toRad(B.lon-A.lon);
    const ang=Math.acos(Math.sin(φ1)*Math.sin(φ2)+Math.cos(φ1)*Math.cos(φ2)*Math.cos(Δλ));
    return toDeg(ang);
  }
  function buildSurfaceLinks(dots, count){
    const links=[], N=dots.length;
    for(let i=0;i<count;i++){
      let a=dots[(Math.random()*N)|0], b=dots[(Math.random()*N)|0], tries=0;
      while(tries++<40){
        const d=geoAngle(a,b);
        if(d>12 && d<95) break;
        a=dots[(Math.random()*N)|0]; b=dots[(Math.random()*N)|0];
      }
      links.push([a,b]);
    }
    return links;
  }

  // --- Build great-circle cables & slow beads ---
  function pickFarNodePair(pool){
    let a=pool[(Math.random()*pool.length)|0],
        b=pool[(Math.random()*pool.length)|0],
        tries=0;
    while(tries++<60){
      const φ1=toRad(a.lat), φ2=toRad(b.lat), Δλ=toRad(b.lon-a.lon);
      const ang=Math.acos(Math.sin(φ1)*Math.sin(φ2)+Math.cos(φ1)*Math.cos(φ2)*Math.cos(Δλ));
      if(ang>Math.PI/8) break; // >22.5°
      b=pool[(Math.random()*pool.length)|0];
    }
    return [a,b];
  }
  const cables = Array.from({length:CABLE_COUNT}, ()=>{
    const [A,B] = pickFarNodePair(nodes);
    const beads = Array.from({length:BEADS_PER_CABLE}, ()=>({
      t: Math.random(),
      v: BEAD_V_MIN + Math.random()*(BEAD_V_MAX - BEAD_V_MIN)
    }));
    return {A,B,beads};
  });

  // --- Drawing pieces ---
  function drawGraticule(rot){
    ctx.save();
    ctx.globalAlpha=0.18; ctx.strokeStyle=GRID_CLR; ctx.lineWidth=1.2;
    for(let lat=-60;lat<=60;lat+=30){
      ctx.beginPath(); let started=false;
      for(let lon=-180;lon<=180;lon+=3){
        let p=ll2xyz(lat,lon); p=rotY(p,rot.y); p=rotX(p,rot.x);
        const q=project(p); if(!q){started=false; continue;}
        if(!started){ctx.moveTo(q.x,q.y);started=true;} else ctx.lineTo(q.x,q.y);
      } ctx.stroke();
    }
    for(let lon=-150;lon<=180;lon+=30){
      ctx.beginPath(); let started=false;
      for(let lat=-90;lat<=90;lat+=3){
        let p=ll2xyz(lat,lon); p=rotY(p,rot.y); p=rotX(p,rot.x);
        const q=project(p); if(!q){started=false; continue;}
        if(!started){ctx.moveTo(q.x,q.y);started=true;} else ctx.lineTo(q.x,q.y);
      } ctx.stroke();
    }
    ctx.restore();
  }

function drawSphereShell(){
  ctx.save();

  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = 'rgba(167,199,255,0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.stroke();

  // very soft inner glow (you can delete this block too if you want 100% bare)
  const g = ctx.createRadialGradient(cx, cy, R*0.1, cx, cy, R);
  g.addColorStop(0, 'rgba(160,220,255,.10)');
  g.addColorStop(1, 'rgba(160,220,255,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2); ctx.fill();

  ctx.restore();
}


  function twoToneColor(lon, rotY){
    // cyan -> magenta split drifting with rotation
    const shifted = ((lon + toDeg(rotY)) + 540) % 360 - 180;
    const t=(shifted+180)/360, lerp=(a,b,m)=>Math.round(a+(b-a)*m);
    const c1=[30,207,255], c2=[255,45,117];
    const r=lerp(c1[0],c2[0],t), g=lerp(c1[1],c2[1],t), b=lerp(c1[2],c2[2],t);
    return `rgb(${r},${g},${b})`;
  }

  function drawLandDots(rot){
    if(!landReady) return;
    ctx.save();
    for(const pt of landDots){
      let p=ll2xyz(pt.lat,pt.lon); p=rotY(p,rot.y); p=rotX(p,rot.x);
      const q=project(p); if(!q) continue;

      // core dot (two-tone)
      ctx.globalAlpha=0.95; ctx.fillStyle=twoToneColor(pt.lon, rot.y);
      ctx.beginPath(); ctx.arc(q.x,q.y,1.2,0,Math.PI*2); ctx.fill();

      // soft halo
      ctx.globalAlpha=0.32; ctx.fillStyle='rgba(6,182,212,.38)';
      ctx.beginPath(); ctx.arc(q.x,q.y,3.2,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  function drawCityNodes(rot){
    ctx.save();
    cities.forEach(c=>{
      let p=ll2xyz(c.lat,c.lon); p=rotY(p,rot.y); p=rotX(p,rot.x);
      const q=project(p); if(!q) return;
      ctx.globalAlpha=0.45; ctx.fillStyle='rgba(0,216,255,.45)';
      ctx.beginPath(); ctx.arc(q.x,q.y,6,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=1; ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.arc(q.x,q.y,2.2,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
  }

  function drawSurfaceMesh(rot){
    if(!landReady) return;
    ctx.save();
    ctx.lineWidth=1.0;
    for(const [A,B] of surfaceLinks){
      let a=ll2xyz(A.lat,A.lon), b=ll2xyz(B.lat,B.lon);
      const segs=28;
      for(let i=0;i<segs;i++){
        let P=slerp(a,b,i/segs), Q=slerp(a,b,(i+1)/segs);
        P=rotY(P,rot.y); P=rotX(P,rot.x);
        Q=rotY(Q,rot.y); Q=rotX(Q,rot.x);
        const p=project(P), q=project(Q); if(!p||!q) continue;

        ctx.globalAlpha=0.10; ctx.strokeStyle='#b9d1ff';
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();

        const grad=ctx.createLinearGradient(p.x,p.y,q.x,q.y);
        grad.addColorStop(0, CYAN); grad.addColorStop(1, MAGENTA);
        ctx.globalAlpha=0.28; ctx.strokeStyle=grad;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // === Cables + slow beads (this replaces the old arcs/sparks) ===
  function drawCablesAndBeads(rot, dt){
    ctx.save();

    for (const cab of cables){
      // cable arc (great circle)
      let A0 = ll2xyz(cab.A.lat, cab.A.lon);
      let B0 = ll2xyz(cab.B.lat, cab.B.lon);

      const segs = 56;
      for (let i=0;i<segs;i++){
        let P = slerp(A0,B0,i/segs);
        let Q = slerp(A0,B0,(i+1)/segs);
        P=rotY(P,rot.y); P=rotX(P,rot.x);
        Q=rotY(Q,rot.y); Q=rotX(Q,rot.x);
        const p=project(P), q=project(Q); if(!p||!q) continue;

        // faint base
        ctx.globalAlpha=0.12; ctx.strokeStyle='#b9d1ff'; ctx.lineWidth=1.1;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();

        // brand gradient overlay
        const grad=ctx.createLinearGradient(p.x,p.y,q.x,q.y);
        grad.addColorStop(0, CYAN); grad.addColorStop(1, MAGENTA);
        ctx.globalAlpha=0.30; ctx.strokeStyle=grad; ctx.lineWidth=1.0;
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.stroke();
      }

      // slow moving beads
      for (const bead of cab.beads){
        bead.t += bead.v * dt;
        if (bead.t > 1) bead.t = 0;

        let P = slerp(ll2xyz(cab.A.lat, cab.A.lon), ll2xyz(cab.B.lat, cab.B.lon), bead.t);
        P = rotY(P, rot.y); P = rotX(P, rot.x);
        const q = project(P); if(!q) continue;

        // glow
        ctx.globalAlpha=0.42; ctx.fillStyle='rgba(0,216,255,.45)';
        ctx.beginPath(); ctx.arc(q.x,q.y,5.4,0,Math.PI*2); ctx.fill();

        // bright core
        ctx.globalAlpha=1; ctx.fillStyle='#ffffff';
        ctx.beginPath(); ctx.arc(q.x,q.y,2.0,0,Math.PI*2); ctx.fill();
      }
    }

    ctx.restore();
  }

  // --- Main loop ---
  function step(now){
    const dt=Math.min(32, now - t0); t0=now;
    const rot={ y:(now/1000)*(2*Math.PI/ROT_SEC), x: toRad(18) };

    ctx.clearRect(0,0,w,h);

    drawGraticule(rot);
    drawSphereShell();
    drawSurfaceMesh(rot);
    drawLandDots(rot);
    drawCityNodes(rot);
    drawCablesAndBeads(rot, dt);

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();



/* === AGM RING CAROUSEL (wide, landscape, extra-smooth + slow) === */
(function(){
  const stage = document.getElementById('agmCarousel');
  if (!stage) return;

  // 1) ingest images -> build cards
  const imgs = Array.from(stage.querySelectorAll('img'));
  stage.innerHTML = ''; // clear stage

  // create card elements and per-card state for smoothing (lerp)
  const cards = imgs.map((img) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.appendChild(img);
    // per-card render state
    el._state = { x:0, y:0, s:1, r:0 };
    stage.appendChild(el);
    return el;
  });

  const COUNT = cards.length;
  const TWO_PI = Math.PI * 2;
  const STEP = TWO_PI / COUNT;

  // read CSS variables (with fallbacks)
  const css = getComputedStyle(stage);
  const GAP_X      = parseFloat(css.getPropertyValue('--gap'))       || 220;
  const BACK_SCALE = parseFloat(css.getPropertyValue('--backScale')) || 0.84;

  // MASTER rotation (very slow)
  let angle = 0;
  const ROT_SPEED = 0.00025;              // radians per ms (slower than before)
  let last = performance.now();
  let paused = false;

  // pause on hover (still auto-rotates otherwise)
  stage.addEventListener('mouseenter', () => paused = true);
  stage.addEventListener('mouseleave', () => { paused = false; last = performance.now(); });

  // small helper
  const lerp = (a,b,t)=>a+(b-a)*t;

  function render(now){
    const dt = now - last; last = now;
    if (!paused) angle += ROT_SPEED * dt;

    const w = stage.clientWidth, h = stage.clientHeight;
    const cx = w/2, cy = h/2;

    // subtle breathing to avoid a “rigid” look
    const breathe = Math.sin(now/2600) * 0.04;

    for (let i = 0; i < COUNT; i++){
      const card = cards[i];
      const s = card._state;

      // target param along the circular track
      const a = angle + i*STEP;

      // project to screen (horizontal arc, front at cos≈1)
      const z = Math.cos(a);                          // depth proxy (-1..1)
      const x = cx + Math.sin(a) * GAP_X;             // horizontal spread
      const y = cy;                                    // keep level

      // target transforms
      const tScale = BACK_SCALE + (1 - BACK_SCALE) * ((z + 1) / 2) + breathe;  // back→front
      const tRotY  = Math.sin(a) * 20;                // slight toe-in/out

      // ---- smoothing (lerp) so the motion feels creamy ----
      const k = 0.12;                                 // smoothing factor (higher = snappier)
      s.x = lerp(s.x, x, k);
      s.y = lerp(s.y, y, k);
      s.s = lerp(s.s, tScale, k);
      s.r = lerp(s.r, tRotY, k);

      // apply
      card.style.transform =
        `translate3d(${s.x - card.clientWidth/2}px, ${s.y - card.clientHeight/2}px, 0)
         rotateY(${s.r}deg)
         scale(${s.s})`;

      // depth stacking (front on top)
      card.style.zIndex = (1000 + Math.floor(z * 500)).toString();

      // helper classes (for glows/masks)
      const isFront = z > 0.95;
      const isSide  = Math.abs(Math.sin(a)) > 0.75;
      card.classList.toggle('is-front', isFront);
      card.classList.toggle('is-side', isSide);
    }

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();


