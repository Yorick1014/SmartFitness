import React, { useEffect, useRef } from "react";

const COLORS = ["#6262df", "#9b9ddb", "#bcbcff", "#7eb8a4", "#c9d4f0", "#e8c98a"];
const BURSTS = 3;
const BURST_GAP = 700;
const BURST_LIFE = 1600;

function spawnBurst(originX, originY, count, born) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35;
    const speed = 2.2 + Math.random() * 3.4;
    return {
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1.2,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.18,
      w: 4 + Math.random() * 4,
      h: 6 + Math.random() * 7,
      color: COLORS[i % COLORS.length],
      alpha: 0.62 + Math.random() * 0.28,
      born,
    };
  });
}

export default function Celebrate({ active = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pieces = [];
    const timers = [];
    const started = performance.now();
    const endAt = BURST_GAP * (BURSTS - 1) + BURST_LIFE + 200;

    function resize() {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener("resize", resize);

    function burstAt(index) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const centers = [
        [w * 0.5, h * 0.38],
        [w * 0.32, h * 0.46],
        [w * 0.68, h * 0.42],
      ];
      const [ox, oy] = centers[index];
      pieces.push(...spawnBurst(ox, oy, 46 + index * 4, performance.now()));
    }

    for (let i = 0; i < BURSTS; i++) {
      timers.push(window.setTimeout(() => burstAt(i), i * BURST_GAP));
    }

    function loop(now) {
      if (!running) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i];
        const age = now - p.born;
        if (age > BURST_LIFE) {
          pieces.splice(i, 1);
          continue;
        }

        const t = age / BURST_LIFE;
        const fade =
          t < 0.12 ? t / 0.12 : t > 0.55 ? Math.max(0, 1 - (t - 0.55) / 0.45) : 1;

        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.045;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha * fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (pieces.length || now - started < endAt) {
        frame = requestAnimationFrame(loop);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }

    frame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
      window.removeEventListener("resize", resize);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="celebrate-canvas"
      aria-hidden="true"
    />
  );
}
