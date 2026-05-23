import React from 'react';
import './ProgressBar.css';

export default function ProgressBar({ label, value, max, color, showFraction = true }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="progress-row">
      <span className="progress-label">{label}</span>
      <div className="pbar-track" style={{ flex: 2 }}>
        <div
          className="pbar-fill"
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 8px ${color}40`,
          }}
        />
      </div>
      <span className="progress-value" style={{ color }}>
        {showFraction ? `${value}/${max}` : `${pct}%`}
      </span>
    </div>
  );
}