import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================
// CONE PRECESSION LAB
// Fixed stage (7th angle), all motions, all angles exposed
// ============================================================

// --- Math helpers ---
const V3 = {
  add: (a, b) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]],
  sub: (a, b) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]],
  scale: (a, s) => [a[0]*s, a[1]*s, a[2]*s],
  dot: (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2],
  cross: (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]],
  mag: (a) => Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]),
  norm: (a) => { const m = V3.mag(a); return m > 1e-10 ? V3.scale(a, 1/m) : [0,0,0]; },
};

// Compute everything at a given alpha (radians)
function computeState(a) {
  const ca = Math.cos(a), sa = Math.sin(a);
  const c2a = Math.cos(2*a), s2a = Math.sin(2*a);
  const c4a = Math.cos(4*a);
  
  // Dude vectors (unit length — R factored out)
  const v1 = [ca, sa, 0];
  const v2 = [sa, 0, -ca]; // 90° behind in XZ plane
  
  // Cross product (unnormalized normal)
  const n = V3.cross(v1, v2);
  const nMag = V3.mag(n);
  const nHat = nMag > 1e-10 ? V3.norm(n) : [0,0,0];
  
  // |n|² = (7 + cos4α)/8
  const magSq = (7 + c4a) / 8;
  
  // Angle between the two Dudes
  const dudesDot = V3.dot(v1, v2); // = ½ sin 2α
  const dudesAngle = Math.acos(Math.min(1, Math.max(-1, dudesDot))) * 180 / Math.PI;
  
  // Precession axis: (0, 1/√2, -1/√2)
  const pAxis = [0, 1/Math.sqrt(2), -1/Math.sqrt(2)];
  const dotWithAxis = V3.dot(nHat, pAxis);
  const angleFromAxis = Math.acos(Math.min(1, Math.max(-1, dotWithAxis))) * 180 / Math.PI;
  
  // dn̂/dα (numerically, small step)
  const da = 0.001;
  const a2 = a + da;
  const v1b = [Math.cos(a2), Math.sin(a2), 0];
  const v2b = [Math.sin(a2), 0, -Math.cos(a2)];
  const nb = V3.cross(v1b, v2b);
  const nHatB = V3.norm(nb);
  const dnHat = V3.scale(V3.sub(nHatB, nHat), 1/da);
  const dnHatMag = V3.mag(dnHat);
  
  // Thug tip velocity ratio (relative to Dude tip velocity)
  // v_thug/v_dude = (L3/R) × |dn̂/dα| = √(3/8) × |dn̂/dα|
  const L3overR = Math.sqrt(3/8);
  const thugVelRatio = L3overR * dnHatMag;
  
  return {
    v1, v2, n, nMag, nHat, magSq,
    dudesDot, dudesAngle,
    angleFromAxis, pAxis,
    dnHatMag, thugVelRatio, L3overR,
    alpha: a, alphaDeg: a * 180 / Math.PI,
  };
}

