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


/* ===== Agenda Builder + Section Network Lines ===== */
(function(){
  const startHour = 8;      // grid begins at 08:00
  const endHour   = 19;     // ends at 19:00 (to show late items)
  const stepMin   = 30;     // 30-min rows

  // Content (matches your screenshot/table)
  // col: 2=WG1, 3=WG2, 4=Other; span (optional) for multi-track pills
  const AGENDA = {
    day1: {
      dateLabel: "Thursday, October 23, 2025",
      tracks: ["WG 1 — AgriTech", "WG 2 — GenAI Empowerment", "Other Events"],
      items: [
        { title:"Initiation, Terms of Reference & Keynote", start:"09:00", end:"10:30", col:2 },
        { title:"Initiation, Terms of Reference & Keynote", start:"09:00", end:"10:30", col:3 },
        { title:"Tea Break", start:"10:30", end:"11:00", col:2, span:3, kind:"break" },
        { title:"Use Cases & Landscape", start:"11:00", end:"12:30", col:2 },
        { title:"Use Cases & Opportunities", start:"11:00", end:"12:30", col:3 },
        { title:"Lunch", start:"12:30", end:"13:30", col:2, span:3, kind:"break" },
        { title:"Strategic Focus Areas", start:"13:30", end:"15:00", col:2 },
        { title:"Strategic Focus Areas", start:"13:30", end:"15:00", col:3 },
        { title:"Tea Break", start:"15:00", end:"15:30", col:2, span:3, kind:"break" },
        { title:"Opening Ceremony of LEARN Meetings", start:"15:30", end:"17:00", col:4,
          subtitle:"Welcome • Remarks • Keynote" },
        { title:"LEARN Board Meeting (Board members only)", start:"17:00", end:"19:00", col:4 },
        { title:"LEARN Social Dinner", start:"19:00", end:"19:30", col:4 } // shows “onwards”
      ]
    },
    day2: {
      dateLabel: "Friday, October 24, 2025",
      tracks: ["WG 1 — AgriTech", "WG 2 — GenAI Empowerment", "Other Events"],
      items: [
        { title:"Draft Roadmap Development", start:"09:00", end:"10:30", col:2 },
        { title:"Draft Roadmap Development", start:"09:00", end:"10:30", col:3 },
        { title:"Tea Break", start:"10:30", end:"11:00", col:2, span:3, kind:"break" },
        { title:"Finalize Roadmap", start:"11:00", end:"12:30", col:2 },
        { title:"Finalize Roadmap", start:"11:00", end:"12:30", col:3 },
        { title:"16th Annual General Meeting (AGM)", start:"11:00", end:"12:30", col:4 },
        { title:"Lunch", start:"12:30", end:"13:30", col:2, span:3, kind:"break" },
        { title:"LEARN Services Awareness Session", start:"13:30", end:"15:00", col:4 },
        { title:"Tea Break", start:"15:00", end:"15:30", col:2, span:3, kind:"break" },
        { title:"Closing Ceremony (WG Reports & Closing Remarks)", start:"15:30", end:"17:00", col:4 }
      ]
    }
  };

  const timeline = document.getElementById('timeline');
  if (!timeline) return;
  const dateEl = document.getElementById('agenda-date');

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

  function timeToFloat(t){ const [H,M]=t.split(':').map(Number); return H + (M/60); }
  function clear(el){ while(el.firstChild) el.removeChild(el.firstChild); }

  function buildGrid(dayKey){
    const data = AGENDA[dayKey];
    dateEl.textContent = data.dateLabel;
    clear(timeline);

    // Spacer (for header row)
    const spacer = document.createElement('div');
    spacer.className='spacer'; spacer.style.gridColumn='1 / -1';
    timeline.appendChild(spacer);

    const mobile = window.matchMedia('(max-width: 980px)').matches;

    // Track headers
    const heads = mobile ? ["All Tracks"] : data.tracks;
    heads.forEach((label,i)=>{
      const h = document.createElement('div');
      h.className='track-head';
      h.style.gridColumn = `${mobile?2:(i+2)} / span 1`;
      h.textContent = label;
      timeline.appendChild(h);
    });

    // Time ruler (30-min rows)
    const totalRows = ((endHour - startHour) * 60) / stepMin;
    for (let r=0; r<totalRows; r++){
      const hour = startHour + (r*stepMin/60);
      const t = document.createElement('div');
      t.className='time';
      t.textContent = r%2===0 ? `${String(Math.floor(hour)%12||12)}:00 ${hour<12?"AM":"PM"}` : '';
      t.style.gridColumn='1';
      timeline.appendChild(t);
    }

    // Items
    data.items.forEach(item=>{
      const el = document.createElement('div');
      el.className = 'slot' + (item.kind==='break' ? ' break' : '');
      const start = timeToFloat(item.start) - startHour;
      const end   = timeToFloat(item.end)   - startHour;

      el.style.setProperty('--start', start);
      el.style.setProperty('--end', end);
      el.style.setProperty('--col',  mobile ? 2 : (item.col||2));
      el.style.setProperty('--span', mobile ? 1 : (item.span||1));

      const small = `${item.start} – ${item.end}` + (item.title.includes('onwards')?' onwards':'');
      el.innerHTML = `<div>${item.title}</div><small>${small}${item.subtitle?` • ${item.subtitle}`:''}</small>`;
      timeline.appendChild(el);
    });
  }

  function setActive(day){ buildGrid(day); }
  setActive('day1');
  window.addEventListener('resize', ()=> setActive(document.querySelector('.chip-toggle.active').dataset.day), {passive:true});

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


