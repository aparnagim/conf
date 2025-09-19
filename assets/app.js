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


/* ===== HERO: Realistic Digital World Globe ===== */
(function(){
  const canvas = document.getElementById("world-real");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let w, h, cx, cy, R, dpr=1;
  function resize(){
    dpr = window.devicePixelRatio || 1;
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx = w/2; cy = h/2;
    R = Math.min(w,h)/2 * 0.9;
  }
  window.addEventListener("resize", resize);
  resize();

  // Theme colors
  const BLUE = "#1ecfff";
  const MAGENTA = "#ff2d75";
  const GRID = "rgba(255,255,255,0.12)";

  // Generate a "point cloud" for continents
  const points = [];
  for (let lat=-60; lat<=80; lat+=3){
    for (let lon=-180; lon<=180; lon+=3){
      if (Math.random()>0.55) continue; // sparse
      points.push({lat, lon});
    }
  }

  // Random nodes for glowing
  const nodes = Array.from({length: 150}, () => ({
    lat: Math.random()*180-90,
    lon: Math.random()*360-180
  }));

  // Random arcs between nodes
  const arcs = [];
  for (let i=0;i<90;i++){
    const a = nodes[Math.floor(Math.random()*nodes.length)];
    const b = nodes[Math.floor(Math.random()*nodes.length)];
    arcs.push([a,b]);
  }

  const toRad = d => d*Math.PI/180;
  function ll2xyz(lat,lon){
    const φ = toRad(lat), λ = toRad(lon);
    return {x: Math.cos(φ)*Math.cos(λ), y: Math.sin(φ), z: Math.cos(φ)*Math.sin(λ)};
  }
  function rotY(p,a){return {x:p.x*Math.cos(a)+p.z*Math.sin(a),y:p.y,z:-p.x*Math.sin(a)+p.z*Math.cos(a)}}
  function rotX(p,a){return {x:p.x,y:p.y*Math.cos(a)-p.z*Math.sin(a),z:p.y*Math.sin(a)+p.z*Math.cos(a)}}
  function project(p){
    if(p.z<=0) return null;
    return {x:cx+R*p.x,y:cy-R*p.y,z:p.z};
  }

  // Sparks moving on arcs
  const sparks = arcs.map(a=>({a:a[0],b:a[1],t:Math.random(),v:0.0005+Math.random()*0.0006}));

  let t0=performance.now();
  function step(now){
    const dt=Math.min(40,now-t0); t0=now;
    ctx.clearRect(0,0,w,h);

    const rot={y:now/1000*0.03, x:toRad(20)}; // slow spin

    // Outer glow
    const g = ctx.createRadialGradient(cx,cy,R*0.2,cx,cy,R*1.2);
    g.addColorStop(0,"rgba(30,207,255,.25)");
    g.addColorStop(1,"rgba(30,207,255,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R*1.1,0,Math.PI*2); ctx.fill();

    // Hemisphere rim (magenta)
    const rim = ctx.createRadialGradient(cx,cy,R*0.9,cx,cy,R*1.25);
    rim.addColorStop(0,"rgba(255,45,117,0)");
    rim.addColorStop(0.8,"rgba(255,45,117,.3)");
    rim.addColorStop(1,"rgba(255,45,117,0)");
    ctx.fillStyle=rim; ctx.beginPath(); ctx.arc(cx,cy,R*1.2,0,Math.PI*2); ctx.fill();

    // Grid lines
    ctx.globalAlpha=0.25; ctx.strokeStyle=GRID; ctx.lineWidth=1;
    for(let lat=-60;lat<=60;lat+=30){
      ctx.beginPath(); let started=false;
      for(let lon=-180;lon<=180;lon+=5){
        let p=ll2xyz(lat,lon); p=rotY(p,rot.y); p=rotX(p,rot.x); const q=project(p);
        if(!q){started=false;continue;}
        if(!started){ctx.moveTo(q.x,q.y);started=true;}else ctx.lineTo(q.x,q.y);
      }ctx.stroke();
    }

    // Points (continents)
    ctx.globalAlpha=0.9; ctx.fillStyle=BLUE;
    points.forEach(pt=>{
      let p=ll2xyz(pt.lat,pt.lon); p=rotY(p,rot.y); p=rotX(p,rot.x); const q=project(p);
      if(!q)return;
      ctx.beginPath(); ctx.arc(q.x,q.y,1.2,0,Math.PI*2); ctx.fill();
    });

    // Nodes (bright glowing)
    nodes.forEach(n=>{
      let p=ll2xyz(n.lat,n.lon); p=rotY(p,rot.y); p=rotX(p,rot.x); const q=project(p);
      if(!q)return;
      ctx.globalAlpha=1; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(q.x,q.y,2,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=0.4; ctx.fillStyle="rgba(30,207,255,.4)"; ctx.beginPath(); ctx.arc(q.x,q.y,5,0,Math.PI*2); ctx.fill();
    });

    // Arcs
    arcs.forEach(([a,b])=>{
      let A=ll2xyz(a.lat,a.lon),B=ll2xyz(b.lat,b.lon);
      const segs=40;
      ctx.globalAlpha=0.2; ctx.strokeStyle=BLUE; ctx.beginPath();
      for(let i=0;i<=segs;i++){
        let p={
          x:A.x+(B.x-A.x)*i/segs,
          y:A.y+(B.y-A.y)*i/segs,
          z:A.z+(B.z-A.z)*i/segs
        };
        p=rotY(p,rot.y); p=rotX(p,rot.x); const q=project(p);
        if(!q) continue;
        if(i===0) ctx.moveTo(q.x,q.y); else ctx.lineTo(q.x,q.y);
      }
      ctx.stroke();
    });

    // Sparks on arcs
    sparks.forEach(s=>{
      s.t+=s.v*dt; if(s.t>1) s.t=0;
      let A=ll2xyz(s.a.lat,s.a.lon),B=ll2xyz(s.b.lat,s.b.lon);
      let P={
        x:A.x+(B.x-A.x)*s.t,
        y:A.y+(B.y-A.y)*s.t,
        z:A.z+(B.z-A.z)*s.t
      };
      P=rotY(P,rot.y); P=rotX(P,rot.x); const q=project(P);
      if(!q)return;
      ctx.globalAlpha=1; ctx.fillStyle="#fff"; ctx.beginPath(); ctx.arc(q.x,q.y,2,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha=0.45; ctx.fillStyle=MAGENTA; ctx.beginPath(); ctx.arc(q.x,q.y,6,0,Math.PI*2); ctx.fill();
    });

    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();


