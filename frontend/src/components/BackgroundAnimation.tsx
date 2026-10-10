import React, { useEffect, useRef } from 'react';

interface ContrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
}

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

    // Contrail particles buffer (passenger jet engine vapor trails)
    const contrailParticles: ContrailParticle[] = [];

    // Curated Full-Screen Left-to-Right Commercial Flight Corridors
    // Moving across the FULL SCREEN width from x < 0 to x > width in proper positions
    const routes = [
      {
        id: 'GT-101',
        callsign: 'GT-101 • NYC → LON',
        alt: 'FL360 • 860 km/h',
        // Starts offscreen left (-60px) and flies to offscreen right (+60px)
        y0: 0.18,
        yMid: 0.13,
        y1: 0.22,
        color: '#0D9488', // Teal
        accentColor: '#2DD4BF',
        speed: 0.00075,
        offset: 0.0,
        scale: 1.15
      },
      {
        id: 'GT-204',
        callsign: 'GT-204 • PAR → TYO',
        alt: 'FL390 • 910 km/h',
        y0: 0.44,
        yMid: 0.38,
        y1: 0.48,
        color: '#4F46E5', // Indigo
        accentColor: '#818CF8',
        speed: 0.00065,
        offset: 0.38,
        scale: 1.18
      },
      {
        id: 'GT-308',
        callsign: 'GT-308 • DEL → SYD',
        alt: 'FL340 • 840 km/h',
        y0: 0.76,
        yMid: 0.70,
        y1: 0.80,
        color: '#E11D48', // Coral Red
        accentColor: '#FB7185',
        speed: 0.00072,
        offset: 0.72,
        scale: 1.12
      },
      {
        id: 'GT-412',
        callsign: 'GT-412 • SFO → DXB',
        alt: 'FL410 • 895 km/h',
        y0: 0.31,
        yMid: 0.26,
        y1: 0.34,
        color: '#D97706', // Amber Gold
        accentColor: '#FBBF24',
        speed: 0.00058,
        offset: 0.85,
        scale: 1.14
      }
    ];

    // Helper: draw realistic modern twin-engine commercial airliner
    const drawCommercialAirliner = (
      x: number,
      y: number,
      angle: number,
      color: string,
      accentColor: string,
      scale: number,
      callsign: string,
      alt: string
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scale, scale);

      // Subtle atmospheric jet glow
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 8;

      // 1. Sleek Fuselage
      ctx.beginPath();
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.3;

      // Cockpit nose
      ctx.moveTo(18, 0);
      ctx.quadraticCurveTo(12, 3.2, 4, 3.4);
      // Main fuselage starboard
      ctx.lineTo(-12, 2.6);
      // Starboard horizontal stabilizer
      ctx.lineTo(-16, 8.5);
      ctx.lineTo(-19, 8.5);
      ctx.lineTo(-17, 2.0);
      // Tail cone & fin
      ctx.lineTo(-22, 0);
      // Port horizontal stabilizer
      ctx.lineTo(-17, -2.0);
      ctx.lineTo(-19, -8.5);
      ctx.lineTo(-16, -8.5);
      // Main fuselage port
      ctx.lineTo(-12, -2.6);
      ctx.quadraticCurveTo(12, -3.2, 18, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Swept-back Wings & Winglets
      ctx.beginPath();
      ctx.fillStyle = color;
      // Starboard Wing
      ctx.moveTo(4, 3.0);
      ctx.lineTo(-4, 18.5); // Wing tip
      ctx.lineTo(-7, 18.5); // Winglet
      ctx.lineTo(-8, 17.0);
      ctx.lineTo(-2, 3.0);
      // Port Wing
      ctx.moveTo(4, -3.0);
      ctx.lineTo(-4, -18.5); // Wing tip
      ctx.lineTo(-7, -18.5); // Winglet
      ctx.lineTo(-8, -17.0);
      ctx.lineTo(-2, -3.0);
      ctx.closePath();
      ctx.fill();

      // 3. Twin Jet Engine Turbofans
      // Starboard Engine
      ctx.beginPath();
      ctx.fillStyle = '#334155';
      ctx.roundRect(-2, 7.5, 6, 2.6, 1.2);
      ctx.fill();
      // Port Engine
      ctx.beginPath();
      ctx.roundRect(-2, -10.1, 6, 2.6, 1.2);
      ctx.fill();

      // 4. Engine Jet Exhaust Glow
      ctx.beginPath();
      ctx.fillStyle = accentColor;
      ctx.arc(-2.5, 8.8, 1.4, 0, Math.PI * 2);
      ctx.arc(-2.5, -8.8, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // 5. Red Beacon Warning Light (Pulsing)
      ctx.beginPath();
      ctx.fillStyle = '#EF4444';
      ctx.arc(0, 0, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 6. Flight Telemetry Tag Floating Beside the Aircraft
      // Keep tag horizontally upright (unrotated)
      if (x > 30 && x < width - 60) {
        ctx.save();
        ctx.translate(x + 22, y - 18);

        // Tag capsule pill
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        ctx.strokeStyle = `${color}60`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(0, 0, 118, 22, 6);
        ctx.fill();
        ctx.stroke();

        // Pulsing radar blip
        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(9, 11, 2.8, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 9.5px Inter, system-ui, sans-serif';
        ctx.fillText(callsign, 17, 10);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 8px Inter, system-ui, sans-serif';
        ctx.fillText(alt, 17, 18);

        ctx.restore();
      }
    };

    let time = 0;

    const render = () => {
      // Gentle, serene cruising speed (decreased speed per user request)
      time += 0.0006;
      ctx.clearRect(0, 0, width, height);

      // 1. UPDATE & RENDER CONTRAIL VAPOR PARTICLES
      for (let i = contrailParticles.length - 1; i >= 0; i--) {
        const p = contrailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.0025;
        p.size += 0.035;

        if (p.alpha <= 0) {
          contrailParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * 0.7})`;
        ctx.fill();
      }

      // 2. RENDER FULL-SCREEN FLIGHT CORRIDORS (LEFT TO RIGHT)
      for (const route of routes) {
        // Path spans all the way from offscreen left to offscreen right
        const startX = -80;
        const endX = width + 80;
        const midX = width * 0.5;

        const startY = route.y0 * height;
        const midY = route.yMid * height;
        const endY = route.y1 * height;

        // Quadratic Bezier control point formula: CP = 2 * Mid - 0.5 * (Start + End)
        const cpX = midX;
        const cpY = 2 * midY - 0.5 * (startY + endY);

        // A. Draw Subtle Dashed Cruising Corridor Line Across Entire Screen
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
        ctx.strokeStyle = `${route.color}25`; // Translucent delicate flight line
        ctx.lineWidth = 1.6;
        ctx.setLineDash([5, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // B. Waypoint Radar Nodes along the corridor
        const waypoints = [0.25, 0.5, 0.75];
        for (const wpT of waypoints) {
          const wpMt = 1 - wpT;
          const wpX = wpMt * wpMt * startX + 2 * wpMt * wpT * cpX + wpT * wpT * endX;
          const wpY = wpMt * wpMt * startY + 2 * wpMt * wpT * cpY + wpT * wpT * endY;

          ctx.beginPath();
          ctx.arc(wpX, wpY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `${route.color}50`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(wpX, wpY, 5, 0, Math.PI * 2);
          ctx.strokeStyle = `${route.color}30`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // C. Calculate Aircraft Position t across the full screen width
        // t in [0, 1] as it glides from left to right
        const t = (time * (route.speed / 0.0007) + route.offset) % 1;
        const mt = 1 - t;

        // Quadratic Bezier position:
        const planeX = mt * mt * startX + 2 * mt * t * cpX + t * t * endX;
        const planeY = mt * mt * startY + 2 * mt * t * cpY + t * t * endY;

        // Quadratic Bezier derivative (tangent direction vector):
        const dx = 2 * mt * (cpX - startX) + 2 * t * (endX - cpX);
        const dy = 2 * mt * (cpY - startY) + 2 * t * (endY - cpY);
        const angle = Math.atan2(dy, dx);

        // D. Spawn dual engine contrail vapor particles behind wings
        if (planeX > -40 && planeX < width + 40 && Math.random() < 0.65) {
          const normalX = -Math.sin(angle);
          const normalY = Math.cos(angle);

          // Starboard engine particle
          contrailParticles.push({
            x: planeX - Math.cos(angle) * 12 + normalX * 8,
            y: planeY - Math.sin(angle) * 12 + normalY * 8,
            vx: -Math.cos(angle) * 0.4 + (Math.random() - 0.5) * 0.2,
            vy: -Math.sin(angle) * 0.4 + (Math.random() - 0.5) * 0.2,
            alpha: 0.55,
            size: 2.2,
            color: route.accentColor
          });

          // Port engine particle
          contrailParticles.push({
            x: planeX - Math.cos(angle) * 12 - normalX * 8,
            y: planeY - Math.sin(angle) * 12 - normalY * 8,
            vx: -Math.cos(angle) * 0.4 + (Math.random() - 0.5) * 0.2,
            vy: -Math.sin(angle) * 0.4 + (Math.random() - 0.5) * 0.2,
            alpha: 0.55,
            size: 2.2,
            color: route.accentColor
          });
        }

        // E. Draw Realistic Commercial Airliner
        drawCommercialAirliner(
          planeX,
          planeY,
          angle,
          route.color,
          route.accentColor,
          route.scale,
          route.callsign,
          route.alt
        );
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
      {/* Full-Screen Left-to-Right Commercial Flight Corridors & Airliners */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', opacity: 0.88 }}
      />

      {/* Ambient Gradient Mesh Lighting */}
      <div className="ambient-bg" style={{ pointerEvents: 'none' }}>
        <div className="ambient-blob-1" style={{ opacity: 0.35 }} />
        <div className="ambient-blob-2" style={{ opacity: 0.35 }} />
        <div className="ambient-blob-3" style={{ opacity: 0.35 }} />
      </div>
    </div>
  );
};

export default BackgroundAnimation;
