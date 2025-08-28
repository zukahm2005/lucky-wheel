import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import "./LuckyWheel.css";

export default function LuckyWheel({ segments: _segments, spinDurationMs = 4500, selectedPrice }) {
  const segments = useMemo(() => {
    return (_segments?.length ? _segments : []).map((s, i) => ({
      ...s,
      weight: typeof s.weight === "number" && s.weight > 0 ? s.weight : 1,
      color: s.color || autoColor(i),
    }));
  }, [_segments]);

  const [isSpinning, setIsSpinning] = useState(false);
  const [resultIndex, setResultIndex] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showPopup, setShowPopup] = useState(false);

  // state để biết có phải web hay không
  const [isWeb, setIsWeb] = useState(window.innerWidth > 1200);

  const canvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsWeb(window.innerWidth > 1200);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (canvasRef.current && !confettiInstanceRef.current) {
      confettiInstanceRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
  }, []);

  const n = Math.max(segments.length, 1);
  const sliceAngle = 360 / n;
  const totalWeight = useMemo(
    () => segments.reduce((sum, s) => sum + (s.weight || 1), 0),
    [segments]
  );

  function autoColor(i) {
    const colors = ["#6c98a3", "#ffffff"];
    return colors[i % colors.length];
  }

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx, cy, r, start, end) {
    const startPt = polarToCartesian(cx, cy, r, end);
    const endPt = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? 0 : 1;
    return `M ${cx} ${cy} L ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 0 ${endPt.x} ${endPt.y} Z`;
  }

  function pickWeightedIndex() {
    const r = Math.random() * totalWeight;
    let acc = 0;
    for (let i = 0; i < segments.length; i++) {
      acc += segments[i].weight || 1;
      if (r < acc) return i;
    }
    return segments.length - 1;
  }

  function fireConfetti() {
    const c = confettiInstanceRef.current || confetti;

    c({ particleCount: 200, spread: 180, startVelocity: 45, origin: { x: 0.5, y: 0.5 } });
    setTimeout(() => c({ particleCount: 100, spread: 120, angle: 60, origin: { x: 0, y: 1 } }), 200);
    setTimeout(() => c({ particleCount: 100, spread: 120, angle: 120, origin: { x: 1, y: 1 } }), 200);
    setTimeout(() => c({ particleCount: 100, spread: 120, angle: 240, origin: { x: 1, y: 0 } }), 400);
    setTimeout(() => c({ particleCount: 100, spread: 120, angle: 300, origin: { x: 0, y: 0 } }), 400);
  }

  function spin() {
    if (isSpinning || segments.length === 0) return;
    setIsSpinning(true);
    setResultIndex(null);

    let targetIndex;

    // ✅ ép kết quả theo selectedPrice
    if (selectedPrice === "500k") {
      targetIndex = segments.findIndex((s) => s.label === "500.000VND");
    } else if (selectedPrice === "1tr") {
      targetIndex = segments.findIndex((s) => s.label === "1.000.000VND");
    } else {
      targetIndex = pickWeightedIndex();
    }

    if (targetIndex === -1) targetIndex = pickWeightedIndex();

    const sliceCenterOffset = sliceAngle / 2;
    const targetSliceStart = targetIndex * sliceAngle;
    const targetCenter = targetSliceStart + sliceCenterOffset;

    const extraSpins = 5 + Math.floor(Math.random() * 4);
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.6);

    const finalRotation = rotation + extraSpins * 360 + (360 - targetCenter) + jitter;
    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setResultIndex(targetIndex);
      setShowPopup(true);
      fireConfetti();
    }, spinDurationMs + 60);
  }

  const size = 360;
  const r = size / 2 - 6;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className={`wheel-container ${isWeb ? "wheel-container-web" : ""}`}>
      <canvas ref={canvasRef} className="wheel-canvas" />

      <div style={{ position: "relative" }}>
        <div
          className="wheel-button"
          onClick={spin}
        >
          Quay
          <div className="wheel-button-arrow" />
        </div>

        <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          <svg
            viewBox={`0 0 ${size} ${size}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          >
            <circle cx={cx} cy={cy} r={r + 4} fill="#f3f4f6" />
            {Array.from({ length: n }).map((_, i) => {
              const start = i * sliceAngle;
              const end = start + sliceAngle;
              const path = arcPath(cx, cy, r, start, end);
              const fill = segments[i]?.color || autoColor(i);
              const mid = start + sliceAngle / 2;
              const labelPos = polarToCartesian(cx, cy, r * (isWeb ? 0.72 : 0.6), mid);
              const rotateText = mid + 90;

              return (
                <g key={i}>
                  <path d={path} fill={fill} stroke="#fff" strokeWidth={2} />
                  {segments[i] && (
                    <g transform={`translate(${labelPos.x}, ${labelPos.y}) rotate(${rotateText})`}>
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: size * (isWeb ? 0.038 : 0.045),
                          fontWeight: 700,
                          fill: fill === "#6c98a3" ? "#fff" : "#111827",
                          pointerEvents: "none",
                        }}
                      >
                        {segments[i].label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {showPopup && resultIndex !== null && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <h2>Chúc mừng!</h2>
            <p>
              Bạn đã trúng: <strong>{segments[resultIndex].label}</strong>
            </p>
            <button onClick={() => setShowPopup(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}
