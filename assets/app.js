// Day toggle
document.querySelectorAll('.chip-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.chip-toggle').forEach(b=>{
      const active = b===btn;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const target = btn.dataset.target;
    document.querySelectorAll('#day1, #day2').forEach(s=>{
      if (s.id === target){ s.hidden = false; }
      else { s.hidden = true; }
    });
  });
});

// Build time labels for each grid from data-* minutes
document.querySelectorAll('.schedule-grid').forEach(buildLabels);

function buildLabels(grid){
  const start = +grid.dataset.start || 480;     // minutes from midnight
  const end   = +grid.dataset.end   || 1140;    // minutes from midnight
  const step  = +grid.dataset.labelStep || 60;  // label every N minutes

  // time column
  const col = document.createElement('div');
  col.className = 'time-col';
  grid.appendChild(col);

  for (let m = start; m <= end; m += step){
    const lab = document.createElement('div');
    lab.className = 'tlabel';
    lab.style.top = `calc((${m} - var(--day-start)) * var(--minute))`;
    lab.textContent = toLabel(m);
    col.appendChild(lab);
  }
}

function toLabel(min){
  let h = Math.floor(min/60);
  const m = min % 60;
  const ampm = h < 12 ? 'AM' : 'PM';
  h = h % 12; if (h === 0) h = 12;
  return `${h}:${m.toString().padStart(2,'0')} ${ampm}`;
}

