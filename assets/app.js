/* ===== Agenda Builder + Section Network Lines ===== */
(function(){
  const startHour = 8;      // grid begins at 08:00
  const endHour   = 19;     // ends at 19:00 (to show late items)
  const stepMin   = 30;     // 30-min rows

  // Content (matches your table)
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
        { title:"LEARN Social Dinner", start:"19:00", end:"19:30", col:4 }
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

    // Calculate and LOCK the grid rows for the whole day:
    const totalRows = ((endHour - startHour) * 60) / stepMin; // 30-min steps
    // 1 header row (40px) + N time rows (48px each — matches CSS)
    timeline.style.gridTemplateRows = `40px repeat(${totalRows}, 48px)`;

    // Spacer (header row)
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



