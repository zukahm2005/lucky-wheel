import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

export default function LuckyWheel({ segments: _segments, spinDurationMs = 4500 }) {
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

  // canvas confetti toàn màn hình
  const canvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && !confettiInstanceRef.current) {
      confettiInstanceRef.current = confetti.create(canvasRef.current, { resize: true, useWorker: true });
    }
  }, []);

  const n = Math.max(segments.length, 1);
  const sliceAngle = 360 / n;
  const totalWeight = useMemo(() => segments.reduce((sum, s) => sum + (s.weight || 1), 0), [segments]);

  function autoColor(i) {
    const hue = Math.round((i / 12) * 360);
    return `hsl(${hue}, 75%, 60%)`;
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
    c({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    setTimeout(() => c({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 } }), 150);
    setTimeout(() => c({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 } }), 300);
  }

  function spin() {
    if (isSpinning || segments.length === 0) return;
    setIsSpinning(true);
    setResultIndex(null);

    const targetIndex = pickWeightedIndex();
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
    <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Canvas confetti toàn màn hình */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1500   // trên overlay nhưng dưới popup box
        }}
      />

      <div style={{ position: "relative" }}>
        {/* Nút tâm đỏ + mũi tên nhô ra → bấm vào để quay */}
        <div
          onClick={spin}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 5,
            width: 90,
            height: 90,
            borderRadius: "50%",
            background: "#e11d48",
            border: "6px solid #fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 18,
            cursor: "pointer",
            userSelect: "none"
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -29,
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "20px solid transparent",
              borderRight: "20px solid transparent",
              borderBottom: "34px solid #e11d48"
            }}
          />
          GO
        </div>

        {/* Bánh xe */}
        <div
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            border: "4px solid #fff",
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? `transform ${spinDurationMs}ms cubic-bezier(0.12, 0.11, 0, 1)` : undefined,
            background: "#fff",
          }}
        >
          <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
            <circle cx={cx} cy={cy} r={r + 4} fill="#f3f4f6" />
            {Array.from({ length: n }).map((_, i) => {
              const start = i * sliceAngle;
              const end = start + sliceAngle;
              const path = arcPath(cx, cy, r, start, end);
              const fill = segments[i]?.color || autoColor(i);
              const mid = start + sliceAngle / 2;
              const labelPos = polarToCartesian(cx, cy, r * 0.68, mid);
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
                        style={{ fontSize: 12, fontWeight: 700, fill: "#111827" }}
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

      {/* Popup kết quả */}
      {showPopup && resultIndex !== null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000   // overlay dưới confetti
          }}
          onClick={() => setShowPopup(false)}
        >
          <div
            style={{
              position: "relative",
              background: "#fff",
              padding: "24px 32px",
              borderRadius: 12,
              textAlign: "center",
              minWidth: 280,
              zIndex: 2000   // popup box cao nhất
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 12 }}>🎉 Chúc mừng!</h2>
            <p>Bạn đã trúng: <strong>{segments[resultIndex].label}</strong></p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: 16,
                padding: "8px 16px",
                border: "none",
                background: "#e11d48",
                color: "#fff",
                borderRadius: 6
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
