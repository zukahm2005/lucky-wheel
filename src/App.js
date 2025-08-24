import React from "react";
import LuckyWheel from "./components/LuckyWheel";
import segments from "./data/segments.json";
import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="app-content">
        <h2 className="title">🎡 Vòng quay may mắn</h2>
        <LuckyWheel segments={segments} />
      </div>
    </div>
  );
}

export default App;
