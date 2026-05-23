import React from 'react';
import HabitTable from './HabitTable';
import HabitProgressBars from './HabitProgressBars';
import './DailyPanel.css';

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

export default function DailyPanel({ habits, entries, year, month, isCompleted, onToggle, onReset }) {
  return (
    <div className="daily-grid">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span className="badge badge-purple">📊 Auto progress bars</span>
        <span className="badge badge-cyan">📅 Track any month</span>
        <span className="badge badge-pink">🔥 Track streaks</span>
      </div>

      <div className="glass-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="sec-title">Daily Habits — {MONTH_NAMES[month]} {year}</div>
          <button className="header-logout" onClick={onReset}>Reset Month</button>
        </div>

        <div className="scroll-x">
          <HabitTable habits={habits} year={year} month={month} isCompleted={isCompleted} onToggle={onToggle} />
        </div>

        <div style={{ marginTop: 24 }}>
          <HabitProgressBars habits={habits} entries={entries} year={year} month={month} />
        </div>
      </div>
    </div>
  );
}