import React from 'react';
import DayBox from './DayBox';

const WEEK_COLORS = ['#7C3AED','#06B6D4','#EC4899','#F59E0B','#10B981'];

export default function HabitTable({ habits, year, month, isCompleted, onToggle }) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const weekBoundaries = [];
  for (let d = 0; d < daysInMonth; d += 7) {
    weekBoundaries.push([d, Math.min(d + 7, daysInMonth)]);
  }

  const dayNames = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    dayNames.push(['S','M','T','W','T','F','S'][date.getDay()]);
  }

  return (
    <table className="habit-table">
      <thead>
        <tr>
          <th style={{ textAlign: 'left', padding: '6px 10px 6px 0', fontSize: 12, whiteSpace: 'nowrap' }}>Daily Habit</th>
          <th style={{ fontSize: 12, padding: '6px 8px' }}>Goal</th>
          {weekBoundaries.map(([start, end], wi) => (
            <th key={wi} colSpan={end - start} style={{ color: WEEK_COLORS[wi % WEEK_COLORS.length], fontSize: 11, fontWeight: 700, padding: '6px 2px 2px' }}>
              Week {wi + 1}
            </th>
          ))}
        </tr>
        <tr>
          <td /><td />
          {dayNames.map((n, i) => (
            <td key={i} style={{ textAlign: 'center', color: '#64748B', fontSize: 10, padding: '0 2px' }}>{n}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        {habits.map(h => (
          <tr key={h.id}>
            <td className="habit-name-cell">{h.name}</td>
            <td className="goal-cell">{daysInMonth}</td>
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const weekNum = Math.floor(i / 7) + 1;
              return (
                <td key={day} className="day-cell">
                  <DayBox habitId={h.id} day={day} completed={isCompleted(h.id, day)} weekNum={weekNum} onToggle={onToggle} />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}