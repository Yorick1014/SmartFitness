import React from "react";
import { poses } from "./poses";
export default function Preview({ exercise, moving = false, overlay = true }) {
  const p = poses[exercise.id] || poses.curls;
  return (
    <div className={`motion-preview ${moving ? "moving" : ""}`}>
      <svg
        className="pose-svg"
        viewBox="0 0 220 220"
        fill="none"
        aria-hidden="true"
      >
        <ellipse cx="110" cy="205" rx="82" ry="5" fill="#ffffff08" />
        <g className="body-motion">
          <circle cx={p.head[0]} cy={p.head[1]} r="15" fill="#bcbcff" />
          <path
            d={p.body}
            stroke="#7779bc"
            strokeWidth="9"
            strokeLinecap="round"
          />
          <path
            d={p.legs}
            stroke="#9b9ddb"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={p.arms}
            stroke="#bcbcff"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {overlay && (
            <g>
              <path
                d={`${p.body} ${p.arms} ${p.legs}`}
                stroke="#b4b1ff"
                strokeWidth="2"
              />
              {p.joints.map(([x, y], i) => (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#d7d4ff"
                  stroke="#6262df"
                  strokeWidth="1.4"
                />
              ))}
            </g>
          )}
        </g>
      </svg>
    </div>
  );
}
