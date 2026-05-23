import React from 'react';

export default function WeekCards({ weeklyData = [] }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {weeklyData.map(w => (
        <div className="week-card" key={w.weekNumber}>
          <div className="week-card-label">{w.label}</div>
          <div className="week-card-val" style={{ color: w.color }}>{w.completionPct}%</div>
          <div className="pbar-track" style={{ marginTop: 8 }}>
            <div className="pbar-fill" style={{ width: `${w.completionPct}%`, background: w.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}