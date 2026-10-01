import React, { useEffect, useRef } from 'react';

export const BackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Multiple flight paths inspired by Screenshot 2 (dashed curves, loops, S-curves)
    const routes = [
      {
        p0: { rx: 0.05, ry: 0.28 },
        cp1: { rx: 0.18, ry: 0.08 },
        cp2: { rx: 0.38, ry: 0.45 },
        p1: { rx: 0.52, ry: 0.2 },
        color: '#0D9488',
        speed: 0.0035,
        offset: 0
      },
      {
        p0: { rx: 0.45, ry: 0.18 },
        cp1: { rx: 0.65, ry: 0.05 },
        cp2: { rx: 0.85, ry: 0.35 },
        p1: { rx: 0.95, ry: 0.15 },
        color: '#4F46E5',
        speed: 0.003,
        offset: 0.4
      },
      {
        p0: { rx: 0.08, ry: 0.72 },
        cp1: { rx: 0.28, ry: 0.52 },
        cp2: { rx: 0.48, ry: 0.95 },
        p1: { rx: 0.68, ry: 0.65 },
        color: '#E11D48',
        speed: 0.0038,
        offset: 0.7
      },
      {
        p0: { rx: 0.32, ry: 0.5 },
        cp1: { rx: 0.52, ry: 0.3 },
        cp2: { rx: 0.75, ry: 0.7 },
        p1: { rx: 0.92, ry: 0.55 },
        color: '#D97706',
        speed: 0.0032,
        offset: 0.2
      },
      {
        p0: { rx: 0.62, ry: 0.85 },
        cp1: { rx: 0.78, ry: 0.68 },
        cp2: { rx: 0.88, ry: 0.95 },
        p1: { rx: 0.96, ry: 0.78 },
        color: '#059669',
        speed: 0.004,
        offset: 0.55
      }
    ];

    // Helper: draw cute map pin marker
    const drawMapPin = (x: number, y: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);

      // Pin head
      ctx.beginPath();
      ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Pin center dot
      ctx.beginPath();
      ctx.arc(0, -6, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Pin stem
      ctx.beginPath();
      ctx.moveTo(0, -2.5);
      ctx.lineTo(0, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.4;
      ctx.stroke();

      ctx.restore();
    };

    // Helper: draw sleek airplane silhouette rotated along trajectory tangent
    const drawAirplane = (x: number, y: number, angle: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Plane shadow/glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
      ctx.fillStyle = color;

      // Realistic airplane silhouette (fuselage, wings, tail)
      ctx.beginPath();
      // Nose
      ctx.moveTo(11, 0);
      // Right fuselage
      ctx.lineTo(2, 3);
      // Right main wing
      ctx.lineTo(-2, 10);
      ctx.lineTo(-4.5, 10);
      ctx.lineTo(-2, 3);
      // Rear fuselage
      ctx.lineTo(-7, 2.5);
      // Right tail wing
      ctx.lineTo(-10, 6);
      ctx.lineTo(-11.5, 6);
      ctx.lineTo(-9.5, 1.5);
      // Tail fin tip
      ctx.lineTo(-11, 0);
      // Left tail wing
      ctx.lineTo(-9.5, -1.5);
      ctx.lineTo(-11.5, -6);
      ctx.lineTo(-10, -6);
      ctx.lineTo(-7, -2.5);
      // Left main wing
      ctx.lineTo(-2, -3);
      ctx.lineTo(-4.5, -10);
      ctx.lineTo(-2, -10);
      ctx.lineTo(2, -3);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    let time = 0;

    const render = () => {
      time += 0.003;
      ctx.clearRect(0, 0, width, height);

      // Render each flight trajectory with dashed curves and moving airplane
      for (const route of routes) {
        const p0 = { x: route.p0.rx * width, y: route.p0.ry * height };
        const cp1 = { x: route.cp1.rx * width, y: route.cp1.ry * height };
        const cp2 = { x: route.cp2.rx * width, y: route.cp2.ry * height };
        const p1 = { x: route.p1.rx * width, y: route.p1.ry * height };

        // 1. Draw dashed bezier curve flight trail
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p1.x, p1.y);
        ctx.strokeStyle = `${route.color}35`; // delicate translucent dashed line
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. Draw map pin icons at origin & destination
        drawMapPin(p0.x, p0.y, `${route.color}88`);
        drawMapPin(p1.x, p1.y, `${route.color}88`);

        // 3. Compute current airplane position t in [0, 1]
        const rawT = (time * (route.speed / 0.003) + route.offset) % 1;
        // Cubic Bezier position formula:
        // B(t) = (1-t)^3 P0 + 3(1-t)^2 t CP1 + 3(1-t) t^2 CP2 + t^3 P1
        const t = rawT;
        const mt = 1 - t;

        const planeX =
          mt * mt * mt * p0.x +
          3 * mt * mt * t * cp1.x +
          3 * mt * t * t * cp2.x +
          t * t * t * p1.x;

        const planeY =
          mt * mt * mt * p0.y +
          3 * mt * mt * t * cp1.y +
          3 * mt * t * t * cp2.y +
          t * t * t * p1.y;

        // Derivative (tangent velocity vector):
        // B'(t) = 3(1-t)^2 (CP1 - P0) + 6(1-t)t (CP2 - CP1) + 3t^2 (P1 - CP2)
        const dx =
          3 * mt * mt * (cp1.x - p0.x) +
          6 * mt * t * (cp2.x - cp1.x) +
          3 * t * t * (p1.x - cp2.x);

        const dy =
          3 * mt * mt * (cp1.y - p0.y) +
          6 * mt * t * (cp2.y - cp1.y) +
          3 * t * t * (p1.y - cp2.y);

        const angle = Math.atan2(dy, dx);

        // 4. Draw Airplane Silhouette flying along the dashed curve
        drawAirplane(planeX, planeY, angle, route.color);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      {/* Background Animated Flight Arcs & Airplanes */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', opacity: 0.85 }}
      />

      {/* Ambient Gradient Mesh */}
      <div className="ambient-bg">
        <div className="ambient-blob-1" style={{ opacity: 0.5 }} />
        <div className="ambient-blob-2" style={{ opacity: 0.5 }} />
        <div className="ambient-blob-3" style={{ opacity: 0.5 }} />
      </div>
    </div>
  );
};