export default function ConePrecessionLab() {
  const canvasRef = useRef(null);
  const [alpha, setAlpha] = useState(0); // in degrees
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.25);
  // Fixed stage camera — the 7th angle. User can orbit the STAGE, not the mechanism.
  const [camTheta, setCamTheta] = useState(-25); // elevation
  const [camPhi, setCamPhi] = useState(35); // azimuth
  const animRef = useRef(null);
  const dragRef = useRef(null);
  
  // Toggles
  const [showDudePlanes, setShowDudePlanes] = useState(true);
  const [showScissors, setShowScissors] = useState(true);
  const [showConeMantle, setShowConeMantle] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [showVelocity, setShowVelocity] = useState(true);
  const [showAngMom, setShowAngMom] = useState(true);
  const [stepMode, setStepMode] = useState(false);

  // Camera drag
  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, t: camTheta, p: camPhi };
  }, [camTheta, camPhi]);
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    setCamPhi(dragRef.current.p + (e.clientX - dragRef.current.x) * 0.3);
    setCamTheta(Math.max(-89, Math.min(89, dragRef.current.t + (e.clientY - dragRef.current.y) * 0.3)));
  }, []);
  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);

  // Animation
  useEffect(() => {
    if (!playing) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const tick = () => {
      setAlpha(prev => {
        const inc = stepMode ? 90 : speed;
        const n = prev + inc;
        if (stepMode) { setPlaying(false); }
        return n >= 720 ? n - 720 : n;
      });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, speed, stepMode]);

  // 3D projection with fixed stage
  const project = useCallback((x, y, z) => {
    const rp = (camPhi * Math.PI) / 180;
    const x1 = x * Math.cos(rp) + z * Math.sin(rp);
    const z1 = -x * Math.sin(rp) + z * Math.cos(rp);
    const rt = (camTheta * Math.PI) / 180;
    const y1 = y * Math.cos(rt) - z1 * Math.sin(rt);
    const z2 = y * Math.sin(rt) + z1 * Math.cos(rt);
    const fov = 520;
    const s = fov / (fov + z2 + 280);
    return { x: x1 * s, y: -y1 * s, z: z2, s };
  }, [camTheta, camPhi]);

  // Precompute the full trail
  const trail = useMemo(() => {
    const pts = [];
    for (let deg = 0; deg < 360; deg += 1) {
      const st = computeState(deg * Math.PI / 180);
      pts.push({ nHat: st.nHat, nMag: st.nMag, thugVel: st.thugVelRatio });
    }
    return pts;
  }, []);

  // Main render
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = cvs.width, H = cvs.height;
    const cx = W * 0.45, cy = H * 0.5;
    const R = 140; // display scale

    // Background
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(0, 0, W, H);

    // Helper: 3D point to screen
    const p3 = (x,y,z) => {
      const p = project(x,y,z);
      return { x: cx + p.x, y: cy + p.y, z: p.z, s: p.s };
    };

    // Helper: draw line
    const ln = (x1,y1,z1, x2,y2,z2, col, w) => {
      const a = p3(x1,y1,z1), b = p3(x2,y2,z2);
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
      ctx.strokeStyle = col; ctx.lineWidth = w||1; ctx.stroke();
    };

    // Helper: draw circle arc in a plane
    const arc3d = (center, e1, e2, radius, fromDeg, toDeg, col, w) => {
      ctx.beginPath();
      let first = true;
      for (let d = fromDeg; d <= toDeg; d += 2) {
        const r = d * Math.PI / 180;
        const px = center[0] + radius*(Math.cos(r)*e1[0] + Math.sin(r)*e2[0]);
        const py = center[1] + radius*(Math.cos(r)*e1[1] + Math.sin(r)*e2[1]);
        const pz = center[2] + radius*(Math.cos(r)*e1[2] + Math.sin(r)*e2[2]);
        const pt = p3(px, py, pz);
        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = col; ctx.lineWidth = w||1; ctx.stroke();
    };

    // Current state
    const aRad = alpha * Math.PI / 180;
    const S = computeState(aRad);
    const L3R = S.L3overR; // √(3/8) ≈ 0.6124

    // ============= STAGE GRID =============
    const gSize = R * 1.6;
    for (let i = -4; i <= 4; i++) {
      const g = i * gSize / 4;
      ln(g, 0, -gSize, g, 0, gSize, "rgba(255,255,255,0.03)", 0.5);
      ln(-gSize, 0, g, gSize, 0, g, "rgba(255,255,255,0.03)", 0.5);
    }

    // ============= COORDINATE AXES (FIXED STAGE) =============
    const axL = R * 1.25;
    ln(-axL,0,0, axL,0,0, "rgba(255,100,100,0.4)", 1.2);
    ln(0,-axL,0, 0,axL,0, "rgba(100,255,100,0.4)", 1.2);
    ln(0,0,-axL, 0,0,axL, "rgba(100,150,255,0.4)", 1.2);
    
    const labels = [{p:[axL*1.05,0,0],l:"X",c:"#f66"},{p:[0,axL*1.05,0],l:"Y",c:"#6f6"},{p:[0,0,axL*1.05],l:"Z",c:"#69f"}];
    labels.forEach(({p:pos,l,c}) => {
      const pt = p3(pos[0],pos[1],pos[2]);
      ctx.fillStyle = c; ctx.font = "bold 11px 'Courier New',monospace";
      ctx.fillText(l, pt.x+3, pt.y-3);
    });

    // ============= DUDE PLANE CIRCLES =============
    if (showDudePlanes) {
      // XY plane circle (Dude 1's plane)
      arc3d([0,0,0], [1,0,0], [0,1,0], R*0.85, 0, 360, "rgba(255,209,102,0.12)", 0.8);
      // XZ plane circle (Dude 2's plane)
      arc3d([0,0,0], [1,0,0], [0,0,1], R*0.85, 0, 360, "rgba(0,180,216,0.12)", 0.8);
    }

    // ============= PRECESSION AXIS =============
    const pAx = [0, R*1.1/Math.sqrt(2), -R*1.1/Math.sqrt(2)];
    const pAxN = [0, -R*1.1/Math.sqrt(2), R*1.1/Math.sqrt(2)];
    ln(pAxN[0],pAxN[1],pAxN[2], pAx[0],pAx[1],pAx[2], "rgba(255,200,50,0.35)", 1);
    const pTip = p3(pAx[0],pAx[1],pAx[2]);
    ctx.fillStyle = "rgba(255,200,50,0.5)";
    ctx.font = "9px 'Courier New',monospace";
    ctx.fillText("prec. axis", pTip.x+4, pTip.y-4);

    // ============= PRECESSION TRAIL (elliptic path on sphere) =============
    if (showTrail) {
      ctx.beginPath();
      let first = true;
      for (let i = 0; i < trail.length; i++) {
        const nh = trail[i].nHat;
        const pt = p3(nh[0]*R, nh[1]*R, nh[2]*R);
        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(6,214,160,0.4)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ============= CONE MANTLE (current shape) =============
    if (showConeMantle && S.nMag > 0.01) {
      const coneR = R * L3R; // Thug length on display
      // Draw lines from origin to points on the precession trail, scaled by L3
      for (let i = 0; i < 360; i += 8) {
        const nh = trail[i].nHat;
        const tipX = nh[0]*coneR, tipY = nh[1]*coneR, tipZ = nh[2]*coneR;
        ln(0,0,0, tipX, tipY, tipZ, "rgba(6,214,160,0.04)", 0.5);
      }
    }

    // ============= SCISSORS ANGLE ARC =============
    if (showScissors) {
      // Draw arc between v1 and v2 showing their mutual angle
      const v1d = V3.scale(S.v1, R*0.35);
      const v2d = V3.scale(S.v2, R*0.35);
      ctx.beginPath();
      let first = true;
      for (let t = 0; t <= 20; t++) {
        const f = t / 20;
        const interp = V3.norm(V3.add(V3.scale(S.v1, 1-f), V3.scale(S.v2, f)));
        const pt = p3(interp[0]*R*0.3, interp[1]*R*0.3, interp[2]*R*0.3);
        if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Label
      const midV = V3.norm(V3.add(S.v1, S.v2));
      const midPt = p3(midV[0]*R*0.38, midV[1]*R*0.38, midV[2]*R*0.38);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "bold 10px 'Courier New',monospace";
      ctx.fillText(`${S.dudesAngle.toFixed(1)}°`, midPt.x+2, midPt.y-2);
    }

    // ============= DUDE 1 ARM (gold, XY plane) =============
    const d1 = V3.scale(S.v1, R);
    ln(0,0,0, d1[0],d1[1],d1[2], "#ffd166", 2.5);
    const d1tip = p3(d1[0],d1[1],d1[2]);
    ctx.beginPath(); ctx.arc(d1tip.x, d1tip.y, 5, 0, Math.PI*2);
    ctx.fillStyle = "#ffd166"; ctx.fill();

    // ============= DUDE 2 ARM (cyan, XZ plane) =============
    const d2 = V3.scale(S.v2, R);
    ln(0,0,0, d2[0],d2[1],d2[2], "#00b4d8", 2.5);
    const d2tip = p3(d2[0],d2[1],d2[2]);
    ctx.beginPath(); ctx.arc(d2tip.x, d2tip.y, 5, 0, Math.PI*2);
    ctx.fillStyle = "#00b4d8"; ctx.fill();

    // ============= THUG VECTOR (green, along n̂, length L3) =============
    if (S.nMag > 0.01) {
      const thugLen = R * L3R;
      const thugTip = V3.scale(S.nHat, thugLen);
      
      // Thug arm
      ln(0,0,0, thugTip[0],thugTip[1],thugTip[2], "#06d6a0", 2.5);
      const ttip = p3(thugTip[0],thugTip[1],thugTip[2]);
      
      // Thug tip — color by velocity (green=slow, red=at wall)
      const velHue = 160 - S.thugVelRatio * 140; // 160(green) to 20(red)
      ctx.beginPath(); ctx.arc(ttip.x, ttip.y, 6, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${velHue}, 80%, 55%)`; ctx.fill();
      ctx.beginPath(); ctx.arc(ttip.x, ttip.y, 10, 0, Math.PI*2);
      ctx.strokeStyle = `hsla(${velHue}, 80%, 55%, 0.3)`; ctx.lineWidth = 1; ctx.stroke();

      // Also show the unit normal on the sphere (for the trail)
      const nOnSphere = V3.scale(S.nHat, R);
      const nsp = p3(nOnSphere[0], nOnSphere[1], nOnSphere[2]);
      ctx.beginPath(); ctx.arc(nsp.x, nsp.y, 3, 0, Math.PI*2);
      ctx.fillStyle = "rgba(6,214,160,0.5)"; ctx.fill();
      
      // Dashed line from thug tip to sphere position
      ctx.setLineDash([3,3]);
      ln(thugTip[0],thugTip[1],thugTip[2], nOnSphere[0],nOnSphere[1],nOnSphere[2], "rgba(6,214,160,0.15)", 0.5);
      ctx.setLineDash([]);

      // Angle from precession axis arc
      if (S.angleFromAxis > 1) {
        const pADir = [0, 1/Math.sqrt(2), -1/Math.sqrt(2)];
        ctx.beginPath();
        let first = true;
        for (let t = 0; t <= 15; t++) {
          const f = t / 15;
          const interp = V3.norm(V3.add(V3.scale(pADir, 1-f), V3.scale(S.nHat, f)));
          const pt = p3(interp[0]*R*0.25, interp[1]*R*0.25, interp[2]*R*0.25);
          if (first) { ctx.moveTo(pt.x, pt.y); first = false; }
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = "rgba(255,200,50,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // ============= VELOCITY INDICATOR =============
    if (showVelocity && S.nMag > 0.01) {
      // Show the Thug velocity as an arrow tangent to the precession path
      const velDir = V3.norm(computeState(aRad + 0.01).nHat.map((v, i) => v - S.nHat[i]));
      const velScale = R * 0.3 * S.thugVelRatio;
      const thugPos = V3.scale(S.nHat, R * L3R);
      const velEnd = V3.add(thugPos, V3.scale(velDir, velScale));
      ln(thugPos[0],thugPos[1],thugPos[2], velEnd[0],velEnd[1],velEnd[2],
        `hsla(${160 - S.thugVelRatio*140}, 80%, 55%, 0.6)`, 1.5);
    }

    // ============= EMERGED ANGULAR MOMENTUM =============
    if (showAngMom) {
      // L direction: (0, -1/√2, 1/√2) — anti-parallel to precession axis
      const Ldir = [0, -1/Math.sqrt(2), 1/Math.sqrt(2)];
      const Lscale = R * 0.6;
      ln(0,0,0, Ldir[0]*Lscale, Ldir[1]*Lscale, Ldir[2]*Lscale, "rgba(255,50,100,0.5)", 1.5);
      const Ltip = p3(Ldir[0]*Lscale, Ldir[1]*Lscale, Ldir[2]*Lscale);
      ctx.fillStyle = "rgba(255,50,100,0.6)";
      ctx.font = "8px 'Courier New',monospace";
      ctx.fillText("L (emerged)", Ltip.x+4, Ltip.y+4);
    }

    // ============= ORIGIN =============
    const orig = p3(0,0,0);
    ctx.beginPath(); ctx.arc(orig.x, orig.y, 4, 0, Math.PI*2);
    ctx.fillStyle = "#fff"; ctx.fill();

    // ============= QUARTER-TURN MARKERS =============
    const markers = [
      { a: 0, c: "#ffd166", l: "0" }, { a: 90, c: "#ffd166", l: "T₁" },
      { a: 180, c: "#e94560", l: "2T₁" }, { a: 270, c: "#ffd166", l: "3T₁" },
    ];
    markers.forEach(m => {
      const mr = m.a * Math.PI / 180;
      const pt = p3(R*0.88*Math.cos(mr), R*0.88*Math.sin(mr), 0);
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 2, 0, Math.PI*2);
      ctx.fillStyle = m.c; ctx.fill();
      ctx.fillStyle = m.c + "88";
      ctx.font = "8px 'Courier New',monospace";
      ctx.fillText(m.l, pt.x+4, pt.y-2);
    });

    // ============= INSTRUMENT PANEL (right side) =============
    const px = W - 260, py = 16;
    ctx.fillStyle = "rgba(10,10,18,0.85)";
    ctx.fillRect(px-8, py-8, 262, 420);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(px-8, py-8, 262, 420);

    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 12px 'Courier New',monospace";
    ctx.fillText("INSTRUMENT PANEL", px, py+8);

    let row = py + 28;
    const line = (label, value, color) => {
      ctx.fillStyle = color || "#888";
      ctx.font = "10px 'Courier New',monospace";
      ctx.fillText(label, px, row);
      ctx.fillStyle = "#ddd";
      ctx.font = "bold 10px 'Courier New',monospace";
      ctx.fillText(value, px + 140, row);
      row += 15;
    };

    line("α (Dude angle)", `${alpha.toFixed(1)}°`, "#ffd166");
    line("α₂ (Dude 2)", `${((alpha - 90 + 720) % 360).toFixed(1)}°`, "#00b4d8");
    line("β = 2α", `${((alpha * 2) % 360).toFixed(1)}°`, "#06d6a0");
    row += 5;
    
    ctx.fillStyle = "#555"; ctx.fillRect(px, row, 240, 1); row += 8;
    ctx.fillStyle = "#aaa"; ctx.font = "bold 9px 'Courier New',monospace";
    ctx.fillText("SCISSORS", px, row); row += 12;
    
    line("v₁ · v₂", S.dudesDot.toFixed(4));
    line("Dudes angle", `${S.dudesAngle.toFixed(2)}°`);
    line("", S.dudesAngle < 61 ? "◄ CLOSEST" : S.dudesAngle > 89 ? "◄ PERPENDICULAR" : "", "#e94560");
    row += 3;
    
    ctx.fillStyle = "#555"; ctx.fillRect(px, row, 240, 1); row += 8;
    ctx.fillStyle = "#aaa"; ctx.font = "bold 9px 'Courier New',monospace";
    ctx.fillText("NORMAL / THUG", px, row); row += 12;
    
    line("|n|", S.nMag.toFixed(4));
    line("|n|²", S.magSq.toFixed(4));
    line("∠ from axis", `${S.angleFromAxis.toFixed(2)}°`);
    line("|dn̂/dα|", S.dnHatMag.toFixed(4));
    row += 3;
    
    ctx.fillStyle = "#555"; ctx.fillRect(px, row, 240, 1); row += 8;
    ctx.fillStyle = "#aaa"; ctx.font = "bold 9px 'Courier New',monospace";
    ctx.fillText("VELOCITY", px, row); row += 12;
    
    line("v_thug / v_dude", S.thugVelRatio.toFixed(4));
    line("v_thug / c", S.thugVelRatio.toFixed(4));
    line("v_dude / c", "1.0000 (wall)");
    const atWall = S.thugVelRatio > 0.99;
    if (atWall) {
      ctx.fillStyle = "#e94560"; ctx.font = "bold 10px 'Courier New',monospace";
      ctx.fillText("★ THUG AT THE WALL ★", px + 30, row); row += 14;
    }
    row += 3;

    ctx.fillStyle = "#555"; ctx.fillRect(px, row, 240, 1); row += 8;
    ctx.fillStyle = "#aaa"; ctx.font = "bold 9px 'Courier New',monospace";
    ctx.fillText("CONSTANTS (derived)", px, row); row += 12;
    
    line("R/R'", `√(8/3) = ${Math.sqrt(8/3).toFixed(6)}`);
    line("R'/R = L₃/R", `√6/4 = ${(Math.sqrt(6)/4).toFixed(6)}`);
    line("r_eff", "R/2 (exact)");
    line("Winding #", "-2 per rotation");
    line("ε (eccentric.)", "0.651");
    line("Band", "35.26° — 45°");
    
    // ============= VELOCITY BAR =============
    row += 8;
    ctx.fillStyle = "#555"; ctx.fillRect(px, row, 240, 1); row += 8;
    const barW = 230, barH = 12;
    ctx.fillStyle = "#111"; ctx.fillRect(px, row, barW, barH);
    // Min marker
    const minFrac = Math.sqrt(3/8);
    ctx.fillStyle = "#333";
    ctx.fillRect(px, row, barW * minFrac, barH);
    // Current velocity
    const velFrac = Math.min(1, S.thugVelRatio);
    const velHue = 160 - velFrac * 140;
    ctx.fillStyle = `hsl(${velHue}, 70%, 45%)`;
    ctx.fillRect(px, row, barW * velFrac, barH);
    // Wall line
    ctx.fillStyle = "#e94560";
    ctx.fillRect(px + barW - 1, row, 2, barH);
    ctx.strokeStyle = "#333"; ctx.strokeRect(px, row, barW, barH);
    row += barH + 3;
    ctx.fillStyle = "#555"; ctx.font = "8px 'Courier New',monospace";
    ctx.fillText("√(3/8)c", px, row);
    ctx.fillText("c (wall)", px + barW - 40, row);
    row += 12;

    // Angle from axis bar
    ctx.fillStyle = "#111"; ctx.fillRect(px, row, barW, barH);
    const angMin = 35.264, angMax = 45;
    const angFrac = Math.max(0, Math.min(1, (S.angleFromAxis - angMin)/(angMax - angMin)));
    ctx.fillStyle = `hsl(${30 + angFrac*20}, 70%, 50%)`;
    ctx.fillRect(px, row, barW * angFrac, barH);
    ctx.strokeStyle = "#333"; ctx.strokeRect(px, row, barW, barH);
    row += barH + 3;
    ctx.fillStyle = "#555"; ctx.font = "8px 'Courier New',monospace";
    ctx.fillText("35.26°", px, row);
    ctx.fillText("45°", px + barW - 20, row);

    // ============= BOTTOM STATUS =============
    ctx.fillStyle = "#333";
    ctx.font = "9px 'Courier New',monospace";
    ctx.fillText("7th angle: fixed stage | drag to orbit | all motions from c + 90° delay only", 12, H-8);

  }, [alpha, camTheta, camPhi, project, trail, showDudePlanes, showScissors, showConeMantle, showTrail, showVelocity, showAngMom]);

  return (
    <div style={{ background:"#0a0a12", minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", padding:"10px", fontFamily:"'Courier New',monospace", color:"#ccc", userSelect:"none" }}>
      <div style={{ fontSize:16, fontWeight:300, letterSpacing:6, color:"#fff", marginBottom:2 }}>
        CONE PRECESSION LAB
      </div>
      <div style={{ fontSize:8, color:"#444", letterSpacing:2, marginBottom:8 }}>
        FIXED STAGE (7th angle) &bull; ALL MOTIONS FROM c + 90° DELAY &bull; ZERO OTHER INPUT
      </div>
      <canvas ref={canvasRef} width={870} height={580}
        style={{ border:"1px solid #181824", borderRadius:4, cursor:"grab", background:"#0a0a12" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp} />
      <div style={{ display:"flex", gap:6, marginTop:8, alignItems:"center", flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => { setStepMode(false); setPlaying(!playing); }}
          style={{ padding:"5px 16px", background:playing && !stepMode ? "#e94560" : "#06d6a0", color:"#0a0a12",
            border:"none", borderRadius:3, cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:10 }}>
          {playing && !stepMode ? "PAUSE" : "PLAY"}
        </button>
        <button onClick={() => { setStepMode(true); setPlaying(true); }}
          style={{ padding:"5px 16px", background:"#ffd166", color:"#0a0a12",
            border:"none", borderRadius:3, cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:10 }}>
          STEP 90°
        </button>
        <button onClick={() => { setAlpha(0); setPlaying(false); }}
          style={{ padding:"5px 16px", background:"transparent", color:"#555", border:"1px solid #222",
            borderRadius:3, cursor:"pointer", fontFamily:"inherit", fontSize:10 }}>RESET</button>
        <span style={{fontSize:8,color:"#444"}}>SPEED</span>
        <input type="range" min="0.05" max="1.5" step="0.05" value={speed}
          onChange={e=>setSpeed(parseFloat(e.target.value))} style={{width:50}} />
        <span style={{fontSize:8,color:"#444"}}>α</span>
        <input type="range" min="0" max="720" step="0.5" value={alpha}
          onChange={e=>{setPlaying(false);setAlpha(parseFloat(e.target.value));}} style={{width:140}} />
      </div>
      <div style={{ display:"flex", gap:4, marginTop:6, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { label:"3/4", t:-25, p:35 }, { label:"Front", t:0, p:0 }, { label:"Top", t:-89, p:0 },
          { label:"Along axis", t:-35, p:45 }, { label:"Side", t:0, p:90 }, { label:"Below", t:35, p:25 },
        ].map(v=>(
          <button key={v.label} onClick={()=>{setCamTheta(v.t);setCamPhi(v.p);}}
            style={{ padding:"2px 7px", fontSize:8, background:"transparent", color:"#444",
              border:"1px solid #181824", borderRadius:2, cursor:"pointer", fontFamily:"inherit" }}>{v.label}</button>
        ))}
      </div>
      <div style={{ display:"flex", gap:8, marginTop:6, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { k:"showDudePlanes", l:"Dude planes", s:showDudePlanes, f:setShowDudePlanes },
          { k:"showScissors", l:"Scissors ∠", s:showScissors, f:setShowScissors },
          { k:"showConeMantle", l:"Cone mantle", s:showConeMantle, f:setShowConeMantle },
          { k:"showTrail", l:"Precession trail", s:showTrail, f:setShowTrail },
          { k:"showVelocity", l:"Velocity vec", s:showVelocity, f:setShowVelocity },
          { k:"showAngMom", l:"Angular mom.", s:showAngMom, f:setShowAngMom },
        ].map(item=>(
          <label key={item.k} style={{display:"flex",alignItems:"center",gap:2,cursor:"pointer",fontSize:8,
            color:item.s?"#aaa":"#333"}}>
            <input type="checkbox" checked={item.s} onChange={()=>item.f(!item.s)} style={{width:9,height:9}} />
            {item.l}
          </label>
        ))}
      </div>
      <div style={{ display:"flex", gap:10, marginTop:6, flexWrap:"wrap", justifyContent:"center" }}>
        {[
          { c:"#ffd166", l:"Dude 1 (XY)" }, { c:"#00b4d8", l:"Dude 2 (XZ, -90°)" },
          { c:"#06d6a0", l:"Thug (n̂, L₃=R√6/4)" }, { c:"rgba(255,200,50,0.7)", l:"Precession axis (45°)" },
          { c:"#f36", l:"Emerged L (anti-parallel)" },
        ].map(item=>(
          <div key={item.l} style={{display:"flex",alignItems:"center",gap:3}}>
            <div style={{width:6,height:6,borderRadius:1,background:item.c}} />
            <span style={{fontSize:7,color:"#444"}}>{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
