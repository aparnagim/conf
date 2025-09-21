/* =========================================================
   helpers
   ========================================================= */
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

/* =========================================================
   Boot / tiny loader bar and percent
   ========================================================= */
(() => {
  const bar = $('#boot-bar');
  const pct = $('#boot-pct');
  const status = $('#boot-status');
  if (!bar || !pct) return;

  let p = 0;
  const steps = [
    'Initializing LEARN Experience…',
    'Warming up graphics…',
    'Preparing content…',
    'Almost there…'
  ];

  const tick = () => {
    p = Math.min(100, p + Math.random() * 9 + 3);
    bar.style.width = p + '%';
    pct.textContent = Math.floor(p);
    status.textContent = steps[Math.min(steps.length-1, Math.floor(p/30))];
    if (p < 96) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

/* =========================================================
   Scroll progress line in header
   ========================================================= */
(() => {
  const line = $('#scrollbar');
  if (!line) return;
  const update = () => {
    const max = document.body.scrollHeight - innerHeight;
    const r = max > 0 ? (scrollY / max) : 0;
    line.style.width = (r * 100) + '%';
  };
  on(window, 'scroll', update, { passive:true });
  on(window, 'resize', update);
  update();
})();

/* =========================================================
   Drawer (mobile)
   ========================================================= */
(() => {
  const burger = $('#hamburger');
  const drawer = $('#drawer');
  if (!burger || !drawer) return;

  on(burger, 'click', () => drawer.classList.toggle('open'));
  // close on link click
  $$('#drawer a').forEach(a => on(a, 'click', () => drawer.classList.remove('open')));
  // close on scroll
  on(window, 'scroll', () => drawer.classList.remove('open'), { passive:true });
})();

/* =========================================================
   Smooth anchor scrolling, also auto-open WG split
   ========================================================= */
(() => {
  const openWG = () => {
    const split = $('#wgSplit');
    if (split && split.classList.contains('collapsed')) {
      split.classList.remove('collapsed');
      const btn = $('#wgStartBtn');
      if (btn) btn.setAttribute('aria-expanded','true');
    }
  };

  // global smooth anchors
  $$('a[href^="#"]').forEach(a => {
    on(a, 'click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      if (id === '#wgs') openWG();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  });

  // open via the round orb button
  const start = $('#wgStartBtn');
  if (start) {
    on(start, 'click', () => {
      openWG();
      $('#wgs')?.scrollIntoView({ behavior:'smooth', block:'start' });
    });
  }
})();

/* =========================================================
   AGM slider (lightweight)
   ========================================================= */
(() => {
  const track = $('#axTrack');
  const viewport = $('#axViewport');
  const dotsWrap = $('#axDots');
  const prev = $('.ax-nav.prev');
  const next = $('.ax-nav.next');
  if (!track || !viewport) return;

  const slides = $$('#axTrack > li');
  let i = 0;

  // build dots
  if (dotsWrap) {
    slides.forEach((_, k) => {
      const b = document.createElement('button');
      b.className = 'dot';
      b.setAttribute('aria-label', 'Go to slide ' + (k+1));
      b.addEventListener('click', () => go(k));
      dotsWrap.appendChild(b);
    });
  }

  const updateDots = () => {
    if (!dotsWrap) return;
    [...dotsWrap.children].forEach((d, k) => d.classList.toggle('active', k === i));
  };

  const go = (idx) => {
    i = (idx + slides.length) % slides.length;
    const w = viewport.clientWidth;
    track.style.transform = `translateX(${-i * (w + 18)}px)`;
    updateDots();
  };

  on(window, 'resize', () => go(i));
  prev && on(prev, 'click', () => go(i-1));
  next && on(next, 'click', () => go(i+1));
  // initial widths: set card min width ~= viewport
  const fitWidths = () => {
    const w = Math.min(560, viewport.clientWidth);
    slides.forEach(li => li.style.minWidth = w + 'px');
  };
  on(window, 'resize', fitWidths);
  fitWidths();
  go(0);
})();

/* =========================================================
   Agenda tabs
   ========================================================= */
(() => {
  const tabs = $$('.tabs .tab');
  const underline = $('#tab-underline');
  if (!tabs.length) return;

  const activate = (btn) => {
    tabs.forEach(b => b.classList.toggle('active', b === btn));
    const id = btn.dataset.target;
    $$('.tabpane').forEach(p => p.classList.toggle('active', p.id === id));
    // underline animation
    if (underline) {
      const r = btn.getBoundingClientRect();
      const pr = btn.parentElement.getBoundingClientRect();
      underline.style.transform = `translateX(${r.left-pr.left}px)`;
      underline.style.width = r.width + 'px';
    }
  };

  tabs.forEach(b => on(b, 'click', () => activate(b)));
  // init
  activate(tabs.find(b => b.classList.contains('active')) || tabs[0]);
  on(window, 'resize', () => {
    const active = tabs.find(b => b.classList.contains('active'));
    active && activate(active);
  });
})();

/* =========================================================
   KPI counters + countdown to event
   ========================================================= */
(() => {
  // counters
  const counters = $$('#kpis [data-count]');
  const countUp = (el, to, dur=1200) => {
    const from = 0;
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.floor(from + (to - from) * (1 - Math.cos(Math.PI*p))/2);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (counters.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          counters.forEach(el => countUp(el, Number(el.dataset.count || '0')));
          io.disconnect();
        }
      });
    }, { threshold:.3 });
    io.observe($('#kpis'));
  }

  // countdown to Oct 23, 2025 09:00 local
  const countdownBox = $('.countdown');
  if (countdownBox) {
    const target = new Date('2025-10-23T09:00:00');
    const fmt = (n) => String(n).padStart(2,'0');
    const tick = () => {
      const now = new Date();
      let diff = Math.max(0, target - now);
      const d = Math.floor(diff / 86400000); diff -= d*86400000;
      const h = Math.floor(diff / 3600000);  diff -= h*3600000;
      const m = Math.floor(diff / 60000);    diff -= m*60000;
      const s = Math.floor(diff / 1000);
      countdownBox.innerHTML =
        `<div class="chip" style="display:inline-block;margin-top:8px">
           ${d}d ${fmt(h)}h ${fmt(m)}m ${fmt(s)}s
         </div>`;
    };
    tick();
    setInterval(tick, 1000);
  }
})();

/* =========================================================
   Card tilt (subtle) for elements with .card-tilt
   ========================================================= */
(() => {
  const cards = $$('.card-tilt');
  if (!cards.length) return;
  const clamp = (n,min,max)=>Math.min(max,Math.max(min,n));
  cards.forEach(card=>{
    on(card,'mousemove',e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = clamp((.5 - y) * 10, -8, 8);
      const ry = clamp((x - .5) * 12, -10, 10);
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    });
    on(card,'mouseleave',()=> card.style.transform = '');
  });
})();

/* =========================================================
   Working Groups: keep split open once user opens it
   (and make sure it remains visible across resizes)
   ========================================================= */
(() => {
  const split = $('#wgSplit');
  if (!split) return;

  // if user has opened once, remember during the session
  const KEY = 'wg-opened';
  if (sessionStorage.getItem(KEY) === '1') split.classList.remove('collapsed');

  const openOnce = () => {
    if (split.classList.contains('collapsed')) {
      split.classList.remove('collapsed');
      sessionStorage.setItem(KEY, '1');
    }
  };

  on($('#wgStartBtn'), 'click', openOnce);
  // If a user lands directly with #wgs in URL, open it
  if (location.hash === '#wgs') openOnce();

  // If navbar WG link is clicked we open too (handled in smooth anchor section)
})();

/* =========================================================
   Background dots canvas (subtle)
   ========================================================= */
(() => {
  const canvas = $('#bg-dots');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const DPR = Math.min(2, devicePixelRatio || 1);

  const resize = () => {
    canvas.width  = innerWidth  * DPR;
    canvas.height = innerHeight * DPR;
    draw();
  };

  const draw = () => {
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);
    for (let i=0;i<60;i++){
      const x = Math.random()*w, y = Math.random()*h;
      const r = Math.random()*2 + .6;
      ctx.fillStyle = `rgba(146, 182, 255, ${Math.random()*.25 + .05})`;
      ctx.beginPath(); ctx.arc(x,y,r*DPR,0,Math.PI*2); ctx.fill();
    }
  };

  resize();
  on(window,'resize',resize);
})();


