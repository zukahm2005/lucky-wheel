import React, { useState } from "react";
import "./SelectPopup.css";

export default function SelectPopup({ onClose, onSelect }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("10tr");

  const options = [
    { label: "500.000VND", value: "500k" },
    { label: "1.000.000VND", value: "1tr" },
  ];

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <h2>Chọn mức giá</h2>

        <div className="custom-select">
          <div className="custom-select-trigger" onClick={() => setOpen(!open)}>
            {options.find((o) => o.value === value)?.label}
            <span className="arrow">{open ? "▲" : "▼"}</span>
          </div>
          {open && (
            <div className="custom-options">
              {options.map((o) => (
                <div
                  key={o.value}
                  className={`custom-option ${value === o.value ? "selected" : ""}`}
                  onClick={() => {
                    setValue(o.value);
                    setOpen(false);
                  }}
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="confirm-btn"
          onClick={() => {
            onSelect(value);
            onClose();
          }}
        >
          Xác nhận
        </button>
      </div>
    </div>
  );
}
