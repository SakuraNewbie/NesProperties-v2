import React from "react";

const Compass = ({ lon }) => (
  <div
    className="shadow-lg border border-white/20"
    style={{
      width: 54,
      height: 54,
      borderRadius: "50%",
      background: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    }}
  >
    <svg
      width="38"
      height="38"
      style={{
        transform: `rotate(${-lon}deg)`,
        transition: "transform 0.1s linear",
      }}
      viewBox="0 0 32 32"
    >
      <circle cx="16" cy="16" r="15" fill="#fff" opacity="0.12" />
      {/* FOV cone */}
      <path
        d="M16 16 L16 4 A12 12 0 0 1 28 16 Z"
        fill="#10b981"
        opacity="0.3"
        transform="rotate(-30 16 16)"
      />
      <path
        d="M16 16 L16 4 A12 12 0 0 0 4 16 Z"
        fill="#10b981"
        opacity="0.3"
        transform="rotate(30 16 16)"
      />
      <polygon points="16,4 20,20 16,16 12,20" fill="#f43f5e" />
      <text x="16" y="29" textAnchor="middle" fontSize="8" fill="#fff">
        N
      </text>
    </svg>
  </div>
);

export default Compass;