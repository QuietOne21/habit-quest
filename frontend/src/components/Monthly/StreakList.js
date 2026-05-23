import React from 'react';

export default function StreakList({ streaks = [] }) {
  return (
    <div>
      {streaks.map(s => (
        <div className="streak-row" key={s.habitId}>
          <span className="streak-name">{s.name}</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>cur</span>
          <span className="streak-num" style={{ color: '#F9A8D4' }}>{s.currentStreak}</span>
          <span style={{ fontSize: 11, color: '#64748B' }}>best</span>
          <span className="streak-num" style={{ color: '#FCD34D' }}>{s.bestStreak}</span>
        </div>
      ))}
    </div>
  );
}