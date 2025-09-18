/* =========================================================
   BOOT LOADER  + NETWORK LINES
   ========================================================= */
(function(){
  const boot = document.getElementById('boot');
  if (!boot) return;

  // Elements
  const pctEl = document.getElementById('boot-pct');
  const barEl = document.getElementById('boot-bar');
  const statusEl = document.getElementById('boot-status');

  // Simulated progress + completes on window load
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
  setTimeout(finish, 9000); // fallback
  tick();

  // Network lines behind the loader
  const canvas = document.getElementById('boot-net');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  let w, h, dpr, nodes=[];

  function resize(){
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.floor((w*h) / 22000);
    nodes = Array.from({length: count}, ()=>({
      x: Math.random()*w, y: Math.random()*h,
      vx:(Math.random()-.5)*0.16, vy:(Math.random()-.5)*0.16,
      r:1 + Math.random()*1.8
    }));
  }
  function step(){
    ctx.clearRect(0,0,w,h);
    // subtle grid
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = '#cbe0ff';
    const grid = 42;
    ctx.beginPath();
    for(let x=0;x<w;x+=grid){ ctx.moveTo(x,0); ctx.lineTo(x,h); }
    for(let y=0;y<h;y+=grid){ ctx.moveTo(0,y); ctx.lineTo(w,y); }
    ctx.stroke();

    // nodes + links
    const maxDist = 120;
    for (let i=0;i<nodes.length;i++){
      const a = nodes[i];
      a.x+=a.vx; a.y+=a.vy;
      if (a.x<-20) a.x=w+20; if (a.x>w+20) a.x=-20;
      if (a.y<-20) a.y=h+20; if (a.y>h+20) a.y=-20;

      ctx.globalAlpha = .8;
      ctx.fillStyle = 'rgba(51,225,198,.9)';
      ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,Math.PI*2); ctx.fill();

      for (let j=i+1;j<nodes.length;j++){
        const b = nodes[j];
        const dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
        if (dist < maxDist){
          const alpha = 1 - (dist/maxDist);
          ctx.globalAlpha = alpha * .5;
          const grad = ctx.createLinearGradient(a.x,a.y,b.x,b.y);
          grad.addColorStop(0,'#b60144'); // maroon
          grad.addColorStop(1,'#06b6d4'); // cyan
          ctx.strokeStyle = grad; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(step);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize(); step();
})();

/* =========================================================
   AMBIENT BACKGROUND DOTS
   ========================================================= */
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

/* =========================================================
   GLOBAL HELPERS (drawer, smooth scroll, hero tilt, countdown)
   ========================================================= */

// Drawer
(function(){
  const burger = document.getElementById('hamburger');
  const drawer = document.getElementById('drawer');
  if (!burger || !drawer) return;
  burger.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    drawer.style.display = open ? 'block' : 'none';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>{
    drawer.style.display='none'; drawer.classList.remove('open');
  }));
})();

// Smooth scroll for anchor links
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({behavior:'smooth', block:'start'});
});

