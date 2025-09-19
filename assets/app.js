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
(function(){
  const target = new Date('2025-10-23T03:30:00Z');
  const el = document.getElementById('countdown');
  if (!el) return;
  const pad = (n)=>String(n).padStart(2,'0');
  function tick(){
    const now = new Date();
    let ms = target - now;
    if (ms <= 0){ el.textContent = 'Event is live!'; return; }
    const d = Math.floor(ms/86400000); ms%=86400000;
    const h = Math.floor(ms/3600000);  ms%=3600000;
    const m = Math.floor(ms/60000);    ms%=60000;
    const s = Math.floor(ms/1000);
    el.textContent = `Starts in ${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
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
const io = new IntersectionObserver((ents)=>{
  ents.forEach(ent=>{
    const el = ent.target;
    if (ent.isIntersecting){
      el.classList.add('visible');
      el.classList.remove('leaving');
      if (el.id === 'kpis'){
        el.querySelectorAll('strong').forEach(s=>countUp(s, parseInt(s.dataset.count,10)||0));
      }
    }else{
      // when element goes out on upward scroll, shrink a bit
      const rect = el.getBoundingClientRect();
      if (rect.top > window.innerHeight) {
        // left viewport going down — ignore
      } else {
        el.classList.add('leaving');
      }
    }
  });
},{threshold:.14, rootMargin:"0px 0px -10% 0px"});

document.querySelectorAll('.reveal,.reveal-up,.pop').forEach(el=>io.observe(el));

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


/* ===== HERO: Sri Lanka network map (nodes, links, spark packets) ===== */
(function(){
  const canvas = document.getElementById('lk-net');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w=0,h=0,dpr=1, nodes=[], edges=[], packets=[];
  const THEME_A = '#b60144';   // maroon
  const THEME_B = '#06b6d4';   // cyan
  const GRID = 36;

  // Simplified Sri Lanka outline (normalized 0..1)
  // (hand-tuned polygon that preserves the island silhouette)
  const LK_POLY = [
    [0.53,0.05],[0.57,0.08],[0.60,0.12],[0.61,0.17],[0.63,0.22],[0.65,0.27],
    [0.66,0.33],[0.67,0.38],[0.66,0.43],[0.66,0.47],[0.66,0.52],[0.65,0.57],
    [0.64,0.61],[0.62,0.65],[0.60,0.69],[0.58,0.73],[0.55,0.77],[0.52,0.80],
    [0.48,0.83],[0.44,0.85],[0.40,0.86],[0.36,0.86],[0.33,0.84],[0.30,0.81],
    [0.28,0.77],[0.27,0.72],[0.26,0.67],[0.25,0.62],[0.24,0.57],[0.24,0.52],
    [0.24,0.47],[0.25,0.42],[0.26,0.37],[0.28,0.33],[0.30,0.29],[0.32,0.25],
    [0.35,0.21],[0.38,0.18],[0.41,0.15],[0.45,0.12],[0.49,0.09]
  ];

  function resize(){
    dpr = Math.max(1, window.devicePixelRatio || 1);
    const el = canvas.getBoundingClientRect();
    w = canvas.clientWidth; h = canvas.clientHeight;
    // keep aspect for a nice composition
    if (h < 360) h = 360;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    setup();
  }
  window.addEventListener('resize', resize, {passive:true});

  function pointInPoly(pt, poly){ // ray-cast
    const x=pt[0], y=pt[1]; let c=false;
    for (let i=0, j=poly.length-1; i<poly.length; j=i++){
      const xi=poly[i][0], yi=poly[i][1], xj=poly[j][0], yj=poly[j][1];
      const intersect = ((yi>y)!==(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi)+xi);
      if (intersect) c=!c;
    }
    return c;
  }

  function scalePoly(poly, box){
    // scale and place polygon within right canvas area
    const padding = 0.08;
    const sx = w*(1-2*padding), sy = h*(1-2*padding);
    const ox = w*padding, oy = h*padding;
    return poly.map(([x,y])=>[ox + x*sx, oy + y*sy]);
  }

  function randomInside(polyScaled){
    // rejection sample inside polygon
    let attempts=0;
    while(attempts++<5000){
      const x = Math.random()*w, y = Math.random()*h;
      if (pointInPoly([x,y], polyScaled)) return {x,y};
    }
    // fallback center
    const cx = w*0.5, cy = h*0.55; return {x:cx,y:cy};
  }

  function setup(){
    const poly = scalePoly(LK_POLY);

    // nodes ~120 inside shape
    const targetCount = Math.max(90, Math.floor((w*h)/5200));
    nodes = [];
    for (let i=0;i<targetCount;i++){
      const p = randomInside(poly);
      nodes.push({x:p.x, y:p.y, r:1.2+Math.random()*1.6, pulse:Math.random()*Math.PI*2});
    }

    // connect k-nearest neighbors with max distance limit
    edges = [];
    const maxDist = Math.min(120, Math.hypot(w,h)/10);
    for (let i=0;i<nodes.length;i++){
      // find 3 nearest
      const a = nodes[i];
      const dists = [];
      for (let j=0;j<nodes.length;j++){
        if (i===j) continue;
        const b = nodes[j];
        const d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d < maxDist) dists.push([d,j]);
      }
      dists.sort((u,v)=>u[0]-v[0]);
      for (let k=0;k<Math.min(3,dists.length);k++){
        const j = dists[k][1];
        // avoid duplicates
        if (!edges.some(e=>(e[0]===i&&e[1]===j)||(e[0]===j&&e[1]===i))) edges.push([i,j]);
      }
    }

    // packets moving along edges
    packets = [];
    const packetCount = Math.min(40, Math.max(18, Math.floor(edges.length*0.25)));
    for (let p=0;p<packetCount;p++){
      const e = edges[Math.floor(Math.random()*edges.length)];
      packets.push({ e, t: Math.random(), speed: 0.0015 + Math.random()*0.0035 });
    }
  }

  function drawGrid(){
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#cbe0ff';
    ctx.beginPath();
    for(let x=0;x<w;x+=GRID){ ctx.moveTo(x,0); ctx.lineTo(x,h); }
    for(let y=0;y<h;y+=GRID){ ctx.moveTo(0,y); ctx.lineTo(w,y); }
    ctx.stroke();
  }

  function step(){
    ctx.clearRect(0,0,w,h);
    drawGrid();

    // links (cables)
    for (const [ai,bi] of edges){
      const a = nodes[ai], b = nodes[bi];
      // faint cable
      ctx.globalAlpha = 0.12; ctx.lineWidth = 1.6; ctx.strokeStyle = '#9fb6ff';
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      // brand gradient overlay
      const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
      grad.addColorStop(0, THEME_A); grad.addColorStop(1, THEME_B);
      ctx.globalAlpha = 0.28; ctx.lineWidth = 1; ctx.strokeStyle = grad;
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    }

    // nodes (twinkle)
    const t = Date.now()/1000;
    for (const n of nodes){
      const pul = (Math.sin(t*2 + n.pulse)*0.5+0.5); // 0..1
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = 'rgba(51,225,198,.95)';
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fill();
      // glow
      ctx.globalAlpha = 0.18 + pul*0.22;
      const g = ctx.createRadialGradient(n.x,n.y,0, n.x,n.y,9+pul*8);
      g.addColorStop(0,'rgba(180,230,255,.9)');
      g.addColorStop(1,'rgba(180,230,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(n.x,n.y,9+pul*8,0,Math.PI*2); ctx.fill();
    }

    // packets
    for (const p of packets){
      p.t += p.speed;
      if (p.t>1){ p.t=0; p.e = edges[Math.floor(Math.random()*edges.length)]; }
      const a = nodes[p.e[0]], b = nodes[p.e[1]];
      const x = a.x + (b.x-a.x)*p.t;
      const y = a.y + (b.y-a.y)*p.t;
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(x,y,1.8,0,Math.PI*2); ctx.fill();
      // trail
      ctx.globalAlpha = 0.35; ctx.fillStyle = 'rgba(6,182,212,.35)';
      ctx.beginPath(); ctx.arc(x,y,5.5,0,Math.PI*2); ctx.fill();
    }

    requestAnimationFrame(step);
  }

  resize(); setup(); step();
})();


