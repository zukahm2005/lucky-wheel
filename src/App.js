import React, { useState } from "react";
import LuckyWheel from "./components/LuckyWheel";
import segmentsData from "./data/segments.json";

function App() {
  const [segments] = useState(segmentsData);

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fafafa" }}>
      <div style={{ background: "#fff", padding: 20, borderRadius: 16, boxShadow: "0 6px 20px rgba(0,0,0,.1)" }}>
        <h1 style={{ textAlign: "center" }}>🎡 Vòng quay may mắn</h1>
        <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
        </p>

        <LuckyWheel segments={segments} spinDurationMs={4800} />
      </div>
    </div>
  );
}

export default App;
