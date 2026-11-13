/* Lightweight glow cursor (vanilla). */
(function () {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '9999';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const opts = { color: '#dd8fb6', intensity: 1.3, trailWidth: 2, linger: 1.4, glow: 1.0, clickBurst: true };
  let mx = -100, my = -100, px = -100, py = -100;
  const trail = [];
  window.addEventListener('pointermove', e => { mx = e.clientX * dpr; my = e.clientY * dpr; });
  window.addEventListener('pointerdown', e => {
    if (!opts.clickBurst) return;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      trail.push({ x: e.clientX*dpr, y: e.clientY*dpr, vx: Math.cos(a)*4, vy: Math.sin(a)*4, life: 1, burst: true });
    }
  });

  function hexToRgb(hex) {
    const m = hex.replace('#',''); 
    return [parseInt(m.slice(0,2),16), parseInt(m.slice(2,4),16), parseInt(m.slice(4,6),16)];
  }
  const [cr,cg,cb] = hexToRgb(opts.color);

  function frame() {
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation = 'lighter';
    // follow
    px += (mx - px) * 0.15;
    py += (my - py) * 0.15;
    trail.push({ x: px, y: py, vx: 0, vy: 0, life: 1, burst: false });
    // update
    for (let i = trail.length - 1; i >= 0; i--) {
      const t = trail[i];
      t.life -= 0.015 / opts.linger;
      if (t.burst) { t.x += t.vx; t.y += t.vy; t.vx *= 0.9; t.vy *= 0.9; }
      if (t.life <= 0) trail.splice(i, 1);
    }
    // draw
    for (const t of trail) {
      const r = opts.trailWidth * dpr * (0.5 + t.life * 0.5);
      const glowR = r * opts.glow * 3;
      const g = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, glowR);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * t.life * opts.intensity})`);
      g.addColorStop(0.3, `rgba(${cr},${cg},${cb},${0.8 * t.life * opts.intensity})`);
      g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(t.x, t.y, glowR, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
})();
