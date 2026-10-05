import React, { useEffect, useRef, useState } from 'react';

interface Props {
  theme?: 'aurora' | 'cyber-teal' | 'glass-light';
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface ContrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
}

export const AdminPlaneRadarBackground: React.FC<Props> = ({ theme = 'glass-light' }) => {
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

    const isLight = theme === 'glass-light';
    const primaryColor = isLight ? '#0D9488' : '#2DD4BF';
    const secondaryColor = isLight ? '#2563EB' : '#60A5FA';
    const accentColor = isLight ? '#E11D48' : '#F43F5E';
    const emeraldColor = isLight ? '#059669' : '#34D399';
    const gridLineColor = isLight ? 'rgba(13, 148, 136, 0.05)' : 'rgba(45, 212, 191, 0.06)';

    // Passenger engine contrail particle buffer (smooth white vapor trails)
    const contrailParticles: ContrailParticle[] = [];

    // Curated Commercial Passenger Airliner Routes Spanning Across the FULL Admin Panel
    // Flying at medium, majestic cruising speed
    const flightRoutes = [
      {
        id: 'GT-101',
        callsign: 'Trovio 101 Heavy',
        aircraft: 'Boeing 787-9 Dreamliner',
        origin: 'JFK (New York)',
        dest: 'LHR (London)',
        p0: { rx: 0.08, ry: 0.18 },
        cp1: { rx: 0.28, ry: 0.06 },
        cp2: { rx: 0.52, ry: 0.28 },
        p1: { rx: 0.72, ry: 0.12 },
        color: primaryColor,
        speed: 0.00095, // Medium cruising speed
        offset: 0.0,
        scale: 1.15
      },
      {
        id: 'GT-204',
        callsign: 'AirTrovio 204',
        aircraft: 'Airbus A350-900',
        origin: 'CDG (Paris)',
        dest: 'HND (Tokyo)',
        p0: { rx: 0.35, ry: 0.14 },
        cp1: { rx: 0.55, ry: 0.36 },
        cp2: { rx: 0.78, ry: 0.08 },
        p1: { rx: 0.94, ry: 0.30 },
        color: secondaryColor,
        speed: 0.00085, // Medium cruising speed
        offset: 0.42,
        scale: 1.12
      },
      {
        id: 'GT-308',
        callsign: 'GlobalTrotter 308',
        aircraft: 'Boeing 777-300ER',
        origin: 'DEL (New Delhi)',
        dest: 'SYD (Sydney)',
        p0: { rx: 0.10, ry: 0.52 },
        cp1: { rx: 0.34, ry: 0.36 },
        cp2: { rx: 0.65, ry: 0.85 },
        p1: { rx: 0.88, ry: 0.68 },
        color: accentColor,
        speed: 0.00105, // Medium cruising speed
        offset: 0.75,
        scale: 1.18
      },
      {
        id: 'GT-415',
        callsign: 'PacificVoyager 415',
        aircraft: 'Airbus A330neo',
        origin: 'DXB (Dubai)',
        dest: 'SIN (Singapore)',
        p0: { rx: 0.22, ry: 0.78 },
        cp1: { rx: 0.46, ry: 0.58 },
        cp2: { rx: 0.72, ry: 0.88 },
        p1: { rx: 0.95, ry: 0.66 },
        color: emeraldColor,
        speed: 0.00090, // Medium cruising speed
        offset: 0.22,
        scale: 1.10
      }
    ];

    // Helper: 3D point rotation with Pitch, Yaw, and Roll (Natural airliner banking)
    const rotate3D = (
      p: Point3D,
      yaw: number,
      pitch: number,
      roll: number,
      scale: number = 1
    ): Point3D => {
      const sx = p.x * scale;
      const sy = p.y * scale;
      const sz = p.z * scale;

      // 1. Roll around X axis (gentle banking during turns)
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);
      const y1 = sy * cosR - sz * sinR;
      const z1 = sy * sinR + sz * cosR;
      const x1 = sx;

      // 2. Pitch around Y axis (subtle climb/descent)
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);
      const x2 = x1 * cosP + z1 * sinP;
      const z2 = -x1 * sinP + z1 * cosP;
      const y2 = y1;

      // 3. Yaw around Z axis (heading trajectory)
      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const X = x2 * cosY - y2 * sinY;
      const Y = x2 * sinY + y2 * cosY;
      const Z = z2;

      return { x: X, y: Y, z: Z };
    };

    // Project 3D point onto 2D canvas with isometric perspective
    const project = (
      p: Point3D,
      centerX: number,
      centerY: number
    ): { x: number; y: number } => {
      return {
        x: centerX + p.x,
        y: centerY + p.y - p.z * 0.42
      };
    };

    // =========================================================================
    // Draw 3D COMMERCIAL TRAVELER AIRLINER (Boeing 787 / Airbus A350 passenger jet)
    // Commercial traveler aircraft: cylindrical passenger cabin, cabin windows,
    // swept wings with winglets, twin under-wing turbofans, tall vertical stabilizer.
    // =========================================================================
    const draw3DTravelerAirliner = (
      centerX: number,
      centerY: number,
      yaw: number,
      pitch: number,
      roll: number,
      airlineColor: string,
      scale: number,
      time: number
    ) => {
      ctx.save();

      // 1. Soft Aircraft Ground Shadow
      const shadowAlt = 16;
      ctx.beginPath();
      const sNose = project(rotate3D({ x: 22, y: 0, z: -shadowAlt }, yaw, pitch, roll * 0.3, scale), centerX + 6, centerY + 10);
      const sWingL = project(rotate3D({ x: -2, y: -24, z: -shadowAlt }, yaw, pitch, roll * 0.3, scale), centerX + 6, centerY + 10);
      const sTail = project(rotate3D({ x: -20, y: 0, z: -shadowAlt }, yaw, pitch, roll * 0.3, scale), centerX + 6, centerY + 10);
      const sWingR = project(rotate3D({ x: -2, y: 24, z: -shadowAlt }, yaw, pitch, roll * 0.3, scale), centerX + 6, centerY + 10);

      ctx.moveTo(sNose.x, sNose.y);
      ctx.lineTo(sWingR.x, sWingR.y);
      ctx.lineTo(sTail.x, sTail.y);
      ctx.lineTo(sWingL.x, sWingL.y);
      ctx.closePath();
      ctx.fillStyle = isLight ? 'rgba(15, 23, 42, 0.06)' : 'rgba(0, 0, 0, 0.18)';
      ctx.fill();

      // 2. Commercial Passenger Airliner Vertices
      const vNose = project(rotate3D({ x: 23, y: 0, z: 0 }, yaw, pitch, roll, scale), centerX, centerY);
      const vCockpitTop = project(rotate3D({ x: 15, y: 0, z: 2.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vSpineMid = project(rotate3D({ x: 2, y: 0, z: 2.8 }, yaw, pitch, roll, scale), centerX, centerY);
      const vBellyMid = project(rotate3D({ x: 2, y: 0, z: -2.8 }, yaw, pitch, roll, scale), centerX, centerY);
      const vTailTip = project(rotate3D({ x: -20, y: 0, z: 0.5 }, yaw, pitch, roll, scale), centerX, centerY);

      // Swept Passenger Wings with commercial upward dihedral
      const vWingRootFrontL = project(rotate3D({ x: 6, y: -3.2, z: -0.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vWingRootRearL = project(rotate3D({ x: -6, y: -3.2, z: -0.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vWingTipL = project(rotate3D({ x: -5, y: -26, z: 2.6 }, yaw, pitch, roll, scale), centerX, centerY);
      const vWingletL = project(rotate3D({ x: -7, y: -26.5, z: 6.2 }, yaw, pitch, roll, scale), centerX, centerY);

      const vWingRootFrontR = project(rotate3D({ x: 6, y: 3.2, z: -0.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vWingRootRearR = project(rotate3D({ x: -6, y: 3.2, z: -0.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vWingTipR = project(rotate3D({ x: -5, y: 26, z: 2.6 }, yaw, pitch, roll, scale), centerX, centerY);
      const vWingletR = project(rotate3D({ x: -7, y: 26.5, z: 6.2 }, yaw, pitch, roll, scale), centerX, centerY);

      // Twin Under-Wing Turbofan Pod Engines (Suspended on pylons beneath the wings)
      const vEngineL = project(rotate3D({ x: 3, y: -10.5, z: -3.0 }, yaw, pitch, roll, scale), centerX, centerY);
      const vEngineR = project(rotate3D({ x: 3, y: 10.5, z: -3.0 }, yaw, pitch, roll, scale), centerX, centerY);
      const vExhaustL = project(rotate3D({ x: -4, y: -10.5, z: -3.0 }, yaw, pitch, roll, scale), centerX, centerY);
      const vExhaustR = project(rotate3D({ x: -4, y: 10.5, z: -3.0 }, yaw, pitch, roll, scale), centerX, centerY);

      // Commercial Vertical Stabilizer & Horizontal Tailplanes
      const vFinTip = project(rotate3D({ x: -20, y: 0, z: 11.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vFinBase = project(rotate3D({ x: -12, y: 0, z: 2.2 }, yaw, pitch, roll, scale), centerX, centerY);
      const vTailL = project(rotate3D({ x: -18, y: -9.5, z: 1.5 }, yaw, pitch, roll, scale), centerX, centerY);
      const vTailR = project(rotate3D({ x: -18, y: 9.5, z: 1.5 }, yaw, pitch, roll, scale), centerX, centerY);

      // Emit smooth white contrails from twin under-wing turbofans (NO flame afterburners)
      if (Math.random() < 0.6) {
        contrailParticles.push({
          x: vExhaustL.x,
          y: vExhaustL.y,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: 0.5,
          size: Math.random() * 2.2 + 1.6
        });
        contrailParticles.push({
          x: vExhaustR.x,
          y: vExhaustR.y,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          alpha: 0.5,
          size: Math.random() * 2.2 + 1.6
        });
      }

      // Draw Left Wing (Port) with clean commercial livery
      ctx.beginPath();
      ctx.moveTo(vWingRootFrontL.x, vWingRootFrontL.y);
      ctx.lineTo(vWingTipL.x, vWingTipL.y);
      ctx.lineTo(vWingletL.x, vWingletL.y);
      ctx.lineTo(vWingRootRearL.x, vWingRootRearL.y);
      ctx.closePath();
      const gradWingL = ctx.createLinearGradient(vWingRootFrontL.x, vWingRootFrontL.y, vWingTipL.x, vWingTipL.y);
      gradWingL.addColorStop(0, isLight ? '#E2E8F0' : '#334155');
      gradWingL.addColorStop(0.7, isLight ? '#F1F5F9' : '#1E293B');
      gradWingL.addColorStop(1, airlineColor); // Wingtip livery accent
      ctx.fillStyle = gradWingL;
      ctx.fill();
      ctx.strokeStyle = isLight ? '#CBD5E1' : '#475569';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Draw Right Wing (Starboard)
      ctx.beginPath();
      ctx.moveTo(vWingRootFrontR.x, vWingRootFrontR.y);
      ctx.lineTo(vWingTipR.x, vWingTipR.y);
      ctx.lineTo(vWingletR.x, vWingletR.y);
      ctx.lineTo(vWingRootRearR.x, vWingRootRearR.y);
      ctx.closePath();
      const gradWingR = ctx.createLinearGradient(vWingRootFrontR.x, vWingRootFrontR.y, vWingTipR.x, vWingTipR.y);
      gradWingR.addColorStop(0, isLight ? '#E2E8F0' : '#334155');
      gradWingR.addColorStop(0.7, isLight ? '#F8FAFC' : '#1E293B');
      gradWingR.addColorStop(1, airlineColor);
      ctx.fillStyle = gradWingR;
      ctx.fill();
      ctx.stroke();

      // Draw Horizontal Stabilizers (Rear Tailplanes)
      ctx.beginPath();
      ctx.moveTo(vTailTip.x, vTailTip.y);
      ctx.lineTo(vTailL.x, vTailL.y);
      ctx.lineTo(vTailTip.x - 3, vTailTip.y);
      ctx.lineTo(vTailR.x, vTailR.y);
      ctx.closePath();
      ctx.fillStyle = isLight ? '#CBD5E1' : '#334155';
      ctx.fill();
      ctx.strokeStyle = isLight ? '#94A3B8' : '#475569';
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Draw Twin Turbofan Pod Engines (under the wings)
      // Left Turbofan Pod
      ctx.beginPath();
      ctx.ellipse(vEngineL.x, vEngineL.y, 3.8 * scale, 2.6 * scale, yaw, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#475569' : '#0F172A';
      ctx.fill();
      ctx.strokeStyle = isLight ? '#0D9488' : '#2DD4BF';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(vEngineL.x, vEngineL.y, 1.4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#0D9488' : '#2DD4BF';
      ctx.fill();

      // Right Turbofan Pod
      ctx.beginPath();
      ctx.ellipse(vEngineR.x, vEngineR.y, 3.8 * scale, 2.6 * scale, yaw, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#475569' : '#0F172A';
      ctx.fill();
      ctx.strokeStyle = isLight ? '#0D9488' : '#2DD4BF';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(vEngineR.x, vEngineR.y, 1.4 * scale, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? '#0D9488' : '#2DD4BF';
      ctx.fill();

      // Draw Cylindrical Commercial Passenger Fuselage
      ctx.beginPath();
      ctx.moveTo(vNose.x, vNose.y);
      ctx.quadraticCurveTo(vCockpitTop.x + 2, vCockpitTop.y - 1, vSpineMid.x, vSpineMid.y);
      ctx.lineTo(vTailTip.x, vTailTip.y);
      ctx.quadraticCurveTo(vBellyMid.x - 1, vBellyMid.y + 1, vNose.x, vNose.y);
      ctx.closePath();
      const gradFuselage = ctx.createLinearGradient(vNose.x, vNose.y, vTailTip.x, vTailTip.y);
      gradFuselage.addColorStop(0, '#FFFFFF'); // Clean white passenger airliner body
      gradFuselage.addColorStop(0.3, isLight ? '#FFFFFF' : '#F1F5F9');
      gradFuselage.addColorStop(0.7, isLight ? '#F1F5F9' : '#CBD5E1');
      gradFuselage.addColorStop(1, isLight ? '#E2E8F0' : '#94A3B8');
      ctx.fillStyle = gradFuselage;
      ctx.shadowColor = isLight ? 'rgba(13, 148, 136, 0.2)' : airlineColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isLight ? '#CBD5E1' : '#64748B';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Commercial Cockpit Windshield
      ctx.beginPath();
      const vCockpitWindow = project(rotate3D({ x: 17, y: 0, z: 1.8 }, yaw, pitch, roll, scale), centerX, centerY);
      ctx.moveTo(vNose.x * 0.3 + vCockpitWindow.x * 0.7, vNose.y * 0.3 + vCockpitWindow.y * 0.7);
      ctx.lineTo(vCockpitTop.x, vCockpitTop.y);
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 2.4 * scale;
      ctx.stroke();

      // Commercial Passenger Windows (Row of lit cabin windows along the fuselage)
      const windowCount = 7;
      for (let w = 0; w < windowCount; w++) {
        const winX = 12 - w * 3.8;
        const ptWinL = project(rotate3D({ x: winX, y: -2.2, z: 0.4 }, yaw, pitch, roll, scale), centerX, centerY);
        const ptWinR = project(rotate3D({ x: winX, y: 2.2, z: 0.4 }, yaw, pitch, roll, scale), centerX, centerY);

        ctx.beginPath();
        ctx.arc(ptWinL.x, ptWinL.y, 0.9 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(ptWinR.x, ptWinR.y, 0.9 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#0F172A';
        ctx.fill();
      }

      // Tall Commercial Vertical Tail Fin (with Airline Livery Color)
      ctx.beginPath();
      ctx.moveTo(vFinBase.x, vFinBase.y);
      ctx.lineTo(vFinTip.x, vFinTip.y);
      ctx.lineTo(vTailTip.x, vTailTip.y);
      ctx.closePath();
      const gradFin = ctx.createLinearGradient(vFinBase.x, vFinBase.y, vFinTip.x, vFinTip.y);
      gradFin.addColorStop(0, isLight ? '#0D9488' : '#0F766E');
      gradFin.addColorStop(0.5, airlineColor);
      gradFin.addColorStop(1, isLight ? '#14B8A6' : '#2DD4BF');
      ctx.fillStyle = gradFin;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Commercial Navigation Lights
      // Port Red Wingtip Light
      ctx.beginPath();
      ctx.arc(vWingletL.x, vWingletL.y, 2.0 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#EF4444';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Starboard Green Wingtip Light
      ctx.beginPath();
      ctx.arc(vWingletR.x, vWingletR.y, 2.0 * scale, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Flashing White Anti-Collision Strobe (Tail Fin & Spine)
      const strobeOn = Math.sin(time * 10) > 0.72;
      if (strobeOn) {
        ctx.beginPath();
        ctx.arc(vFinTip.x, vFinTip.y, 2.4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 10;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(vSpineMid.x, vSpineMid.y, 2.0 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      ctx.restore();
    };

    // Draw clean aeronautical waypoint node
    const drawWaypoint = (x: number, y: number, code: string, color: string, pulse: number) => {
      ctx.save();
      ctx.translate(x, y);

      // Radar pulse ring
      ctx.beginPath();
      ctx.arc(0, 0, 3 + pulse * 9, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = Math.max(0, 0.65 - pulse * 0.65);
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Solid core
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Center white dot
      ctx.beginPath();
      ctx.arc(0, 0, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // City Code Tag with high readability
      ctx.font = '700 10px monospace';
      ctx.fillStyle = isLight ? '#0F172A' : '#F8FAFC';
      ctx.fillText(code, 7, 3.5);

      ctx.restore();
    };

    let time = 0;

    const render = () => {
      // Smooth medium flight progression
      time += 0.0009;
      ctx.clearRect(0, 0, width, height);

      // 1. Subtle Airspace Cartesian Grid Lines across the full viewport
      ctx.save();
      ctx.strokeStyle = gridLineColor;
      ctx.lineWidth = 0.6;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Airspace Radar Sweep Concentric Rings in top right of screen
      const radarCenterX = width - 110;
      const radarCenterY = 75;
      ctx.save();
      ctx.globalAlpha = isLight ? 0.06 : 0.10;
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1;
      for (const r of [35, 70, 105, 140]) {
        ctx.beginPath();
        ctx.arc(radarCenterX, radarCenterY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Sweep Line
      const sweepAngle = time * 1.8;
      ctx.beginPath();
      ctx.moveTo(radarCenterX, radarCenterY);
      ctx.lineTo(
        radarCenterX + Math.cos(sweepAngle) * 140,
        radarCenterY + Math.sin(sweepAngle) * 140
      );
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // 3. Render White Condensation Contrails (Passenger Turbofans)
      for (let i = contrailParticles.length - 1; i >= 0; i--) {
        const p = contrailParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.008;
        p.size += 0.05;

        if (p.alpha <= 0) {
          contrailParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isLight ? 'rgba(13, 148, 136, 0.3)' : 'rgba(255, 255, 255, 0.55)';
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }

      // 4. Render Flight Routes and 3D Commercial Traveler Airliners
      for (const route of flightRoutes) {
        const p0 = { x: route.p0.rx * width, y: route.p0.ry * height };
        const cp1 = { x: route.cp1.rx * width, y: route.cp1.ry * height };
        const cp2 = { x: route.cp2.rx * width, y: route.cp2.ry * height };
        const p1 = { x: route.p1.rx * width, y: route.p1.ry * height };

        // Subtle, elegant flight trajectory arc across the screen
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p1.x, p1.y);
        ctx.strokeStyle = `${route.color}${isLight ? '32' : '40'}`;
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 7]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Waypoint nodes
        const pulse = (time * 1.4 + route.offset) % 1;
        drawWaypoint(p0.x, p0.y, route.origin, route.color, pulse);
        drawWaypoint(p1.x, p1.y, route.dest, route.color, (pulse + 0.5) % 1);

        // Compute current 3D position along Cubic Bezier:
        const t = (time * (route.speed / 0.0009) + route.offset) % 1;
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

        // Tangent velocity vector (B'(t))
        const dx =
          3 * mt * mt * (cp1.x - p0.x) +
          6 * mt * t * (cp2.x - cp1.x) +
          3 * t * t * (p1.x - cp2.x);

        const dy =
          3 * mt * mt * (cp1.y - p0.y) +
          6 * mt * t * (cp2.y - cp1.y) +
          3 * t * t * (p1.y - cp2.y);

        // Second derivative for banking curvature
        const d2x =
          6 * mt * (cp2.x - 2 * cp1.x + p0.x) +
          6 * t * (p1.x - 2 * cp2.x + cp1.x);

        const d2y =
          6 * mt * (cp2.y - 2 * cp1.y + p0.y) +
          6 * t * (p1.y - 2 * cp2.y + cp1.y);

        // Yaw angle (flight heading)
        const yaw = Math.atan2(dy, dx);

        // Gentle commercial banking into curves
        const denom = Math.pow(dx * dx + dy * dy, 1.5);
        const curvature = denom > 0.0001 ? (dx * d2y - dy * d2x) / denom : 0;
        const roll = Math.max(-0.48, Math.min(0.48, curvature * 200));

        // Pitch angle based on vertical movement
        const pitch = Math.max(-0.2, Math.min(0.2, -dy / Math.sqrt(dx * dx + dy * dy) * 0.25));

        // Render 3D Commercial Traveler Passenger Airliner
        draw3DTravelerAirliner(planeX, planeY, yaw, pitch, roll, route.color, route.scale, time);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          opacity: theme === 'glass-light' ? 0.85 : 0.95
        }}
      />
    </div>
  );
};
