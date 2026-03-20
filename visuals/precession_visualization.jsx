import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// THE PRECESSION OF THE CONE AXIS
// A complete visualization of the mechanism:
// - Two perpendicular unit rotators with 90° phase delay
// - The cone normal (cross product) and its precession
// - The elliptic band on the unit sphere
// - Magnitude oscillation between √3/2 and 1
// - The 45° precession axis
// - The 35.26° to 45° angular band
// ============================================================

export default function PrecessionVisualization() {
  const canvasRef = useRef(null);
  const [alpha, setAlpha] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.4);
  const [viewRotX, setViewRotX] = useState(-20);
  const [viewRotY, setViewRotY] = useState(30);
  const [showTrail, setShowTrail] = useState(true);
  const [showBand, setShowBand] = useState(true);
  const [showMagnitude, setShowMagnitude] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const animRef = useRef(null);
  const dragRef = useRef(null);

  // Mouse/touch drag for orbit
  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, rx: viewRotX, ry: viewRotY };
  }, [viewRotX, viewRotY]);
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    setViewRotY(dragRef.current.ry + (e.clientX - dragRef.current.x) * 0.3);
    setViewRotX(Math.max(-89, Math.min(89, dragRef.current.rx + (e.clientY - dragRef.current.y) * 0.3)));
  }, []);
  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  // Animation loop
  useEffect(() => {
    if (!playing) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const tick = () => {
      setAlpha(prev => { const n = prev + speed; return n >= 360 ? n - 360 : n; });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, speed]);

  // 3D projection
  const project = useCallback((x, y, z, scale = 1) => {
    const ry = (viewRotY * Math.PI) / 180;
    const x1 = x * Math.cos(ry) + z * Math.sin(ry);
    const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
    const rx = (viewRotX * Math.PI) / 180;
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
    const fov = 550;
    const s = (fov / (fov + z2 + 250)) * scale;
    return { x: x1 * s, y: -y1 * s, depth: z2 };
  }, [viewRotX, viewRotY]);

  // Main render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = 150; // base radius for display

    ctx.fillStyle = "#08080e";
    ctx.fillRect(0, 0, W, H);

    const p3d = (x, y, z) => {
      const p = project(x, y, z);
      return { x: cx + p.x, y: cy + p.y, d: p.depth };
    };

    const line3d = (x1,y1,z1, x2,y2,z2, color, width) => {
      const a = p3d(x1,y1,z1);
      const b = p3d(x2,y2,z2);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width || 1;
      ctx.stroke();
    };

    const aRad = (alpha * Math.PI) / 180;

    // Compute current state
    const v1 = [Math.cos(aRad), Math.sin(aRad), 0];
    const v2 = [Math.sin(aRad), 0, -Math.cos(aRad)];
    
    // Cross product n = v1 × v2
    const nx = v1[1]*v2[2] - v1[2]*v2[1]; // sin α · (-cos α) - 0
    const ny = v1[2]*v2[0] - v1[0]*v2[2]; // 0 - cos α · (-cos α) = cos²α
    const nz = v1[0]*v2[1] - v1[1]*v2[0]; // cos α · 0 - sin α · sin α = -sin²α
    const nMag = Math.sqrt(nx*nx + ny*ny + nz*nz);
    const nHatX = nMag > 0.01 ? nx/nMag : 0;
    const nHatY = nMag > 0.01 ? ny/nMag : 0;
    const nHatZ = nMag > 0.01 ? nz/nMag : 0;

    // The precession axis: (0, 1/√2, -1/√2)
    const pAxisY = 1/Math.sqrt(2);
    const pAxisZ = -1/Math.sqrt(2);

    // Angular distance from precession axis
    const dotWithAxis = nHatY * pAxisY + nHatZ * pAxisZ;
    const angFromAxis = Math.acos(Math.min(1, Math.max(-1, dotWithAxis)));

    // --- DRAW THE UNIT SPHERE (wireframe) ---
    ctx.globalAlpha = 0.08;
    for (let lat = -75; lat <= 75; lat += 15) {
      ctx.beginPath();
      let first = true;
      for (let lon = 0; lon <= 360; lon += 3) {
        const th = (90 - lat) * Math.PI / 180;
        const ph = lon * Math.PI / 180;
        const sx = R * Math.sin(th) * Math.cos(ph);
        const sy = R * Math.cos(th);
        const sz = R * Math.sin(th) * Math.sin(ph);
        const p = p3d(sx, sy, sz);
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "#334";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    for (let lon = 0; lon < 180; lon += 15) {
      ctx.beginPath();
      let first = true;
      for (let lat = -90; lat <= 90; lat += 3) {
        const th = (90 - lat) * Math.PI / 180;
        const ph = lon * Math.PI / 180;
        const sx = R * Math.sin(th) * Math.cos(ph);
        const sy = R * Math.cos(th);
        const sz = R * Math.sin(th) * Math.sin(ph);
        const p = p3d(sx, sy, sz);
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = "#334";
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // --- DRAW THE ELLIPTIC PRECESSION BAND ---
    if (showBand) {
      // Draw the band boundaries: circles at 35.26° and 45° from precession axis
      for (const [bandAngle, color, label] of [
        [35.264, "rgba(255,140,50,0.35)", "35.26°"],
        [45.0, "rgba(255,80,80,0.35)", "45°"]
      ]) {
        const bRad = bandAngle * Math.PI / 180;
        ctx.beginPath();
        let first = true;
        for (let t = 0; t <= 360; t += 2) {
          const tRad = t * Math.PI / 180;
          // Point on a circle at angle bRad from the precession axis (0, pAxisY, pAxisZ)
          // Build orthonormal frame: e3 = precession axis, e1, e2 perpendicular
          const e3y = pAxisY, e3z = pAxisZ;
          const e1x = 1, e1y = 0, e1z = 0;
          const e2x = 0, e2y = -pAxisZ, e2z = pAxisY; // e3 × e1
          
          const px = R * (Math.sin(bRad) * (Math.cos(tRad) * e1x + Math.sin(tRad) * e2x) + Math.cos(bRad) * 0);
          const py = R * (Math.sin(bRad) * (Math.cos(tRad) * e1y + Math.sin(tRad) * e2y) + Math.cos(bRad) * e3y);
          const pz = R * (Math.sin(bRad) * (Math.cos(tRad) * e1z + Math.sin(tRad) * e2z) + Math.cos(bRad) * e3z);
          
          const pt = p3d(px, py, pz);
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      
      // Fill the band between the two circles
      ctx.globalAlpha = 0.06;
      for (let t = 0; t < 360; t += 4) {
        const tRad = t * Math.PI / 180;
        const tRad2 = (t + 4) * Math.PI / 180;
        const e1x = 1, e1y = 0, e1z = 0;
        const e2x = 0, e2y = -pAxisZ, e2z = pAxisY;
        
        for (const bDeg of [35.264, 37, 39, 41, 43, 45]) {
          const bRad = bDeg * Math.PI / 180;
          const p1x = R * Math.sin(bRad) * (Math.cos(tRad) * e1x + Math.sin(tRad) * e2x);
          const p1y = R * (Math.sin(bRad) * (Math.cos(tRad) * e1y + Math.sin(tRad) * e2y) + Math.cos(bRad) * pAxisY);
          const p1z = R * (Math.sin(bRad) * (Math.cos(tRad) * e1z + Math.sin(tRad) * e2z) + Math.cos(bRad) * pAxisZ);
          
          const pt = p3d(p1x, p1y, p1z);
          ctx.fillStyle = bDeg < 40 ? "rgba(255,140,50,0.15)" : "rgba(255,80,80,0.15)";
          ctx.fillRect(pt.x - 1, pt.y - 1, 2, 2);
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // --- DRAW THE PRECESSION TRAIL ---
    if (showTrail) {
      ctx.beginPath();
      let first = true;
      const trailSteps = 360;
      for (let i = 0; i <= trailSteps; i++) {
        const ta = (i / trailSteps) * Math.PI; // half rotation = one precession period
        const tnx = -0.5 * Math.sin(2*ta);
        const tny = 0.5 * (1 + Math.cos(2*ta));
        const tnz = -0.5 * (1 - Math.cos(2*ta));
        const tmag = Math.sqrt(tnx*tnx + tny*tny + tnz*tnz);
        if (tmag > 0.01) {
          const px = R * tnx / tmag;
          const py = R * tny / tmag;
          const pz = R * tnz / tmag;
          const pt = p3d(px, py, pz);
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.strokeStyle = "#06d6a0";
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw the SECOND half (which retraces the same path — period π)
      ctx.beginPath();
      first = true;
      for (let i = 0; i <= trailSteps; i++) {
        const ta = Math.PI + (i / trailSteps) * Math.PI;
        const tnx = -0.5 * Math.sin(2*ta);
        const tny = 0.5 * (1 + Math.cos(2*ta));
        const tnz = -0.5 * (1 - Math.cos(2*ta));
        const tmag = Math.sqrt(tnx*tnx + tny*tny + tnz*tnz);
        if (tmag > 0.01) {
          const px = R * tnx / tmag;
          const py = R * tny / tmag;
          const pz = R * tnz / tmag;
          const pt = p3d(px, py, pz);
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else ctx.lineTo(pt.x, pt.y);
        }
      }
      ctx.strokeStyle = "rgba(6,214,160,0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // --- DRAW COORDINATE AXES ---
    const axLen = R * 1.3;
    line3d(-axLen,0,0, axLen,0,0, "rgba(255,255,255,0.3)", 1);
    line3d(0,-axLen,0, 0,axLen,0, "rgba(255,255,255,0.2)", 1);
    line3d(0,0,-axLen, 0,0,axLen, "rgba(255,255,255,0.2)", 1);
    
    ["X","Y","Z"].forEach((l, i) => {
      const coords = [0,0,0]; coords[i] = axLen * 1.05;
      const lp = p3d(coords[0], coords[1], coords[2]);
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "bold 11px 'Courier New', monospace";
      ctx.fillText(l, lp.x + 4, lp.y - 4);
    });

    // --- DRAW PRECESSION AXIS ---
    line3d(0, -R*1.2*pAxisY, -R*1.2*pAxisZ, 0, R*1.2*pAxisY, R*1.2*pAxisZ, 
           "rgba(255,200,50,0.5)", 1.5);
    const pTip = p3d(0, R*1.15*pAxisY, R*1.15*pAxisZ);
    ctx.fillStyle = "rgba(255,200,50,0.7)";
    ctx.font = "bold 10px 'Courier New', monospace";
    ctx.fillText("45° axis", pTip.x + 6, pTip.y - 6);

    // --- DRAW THE TWO ROTATORS ---
    // Rotator 1 (gold, XY plane)
    const v1x = R * 0.8 * v1[0], v1y = R * 0.8 * v1[1];
    line3d(0,0,0, v1x, v1y, 0, "#ffd166", 2.5);
    const tip1 = p3d(v1x, v1y, 0);
    ctx.beginPath(); ctx.arc(tip1.x, tip1.y, 5, 0, Math.PI*2);
    ctx.fillStyle = "#ffd166"; ctx.fill();

    // Rotator 2 (cyan, XZ plane)
    const v2x = R * 0.8 * v2[0], v2z = R * 0.8 * v2[2];
    line3d(0,0,0, v2x, 0, v2z, "#00b4d8", 2.5);
    const tip2 = p3d(v2x, 0, v2z);
    ctx.beginPath(); ctx.arc(tip2.x, tip2.y, 5, 0, Math.PI*2);
    ctx.fillStyle = "#00b4d8"; ctx.fill();

    // --- DRAW THE CONE NORMAL (green) ---
    if (nMag > 0.01) {
      // The actual normal (with magnitude)
      const nDispX = R * 1.1 * nx;
      const nDispY = R * 1.1 * ny;
      const nDispZ = R * 1.1 * nz;
      
      // Magnitude-scaled version (shows |n| variation)
      if (showMagnitude) {
        line3d(0,0,0, nDispX, nDispY, nDispZ, "rgba(6,214,160,0.3)", 1.5);
        const magTip = p3d(nDispX, nDispY, nDispZ);
        ctx.beginPath(); ctx.arc(magTip.x, magTip.y, 3, 0, Math.PI*2);
        ctx.fillStyle = "rgba(6,214,160,0.4)"; ctx.fill();
      }
      
      // The unit normal (direction only, on the sphere)
      const nUnitX = R * nHatX;
      const nUnitY = R * nHatY;
      const nUnitZ = R * nHatZ;
      line3d(0,0,0, nUnitX, nUnitY, nUnitZ, "#06d6a0", 2.5);
      const nTip = p3d(nUnitX, nUnitY, nUnitZ);
      ctx.beginPath(); ctx.arc(nTip.x, nTip.y, 6, 0, Math.PI*2);
      ctx.fillStyle = "#06d6a0"; ctx.fill();
      ctx.beginPath(); ctx.arc(nTip.x, nTip.y, 12, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(6,214,160,0.25)"; ctx.lineWidth = 1; ctx.stroke();
    }

    // --- DRAW ANGLE INDICATORS ---
    if (showAngles && nMag > 0.01) {
      // Arc showing angle from precession axis to current n̂
      const angDeg = angFromAxis * 180 / Math.PI;
      const arcR = R * 0.4;
      ctx.beginPath();
      let first = true;
      for (let t = 0; t <= 20; t++) {
        const frac = t / 20;
        // Interpolate between precession axis and n̂ direction
        const ix = frac * nHatX;
        const iy = pAxisY * (1-frac) + nHatY * frac;
        const iz = pAxisZ * (1-frac) + nHatZ * frac;
        const imag = Math.sqrt(ix*ix + iy*iy + iz*iz);
        const pt = p3d(arcR * ix/imag, arcR * iy/imag, arcR * iz/imag);
        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // --- HUD: Status display ---
    const hudX = 12;
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 13px 'Courier New', monospace";
    ctx.fillText(`α = ${alpha.toFixed(1)}° (${(alpha/90).toFixed(2)}T)`, hudX, 22);
    
    ctx.fillStyle = "#00b4d8";
    ctx.fillText(`α₂ = ${((alpha - 90 + 360) % 360).toFixed(1)}° (90° behind)`, hudX, 40);
    
    ctx.fillStyle = "#06d6a0";
    ctx.fillText(`β = 2α = ${((alpha*2) % 360).toFixed(1)}° (doubled freq)`, hudX, 58);
    
    ctx.fillStyle = "#aaa";
    ctx.font = "12px 'Courier New', monospace";
    
    const angDeg = (angFromAxis * 180 / Math.PI).toFixed(2);
    ctx.fillText(`|n| = ${nMag.toFixed(4)} ∈ [√3/2, 1]`, hudX, 82);
    ctx.fillText(`∠ from axis = ${angDeg}° ∈ [35.26°, 45°]`, hudX, 98);
    ctx.fillText(`|n|² = (7 + cos4α)/8 = ${((7 + Math.cos(4*aRad))/8).toFixed(4)}`, hudX, 114);
    
    // Magnitude bar
    const barX = hudX;
    const barY = 130;
    const barW = 180;
    const barH = 8;
    ctx.fillStyle = "#1a1a2a";
    ctx.fillRect(barX, barY, barW, barH);
    const magFrac = (nMag - Math.sqrt(3)/2) / (1 - Math.sqrt(3)/2);
    const magBarW = magFrac * barW;
    ctx.fillStyle = `hsl(${160 + magFrac * 40}, 70%, 50%)`;
    ctx.fillRect(barX, barY, magBarW, barH);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(barX, barY, barW, barH);
    ctx.fillStyle = "#666";
    ctx.font = "9px 'Courier New', monospace";
    ctx.fillText("√3/2", barX, barY + barH + 10);
    ctx.fillText("1", barX + barW - 8, barY + barH + 10);

    // Angle bar
    const aBarY = barY + 24;
    ctx.fillStyle = "#1a1a2a";
    ctx.fillRect(barX, aBarY, barW, barH);
    const angFrac = (parseFloat(angDeg) - 35.264) / (45 - 35.264);
    const angBarW = Math.max(0, Math.min(1, angFrac)) * barW;
    ctx.fillStyle = `hsl(${30 - angFrac * 30}, 80%, 55%)`;
    ctx.fillRect(barX, aBarY, angBarW, barH);
    ctx.strokeStyle = "#333";
    ctx.strokeRect(barX, aBarY, barW, barH);
    ctx.fillStyle = "#666";
    ctx.fillText("35.26°", barX, aBarY + barH + 10);
    ctx.fillText("45°", barX + barW - 16, aBarY + barH + 10);

    // Bottom status
    const bot = H - 14;
    ctx.fillStyle = "#555";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText("Period: π (180°) | Freq: 2ω₁ | Eccentricity: 0.651", hudX, bot - 16);
    ctx.fillText("Precession axis: (0, 1/√2, −1/√2) = 45° null cone diagonal", hudX, bot);

    // Right side: key formulas
    const rX = W - 260;
    ctx.fillStyle = "#444";
    ctx.font = "10px 'Courier New', monospace";
    ctx.fillText("n(α) = v₁(α) × v₂(α−π/2)", rX, 22);
    ctx.fillText("n_x = −½ sin 2α", rX, 38);
    ctx.fillText("n_y = ½(1 + cos 2α)", rX, 54);
    ctx.fillText("n_z = −½(1 − cos 2α)", rX, 70);
    ctx.fillText("|n|² = (7 + cos 4α)/8", rX, 90);
    ctx.fillText("<n> = (0, ½, −½)", rX, 110);
    ctx.fillText("|<n>| = 1/√2", rX, 126);

  }, [alpha, viewRotX, viewRotY, project, showTrail, showBand, showMagnitude, showAngles]);

  return (
    <div style={{
      background: "#08080e", minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "12px",
      fontFamily: "'Courier New', monospace", color: "#ccc", userSelect: "none"
    }}>
      <h1 style={{ fontSize: 18, fontWeight: 300, letterSpacing: 6, color: "#fff", margin: "0 0 2px 0" }}>
        PRECESSION OF THE CONE AXIS
      </h1>
      <div style={{ fontSize: 9, color: "#555", letterSpacing: 2, marginBottom: 10 }}>
        Two perpendicular rotators &bull; 90° phase delay &bull; elliptic precession &bull; zero input
      </div>
      <canvas ref={canvasRef} width={760} height={560}
        style={{ border: "1px solid #151520", borderRadius: 6, cursor: "grab", background: "#08080e" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => setPlaying(!playing)}
          style={{ padding: "6px 20px", background: playing ? "#e94560" : "#06d6a0", color: "#08080e",
            border: "none", borderRadius: 3, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 11 }}>
          {playing ? "PAUSE" : "PLAY"}
        </button>
        <button onClick={() => { setAlpha(0); setPlaying(false); }}
          style={{ padding: "6px 20px", background: "transparent", color: "#555", border: "1px solid #222",
            borderRadius: 3, cursor: "pointer", fontFamily: "inherit", fontSize: 11 }}>
          RESET
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#444" }}>SPEED</span>
          <input type="range" min="0.05" max="2" step="0.05" value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: 60 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "#444" }}>α</span>
          <input type="range" min="0" max="360" step="0.5" value={alpha}
            onChange={e => { setPlaying(false); setAlpha(parseFloat(e.target.value)); }} style={{ width: 150 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "3/4 view", rx: -20, ry: 30 },
          { label: "Front", rx: 0, ry: 0 },
          { label: "Top", rx: -89, ry: 0 },
          { label: "Along axis", rx: -35, ry: 45 },
          { label: "Side", rx: 0, ry: 90 },
        ].map(v => (
          <button key={v.label} onClick={() => { setViewRotX(v.rx); setViewRotY(v.ry); }}
            style={{ padding: "2px 8px", fontSize: 9, background: "transparent", color: "#444",
              border: "1px solid #1a1a1a", borderRadius: 2, cursor: "pointer", fontFamily: "inherit" }}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { key: "showTrail", label: "Precession trail", state: showTrail, set: setShowTrail, color: "#06d6a0" },
          { key: "showBand", label: "Elliptic band", state: showBand, set: setShowBand, color: "#ff8c32" },
          { key: "showMagnitude", label: "|n| variation", state: showMagnitude, set: setShowMagnitude, color: "#06d6a0" },
          { key: "showAngles", label: "Angle arc", state: showAngles, set: setShowAngles, color: "#fff" },
        ].map(item => (
          <label key={item.key} style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer", fontSize: 9, color: item.state ? item.color : "#333" }}>
            <input type="checkbox" checked={item.state} onChange={() => item.set(!item.state)}
              style={{ width: 10, height: 10 }} />
            {item.label}
          </label>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { color: "#ffd166", label: "Dude 1 (XY)" },
          { color: "#00b4d8", label: "Dude 2 (XZ, 90° behind)" },
          { color: "#06d6a0", label: "Cone normal n̂" },
          { color: "rgba(255,200,50,0.7)", label: "45° precession axis" },
          { color: "#ff8c32", label: "35.26° inner boundary" },
          { color: "#ff5050", label: "45° outer boundary" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <div style={{ width: 7, height: 7, borderRadius: 1, background: item.color }} />
            <span style={{ fontSize: 8, color: "#444" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
