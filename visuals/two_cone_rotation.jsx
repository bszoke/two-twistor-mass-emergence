import { useState, useEffect, useRef, useCallback } from "react";

export default function OpeningSpaces3D() {
  const canvasRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.3);
  const [viewRotX, setViewRotX] = useState(-25);
  const [viewRotY, setViewRotY] = useState(35);
  const animRef = useRef(null);
  const dragRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, rx: viewRotX, ry: viewRotY };
  }, [viewRotX, viewRotY]);
  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return;
    setViewRotY(dragRef.current.ry + (e.clientX - dragRef.current.x) * 0.3);
    setViewRotX(Math.max(-89, Math.min(89, dragRef.current.rx + (e.clientY - dragRef.current.y) * 0.3)));
  }, []);
  const onMouseUp = useCallback(() => { dragRef.current = null; }, []);
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    dragRef.current = { x: t.clientX, y: t.clientY, rx: viewRotX, ry: viewRotY };
  }, [viewRotX, viewRotY]);
  const onTouchMove = useCallback((e) => {
    if (!dragRef.current) return;
    const t = e.touches[0];
    setViewRotY(dragRef.current.ry + (t.clientX - dragRef.current.x) * 0.3);
    setViewRotX(Math.max(-89, Math.min(89, dragRef.current.rx + (t.clientY - dragRef.current.y) * 0.3)));
  }, []);

  useEffect(() => {
    if (!playing) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }
    const tick = () => {
      setAngle(prev => { const n = prev + speed; return n >= 360 ? 0 : n; });
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [playing, speed]);

  const project = useCallback((x, y, z) => {
    const ry = (viewRotY * Math.PI) / 180;
    const x1 = x * Math.cos(ry) + z * Math.sin(ry);
    const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
    const rx = (viewRotX * Math.PI) / 180;
    const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
    const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
    const fov = 600;
    const scale = fov / (fov + z2 + 300);
    return { x: x1 * scale, y: -y1 * scale, depth: z2 };
  }, [viewRotX, viewRotY]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = 170;

    ctx.fillStyle = "#06060a";
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

    const a1 = angle;
    const a2 = Math.max(0, angle - 90);
    const a1r = (a1 * Math.PI) / 180;
    const a2r = (a2 * Math.PI) / 180;
    const trailSteps = 60;

    // Subtle grid on XZ floor
    for (let i = -3; i <= 3; i++) {
      const g = i * 55;
      line3d(g, 0, -165, g, 0, 165, "rgba(255,255,255,0.04)", 0.5);
      line3d(-165, 0, g, 165, 0, g, "rgba(255,255,255,0.04)", 0.5);
    }

    // ARM 1 TRAIL (XY plane) — warm gold wedge
    if (a1 > 0) {
      for (let layer = 0; layer < 3; layer++) {
        const layerR = R * (0.3 + layer * 0.35);
        ctx.beginPath();
        const origin = p3d(0, 0, 0);
        ctx.moveTo(origin.x, origin.y);
        for (let i = 0; i <= trailSteps; i++) {
          const t = (i / trailSteps) * a1 * Math.PI / 180;
          const pt = p3d(layerR * Math.cos(t), layerR * Math.sin(t), 0);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 180, 60, ${[0.06, 0.04, 0.025][layer]})`;
        ctx.fill();
      }
      ctx.beginPath();
      for (let i = 0; i <= trailSteps; i++) {
        const t = (i / trailSteps) * a1 * Math.PI / 180;
        const pt = p3d(R * Math.cos(t), R * Math.sin(t), 0);
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(255, 209, 102, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // ARM 2 TRAIL (XZ plane) — cool cyan wedge
    if (a2 > 0) {
      for (let layer = 0; layer < 3; layer++) {
        const layerR = R * (0.3 + layer * 0.35);
        ctx.beginPath();
        const origin = p3d(0, 0, 0);
        ctx.moveTo(origin.x, origin.y);
        for (let i = 0; i <= trailSteps; i++) {
          const t = (i / trailSteps) * a2 * Math.PI / 180;
          const pt = p3d(layerR * Math.cos(t), 0, layerR * Math.sin(t));
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(0, 160, 220, ${[0.06, 0.04, 0.025][layer]})`;
        ctx.fill();
      }
      ctx.beginPath();
      for (let i = 0; i <= trailSteps; i++) {
        const t = (i / trailSteps) * a2 * Math.PI / 180;
        const pt = p3d(R * Math.cos(t), 0, R * Math.sin(t));
        if (i === 0) ctx.moveTo(pt.x, pt.y); else ctx.lineTo(pt.x, pt.y);
      }
      ctx.strokeStyle = "rgba(0, 180, 216, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // CONE SURFACE — ruled surface between the two arms over time
    if (a2 > 2) {
      const coneSteps = 30;
      const endStep = Math.min(a2, 270);
      for (let i = 0; i <= coneSteps; i++) {
        const t2 = (i / coneSteps) * endStep;
        const t1 = t2 + 90;
        const t1r2 = (t1 * Math.PI) / 180;
        const t2r2 = (t2 * Math.PI) / 180;
        line3d(
          R*0.9*Math.cos(t1r2), R*0.9*Math.sin(t1r2), 0,
          R*0.9*Math.cos(t2r2), 0, R*0.9*Math.sin(t2r2),
          `rgba(6, 214, 160, ${0.06 + 0.05 * (i / coneSteps)})`, 0.7
        );
      }
      for (let i = 0; i < coneSteps - 1; i++) {
        const t2a = (i / coneSteps) * endStep;
        const t2b = ((i + 1) / coneSteps) * endStep;
        const t1a = t2a + 90;
        const t1b = t2b + 90;
        const p1a = p3d(R*0.9*Math.cos(t1a*Math.PI/180), R*0.9*Math.sin(t1a*Math.PI/180), 0);
        const p2a = p3d(R*0.9*Math.cos(t2a*Math.PI/180), 0, R*0.9*Math.sin(t2a*Math.PI/180));
        const p1b = p3d(R*0.9*Math.cos(t1b*Math.PI/180), R*0.9*Math.sin(t1b*Math.PI/180), 0);
        const p2b = p3d(R*0.9*Math.cos(t2b*Math.PI/180), 0, R*0.9*Math.sin(t2b*Math.PI/180));
        ctx.beginPath();
        ctx.moveTo(p1a.x, p1a.y); ctx.lineTo(p2a.x, p2a.y); ctx.lineTo(p1b.x, p1b.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(6, 214, 160, 0.025)";
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(p2a.x, p2a.y); ctx.lineTo(p2b.x, p2b.y); ctx.lineTo(p1b.x, p1b.y);
        ctx.closePath();
        ctx.fillStyle = "rgba(6, 214, 160, 0.025)";
        ctx.fill();
      }
    }

    // THIRD AXIS — cross product v1 × v2
    {
      const crossX = Math.sin(a1r) * Math.sin(a2r);
      const crossY = -Math.cos(a1r) * Math.sin(a2r);
      const crossZ = -Math.sin(a1r) * Math.cos(a2r);
      const mag = Math.sqrt(crossX*crossX + crossY*crossY + crossZ*crossZ);
      if (mag > 0.02) {
        const scale = R * 1.1;
        const nx = (crossX / mag) * scale;
        const ny = (crossY / mag) * scale;
        const nz = (crossZ / mag) * scale;
        const strength = mag;
        const fade = a1 > 300 ? Math.max(0, 1 - (a1 - 300) / 60) : 1;
        const alpha = Math.min(0.95, strength * fade);

        line3d(0, 0, 0, nx, ny, nz, `rgba(6, 214, 160, ${alpha})`, 2.5);
        line3d(0, 0, 0, -nx, -ny, -nz, `rgba(6, 214, 160, ${alpha * 0.25})`, 1);
        const tip = p3d(nx, ny, nz);
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 214, 160, ${alpha})`; ctx.fill();
        ctx.beginPath(); ctx.arc(tip.x, tip.y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(6, 214, 160, ${alpha * 0.3})`; ctx.lineWidth = 1; ctx.stroke();
        if (alpha > 0.15) {
          ctx.fillStyle = `rgba(6, 214, 160, ${alpha})`;
          ctx.font = "bold 11px 'JetBrains Mono', monospace";
          ctx.fillText("3rd \u22a5", tip.x + 10, tip.y - 8);
        }

        // Plane triangle between the two arms
        if (a2 > 2) {
          const arm1T = p3d(R*0.6*Math.cos(a1r), R*0.6*Math.sin(a1r), 0);
          const arm2T = p3d(R*0.6*Math.cos(a2r), 0, R*0.6*Math.sin(a2r));
          const orig = p3d(0,0,0);
          ctx.beginPath();
          ctx.moveTo(orig.x, orig.y); ctx.lineTo(arm1T.x, arm1T.y); ctx.lineTo(arm2T.x, arm2T.y);
          ctx.closePath();
          ctx.fillStyle = `rgba(6, 214, 160, ${alpha * 0.1})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(6, 214, 160, ${alpha * 0.25})`;
          ctx.lineWidth = 1; ctx.stroke();
        }

        // Trail of third axis tip
        if (a2 > 5) {
          ctx.beginPath();
          let first = true;
          for (let ta = 90; ta <= a1; ta += 2) {
            const ta2v = Math.max(0, ta - 90);
            const ta1r = (ta * Math.PI) / 180;
            const ta2r = (ta2v * Math.PI) / 180;
            const tcx = Math.sin(ta1r) * Math.sin(ta2r);
            const tcy = -Math.cos(ta1r) * Math.sin(ta2r);
            const tcz = -Math.sin(ta1r) * Math.cos(ta2r);
            const tmag = Math.sqrt(tcx*tcx + tcy*tcy + tcz*tcz);
            if (tmag > 0.02) {
              const tp = p3d((tcx/tmag)*scale, (tcy/tmag)*scale, (tcz/tmag)*scale);
              if (first) { ctx.moveTo(tp.x, tp.y); first = false; }
              else ctx.lineTo(tp.x, tp.y);
            }
          }
          ctx.strokeStyle = "rgba(6, 214, 160, 0.3)";
          ctx.lineWidth = 1.5; ctx.stroke();
        }
      }
    }

    // AXES
    line3d(-R*1.4, 0, 0, R*1.4, 0, 0, "rgba(255,255,255,0.5)", 1.5);
    line3d(0, -R*1.4, 0, 0, R*1.4, 0, "rgba(255,255,255,0.25)", 1);
    line3d(0, 0, -R*1.4, 0, 0, R*1.4, "rgba(255,255,255,0.25)", 1);
    [{ p:[R*1.35,0,0], l:"X" }, { p:[0,R*1.35,0], l:"Y" }, { p:[0,0,R*1.35], l:"Z" }].forEach(a => {
      const lp = p3d(a.p[0], a.p[1], a.p[2]);
      ctx.fillStyle = "rgba(255,255,255,0.35)";
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.fillText(a.l, lp.x + 4, lp.y - 4);
    });

    // ACTIVE ARMS
    {
      const ax = R * Math.cos(a1r), ay = R * Math.sin(a1r);
      line3d(0, 0, 0, ax, ay, 0, "#ffd166", 3);
      const tip = p3d(ax, ay, 0);
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffd166"; ctx.fill();
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 13, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,209,102,0.25)"; ctx.lineWidth = 1; ctx.stroke();
    }
    if (a2 > 0) {
      const ax = R * Math.cos(a2r), az = R * Math.sin(a2r);
      line3d(0, 0, 0, ax, 0, az, "#00b4d8", 3);
      const tip = p3d(ax, 0, az);
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#00b4d8"; ctx.fill();
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 13, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,180,216,0.25)"; ctx.lineWidth = 1; ctx.stroke();
    }

    // QUARTER MARKERS
    [
      { pos:[R,0,0], label:"0T", c:"#ffd166" },
      { pos:[0,R,0], label:"1T", c:"#ffd166" },
      { pos:[-R,0,0], label:"2T fold", c:"#e94560" },
      { pos:[0,-R,0], label:"3T", c:"#ffd166" },
      { pos:[0,0,R], label:"1T'", c:"#00b4d8" },
      { pos:[0,0,-R], label:"3T'", c:"#00b4d8" },
    ].forEach(m => {
      const mp = p3d(m.pos[0], m.pos[1], m.pos[2]);
      ctx.beginPath(); ctx.arc(mp.x, mp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = m.c; ctx.fill();
      ctx.fillStyle = `${m.c}99`;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(m.label, mp.x + 6, mp.y - 5);
    });

    // CENTER FOLD
    const cp = p3d(0, 0, 0);
    ctx.beginPath(); ctx.arc(cp.x, cp.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill();
    ctx.beginPath(); ctx.arc(cp.x, cp.y, 14, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillText("\u2205", cp.x - 20, cp.y + 5);

    // STATUS
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 15px 'JetBrains Mono', monospace";
    ctx.fillText(`Arm 1: ${(a1/90).toFixed(2)}T  (${Math.round(a1)}\u00b0)`, 14, 26);
    ctx.fillStyle = a2 > 0 ? "#00b4d8" : "#333";
    ctx.fillText(`Arm 2: ${(a2/90).toFixed(2)}T  (${Math.round(a2)}\u00b0)`, 14, 46);
    let phase = "", phaseColor = "#444";
    if (a1 < 90) { phase = "Arm 1 sweeping vertical \u2014 space opening"; phaseColor = "#ffd166"; }
    else if (a2 < 1) { phase = "1T reached \u2014 Arm 2 STARTS in horizontal"; phaseColor = "#00b4d8"; }
    else if (a1 < 180) { phase = "Both sweeping \u2014 cone forming \u2014 3rd axis alive"; phaseColor = "#06d6a0"; }
    else if (a1 < 270) { phase = "2T FOLD \u2014 Arm 1 past fold \u2014 collapsing"; phaseColor = "#e94560"; }
    else { phase = "Closing \u2014 returning to start"; phaseColor = "#555"; }
    ctx.fillStyle = phaseColor;
    ctx.font = "12px 'JetBrains Mono', monospace";
    ctx.fillText(phase, 14, H - 14);
    ctx.fillStyle = "#222";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillText("drag to orbit", W - 95, H - 10);

  }, [angle, viewRotX, viewRotY, project]);

  return (
    <div style={{
      background: "#06060a", minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", padding: "14px",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace", color: "#e0e0e0", userSelect: "none"
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 300, letterSpacing: 4, color: "#fff", margin: "0 0 2px 0" }}>
        THE OPENING OF SPACE
      </h1>
      <div style={{ fontSize: 10, color: "#444", letterSpacing: 2, marginBottom: 12 }}>
        Two perpendicular planes &bull; 1T phase delay &bull; cone surface &bull; third axis trail
      </div>
      <canvas ref={canvasRef} width={680} height={580}
        style={{ border: "1px solid #151520", borderRadius: 8, cursor: "grab", background: "#06060a" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp} />
      <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => setPlaying(!playing)}
          style={{ padding: "7px 22px", background: playing ? "#e94560" : "#06d6a0", color: "#06060a",
            border: "none", borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 12, letterSpacing: 1 }}>
          {playing ? "PAUSE" : "PLAY"}
        </button>
        <button onClick={() => { setAngle(0); setPlaying(false); }}
          style={{ padding: "7px 22px", background: "transparent", color: "#666", border: "1px solid #222",
            borderRadius: 4, cursor: "pointer", fontFamily: "inherit", fontSize: 12, letterSpacing: 1 }}>
          RESET
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: "#444" }}>SPEED</span>
          <input type="range" min="0.05" max="1.5" step="0.05" value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: 70 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: "#444" }}>ANGLE</span>
          <input type="range" min="0" max="360" step="0.5" value={angle}
            onChange={e => { setPlaying(false); setAngle(parseFloat(e.target.value)); }} style={{ width: 180 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
        {[
          { label: "Front", rx: 0, ry: 0 },
          { label: "3/4", rx: -25, ry: 35 },
          { label: "Top", rx: -89, ry: 0 },
          { label: "Side", rx: 0, ry: 90 },
          { label: "Below", rx: 40, ry: 25 },
        ].map(v => (
          <button key={v.label} onClick={() => { setViewRotX(v.rx); setViewRotY(v.ry); }}
            style={{ padding: "3px 10px", fontSize: 10, background: "transparent", color: "#555",
              border: "1px solid #1a1a1a", borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { color: "#ffd166", label: "Arm 1 trail (XY)" },
          { color: "#00b4d8", label: "Arm 2 trail (XZ, 1T delay)" },
          { color: "#06d6a0", label: "Cone + 3rd axis \u22a5" },
          { color: "#fff", label: "\u2205 fold" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
            <span style={{ fontSize: 10, color: "#444" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
