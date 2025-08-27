import React from "react";
import LuckyWheel from "./components/LuckyWheel";
import segments from "./data/segments.json";
import "./App.css";

function App() {
  return (
    <div
      className="app"
      style={{ backgroundImage: "url('/images/White Blue Illustrative Motorbike Rental Poster.png')" }}
    >
      <div className="app-content">
        <div className="wheel-wrapper">
          <LuckyWheel segments={segments} />
        </div>
      </div>
    </div>
  );
}

export default App;
