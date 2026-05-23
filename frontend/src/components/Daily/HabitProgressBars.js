import React from 'react';
import ProgressBar from '../Dashboard/ProgressBar';

const COLORS = ['#A78BFA','#67E8F9','#F9A8D4','#FCD34D','#6EE7B7','#FB923C','#818CF8','#F472B6','#34D399'];

export default function HabitProgressBars({ habits, entries, year, month }) {
  const daysInMonth = new Date(year, month, 0).getDate();

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
        Progress per habit
      </div>
      {habits.map((h, i) => {
        const done = entries.filter(e => e.habitId === h.id && e.completed).length;
        return (
          <ProgressBar key={h.id} label={h.name} value={done} max={daysInMonth} color={COLORS[i % COLORS.length]} />
        );
      })}
    </div>
  );
}