// Countdown to Oct 23, 2025 09:00 Asia/Colombo (UTC+5:30)
(function(){
  const el = document.getElementById('countdown');
  if (!el) return;
  const target = new Date('2025-10-23T03:30:00Z'); // 09:00 +0530
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

// Parallax tilt on hero art
(function(){
  const art = document.querySelector('.hero-art');
  if (!art) return;
  art.addEventListener('mousemove', (e)=>{
    const b = art.getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - .5;
    const y = (e.clientY - b.top) / b.height - .5;
    art.style.transform = `rotateX(${y*-6}deg) rotateY(${x*6}deg)`;
  });
  art.addEventListener('mouseleave', ()=> art.style.transform = 'rotateX(0) rotateY(0)');
})();

/* =========================================================
   KPI COUNT-UP + REVEAL SYSTEM + PAGE READY
   ========================================================= */
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

window.addEventListener('load', ()=>{
  document.body.classList.remove('is-loading');
  document.body.classList.add('is-ready');
  document.querySelector('.hero h1.stagger')?.classList.add('ready');
});

const io = new IntersectionObserver((entries)=>{
  entries.forEach(ent=>{
    const el = ent.target;
    if (ent.isIntersecting){
      el.classList.add('visible');
      el.classList.remove('leaving');
      if (el.id === 'kpis'){
        el.querySelectorAll('strong').forEach(s=>countUp(s, parseInt(s.dataset.count,10)||0));
      }
      io.unobserve(el); // reveal once
    }else{
      const rect = el.getBoundingClientRect();
      if (!(rect.top > window.innerHeight)) el.classList.add('leaving');
    }
  });
},{threshold:.14, rootMargin:"0px 0px -10% 0px"});

document.querySelectorAll('.reveal, .reveal-up, .pop').forEach(el=>io.observe(el));

/* =========================================================
   AGENDA BUILDER (tight grid + auto span-all) + SECTION NET
   ========================================================= */
(function(){
  // GRID SETTINGS
  const startHour = 8;     // 08:00
  const endHour   = 24;    // show through midnight for dinner
  const stepMin   = 30;    // 30‐min rows

  // Tighter vertical rhythm (less gap)
  const ROW_H = 40;        // px per 30 minutes  (was 48)
  const HOUR_H = ROW_H * 2;

  // CONTENT
  // col: 2=WG1, 3=WG2, 4=Other; all:true => span all tracks
  const AGENDA = {
    day1: {
      dateLabel: "Thursday, October 23, 2025",
      tracks: ["WG 1 — AgriTech", "WG 2 — GenAI Empowerment", "Other Events"],
      items: [
        { title:"WG 1 (AgriTech): Initiation, ToR & Keynote", start:"09:00", end:"10:30", col:2 },
        { title:"WG 2 (GenAI): Initiation, ToR & Keynote",   start:"09:00", end:"10:30", col:3 },

        { title:"Tea Break", start:"10:30", end:"11:00", kind:"break", all:true },

        { title:"WG 1: Use Cases & Landscape",     start:"11:00", end:"12:30", col:2 },
        { title:"WG 2: Use Cases & Opportunities", start:"11:00", end:"12:30", col:3 },

        { title:"Lunch", start:"12:30", end:"13:30", kind:"break", all:true },

        { title:"Strategic Focus Areas", start:"13:30", end:"15:00", all:true,
          subtitle:"Parallel tracks define 2025–26 priorities & milestones." },

        { title:"Tea Break", start:"15:00", end:"15:30", kind:"break", all:true },

        { title:"Opening Ceremony of LEARN Meetings", start:"15:30", end:"17:00", all:true,
          subtitle:"Welcome • Remarks • Keynote" },

        { title:"LEARN Board Meeting", start:"17:00", end:"19:00", all:true,
          subtitle:"Board members only." },

        { title:"LEARN Social Dinner", start:"19:00", end:"24:00", all:true,
          subtitle:"Meet, connect, and celebrate the kickoff." }
      ]
    },
    day2: {
      dateLabel: "Friday, October 24, 2025",
      tracks: ["WG 1 — AgriTech", "WG 2 — GenAI Empowerment", "Other Events"],
      items: [
        { title:"WG 1: Draft Roadmap Development", start:"09:00", end:"10:30", col:2 },
        { title:"WG 2: Draft Roadmap Development", start:"09:00", end:"10:30", col:3 },

        { title:"Tea Break", start:"10:30", end:"11:00", kind:"break", all:true },

        { title:"WG 1: Finalize Roadmaps", start:"11:00", end:"12:30", col:2 },
        { title:"WG 2: Finalize Roadmaps", start:"11:00", end:"12:30", col:3 },
        { title:"16th Annual General Meeting (AGM)", start:"11:00", end:"12:30", col:4 },

        { title:"Lunch", start:"12:30", end:"13:30", kind:"break", all:true },

        { title:"LEARN Services Awareness Session", start:"13:30", end:"15:00", all:true,
          subtitle:"Identity (eduID, eduGAIN) • Mobility (eduroam, eduVPN) • Security (CSIRT, TAC) • Collaboration & Cloud." },

        { title:"Tea Break", start:"15:00", end:"15:30", kind:"break", all:true },

        { title:"Closing Ceremony", start:"15:30", end:"17:00", all:true,
          subtitle:"WG Reports & Closing Remarks" }
      ]
    }
  };

  // ELEMENTS
  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  const dateEl = document.getElementById('agenda-date');

  // Day toggles
  const toggles = document.querySelectorAll('.chip-toggle');
  toggles.forEach(b=>{
    b.addEventListener('click', ()=>{
      toggles.forEach(x=>{
        const active = x===b;
        x.classList.toggle('active', active);
        x.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      setActive(b.dataset.day);
    });
  });

  // Helpers
  const timeToFloat = (t)=>{ const [H,M]=t.split(':').map(Number); return H + (M/60); };
  const clear = (el)=>{ while(el.firstChild) el.removeChild(el.firstChild); };

  function buildGrid(dayKey){
    const data = AGENDA[dayKey];

    // Dynamic track count for this day
    const tracksCount = data.tracks.length;

    // Apply tighter vertical rhythm
    timeline.style.setProperty('--row-h', ROW_H+'px');
    timeline.style.setProperty('--hour', HOUR_H+'px');

    // Adjust columns for track count
    const isMobile = window.matchMedia('(max-width: 980px)').matches;
    timeline.style.gridTemplateColumns = isMobile
      ? '74px 1fr'
      : `100px repeat(${tracksCount}, 1fr)`;

    dateEl && (dateEl.textContent = data.dateLabel);
    clear(timeline);

    // Hour lines layer
    const lines = document.createElement('div');
    lines.className = 'hour-lines';
    timeline.appendChild(lines);

    // Track headers (row 1)
    const heads = isMobile ? ["All Tracks"] : data.tracks;
    heads.forEach((label,i)=>{
      const h = document.createElement('div');
      h.className='track-head';
      h.style.gridColumn = `${isMobile?2:(i+2)} / span 1`;
      h.textContent = label;
      timeline.appendChild(h);
    });

    // Time ruler: header spacer + each 30-min row (label hours only)
    const spacer = document.createElement('div');
    spacer.className = 'time header';
    spacer.style.gridColumn = '1';
    spacer.textContent = '';
    timeline.appendChild(spacer);

    const totalRows = ((endHour - startHour) * 60) / stepMin;
    for (let r=0; r<totalRows; r++){
      const hour = startHour + (r*stepMin/60);
      const t = document.createElement('div');
      t.className='time';
      if (r % 2 === 0) {
        const base = Math.floor(hour);
        const h12 = (base % 12) || 12;
        const ampm = base < 12 ? "AM" : "PM";
        t.textContent = `${h12}:00 ${ampm}`;
      } else {
        t.textContent = '';
      }
      t.style.gridColumn='1';
      timeline.appendChild(t);
    }

    // Items
    data.items.forEach(item=>{
      const el = document.createElement('div');
      el.className = 'slot' + (item.kind==='break' ? ' break' : '');

      const start = timeToFloat(item.start) - startHour;
      const end   = timeToFloat(item.end)   - startHour;

      // base positions
      el.style.setProperty('--start', start);
      el.style.setProperty('--end', end);

      // column & span logic
      const spanAll = !!item.all;
      if (isMobile){
        el.style.setProperty('--col', 2);
        el.style.setProperty('--span', 1);
      } else {
        const col = Math.max(2, Math.min( tracksCount + 1, item.col || 2 ));
        el.style.setProperty('--col', spanAll ? 2 : col);
        el.style.setProperty('--span', spanAll ? tracksCount : (item.span || 1));
      }

      // content
      const timeStr = `${item.start} – ${item.end}`;
      el.innerHTML = `
        <div>${item.title}</div>
        <small>${timeStr}${item.subtitle ? ` • ${item.subtitle}` : ''}</small>
      `;
      timeline.appendChild(el);
    });
  }

  function setActive(day){ buildGrid(day); }
  setActive('day1');

  // Rebuild on resize so mobile/desktop layout & lines stay perfect
  window.addEventListener('resize', ()=>{
    const active = document.querySelector('.chip-toggle.active');
    setActive(active ? active.dataset.day : 'day1');
  }, {passive:true});

  /* ===== Agenda network lines (lighter than boot) ===== */
  (function(){
    const cvs = document.getElementById('agenda-net'); if (!cvs) return;
    const ctx = cvs.getContext('2d');
    let w,h,dpr,nodes=[];
    function resize(){
      dpr = Math.max(1, window.devicePixelRatio||1);
      w = cvs.clientWidth; h = cvs.clientHeight;
      cvs.width = w*dpr; cvs.height = h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = Math.floor((w*h)/32000);
      nodes = Array.from({length:count}, ()=>({
        x: Math.random()*w, y: Math.random()*h,
        vx:(Math.random()-.5)*0.12, vy:(Math.random()-.5)*0.12,
        r:1+Math.random()*1.6
      }));
    }
    function step(){
      ctx.clearRect(0,0,w,h);
      // faint grid
      ctx.globalAlpha=0.05; ctx.strokeStyle='#cbe0ff';
      const g=52; ctx.beginPath();
      for(let x=0;x<w;x+=g){ctx.moveTo(x,0);ctx.lineTo(x,h);}
      for(let y=0;y<h;y+=g){ctx.moveTo(0,y);ctx.lineTo(w,y);} ctx.stroke();

      const maxDist=120;
      for(let i=0;i<nodes.length;i++){
        const a=nodes[i]; a.x+=a.vx; a.y+=a.vy;
        if(a.x<-20)a.x=w+20;if(a.x>w+20)a.x=-20;
        if(a.y<-20)a.y=h+20;if(a.y>h+20)a.y=-20;

        ctx.globalAlpha=.75; ctx.fillStyle='rgba(51,225,198,.9)';
        ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,Math.PI*2); ctx.fill();

        for(let j=i+1;j<nodes.length;j++){
          const b=nodes[j], dx=a.x-b.x, dy=a.y-b.y, dist=Math.hypot(dx,dy);
          if(dist<maxDist){
            const alpha=1-(dist/maxDist);
            ctx.globalAlpha=alpha*.5;
            const grad=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
            grad.addColorStop(0,'#b60144');   // maroon
            grad.addColorStop(1,'#06b6d4');   // cyan
            ctx.strokeStyle=grad; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(step);
    }
    window.addEventListener('resize', resize, {passive:true});
    resize(); step();
  })();
})();

