// Mobile drawer
const burger = document.getElementById('hamburger');
const drawer = document.getElementById('drawer');
if (burger && drawer){
  burger.addEventListener('click', () => {
    drawer.classList.toggle('open');
    drawer.style.display = drawer.classList.contains('open') ? 'block' : 'none';
  });
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click',()=>{
    drawer.style.display='none'; drawer.classList.remove('open')
  }));
}

// Tabs
const tabs = document.querySelectorAll('.tab');
const panes = document.querySelectorAll('.tabpane');
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  panes.forEach(p => p.classList.remove('active'));
  t.classList.add('active');
  const id = t.dataset.target;
  document.getElementById(id)?.classList.add('active');
}));

// Smooth scroll for in-page links
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
  const target = new Date('2025-10-23T03:30:00Z'); // 9:00 in Colombo
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
    requestAnimationFrame(()=>setTimeout(tick, 1000));
  }
  tick();
})();
