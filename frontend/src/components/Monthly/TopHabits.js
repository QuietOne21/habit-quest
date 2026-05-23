import React from 'react';

const COLORS = ['#A78BFA','#67E8F9','#F9A8D4','#FCD34D','#6EE7B7','#FB923C','#818CF8','#F472B6','#34D399'];

export default function TopHabits({ habitStats = [] }) {
  return (
    <div>
      {habitStats.map((h, i) => (
        <div className="top-row" key={h.habitId}>
          <span className="top-rank">{i + 1}</span>
          <div style={{ flex: 1 }}>
            <div className="top-name">{h.name}</div>
            <div className="pbar-track" style={{ marginTop: 4 }}>
              <div className="pbar-fill" style={{ width: `${h.pct}%`, background: COLORS[i % COLORS.length] }} />
            </div>
          </div>
          <span className="top-pct" style={{ color: COLORS[i % COLORS.length] }}>{h.pct}%</span>
        </div>
      ))}
    </div>
  );
}