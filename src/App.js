import React, { useEffect, useState } from "react";
import LuckyWheel from "./components/LuckyWheel";
import SelectPopup from "./components/SelectPopup";
import segments from "./data/segments.json";
import posterMobile from "./assets/backgroundmobile.png";
import posterDesktop from "./assets/backgroundpc.png";

import "./App.css";

function App() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1200);
  const [selectedPrice, setSelectedPrice] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 1200);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const bgStyle = {
    backgroundImage: `url(${isDesktop ? posterDesktop : posterMobile})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: isDesktop ? "auto 100%" : "cover",
    backgroundPosition: isDesktop ? "top center" : "bottom center",
    backgroundColor: "#6c98a3",
  };

  return (
    <div className="app" style={bgStyle}>
      <div className="app-content">
        <div className="wheel-wrapper">
          {!selectedPrice ? (
            <SelectPopup
              onClose={() => {}}
              onSelect={(value) => setSelectedPrice(value)}
            />
          ) : (
            <LuckyWheel segments={segments} selectedPrice={selectedPrice} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
