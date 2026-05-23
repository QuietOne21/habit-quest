import React from 'react';
import StatCard from '../Dashboard/StatCard';
import MomentumChart from './MomentumChart';
import TopHabits from './TopHabits';
import StreakList from './StreakList';
import WeekCards from './WeekCards';
import './MonthlyPanel.css';

const MONTH_NAMES = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MonthlyPanel({ dashboard }) {
  const monthly = dashboard?.currentMonth;
  if (!monthly) return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading monthly stats...</div>;

  const bestWeek = monthly.weeklyBreakdown?.reduce(
    (best, w) => w.completionPct > (best?.completionPct || 0) ? w : best, null
  );

  return (
    <div className="monthly-grid">
      <div className="monthly-stats-grid">
        <StatCard label="Month" value={MONTH_NAMES[monthly.month] || monthly.monthName}
          sub={`${monthly.daysTracked} days tracked`} color="#67E8F9" />
        <StatCard label="Completion" value={`${monthly.completionPct}%`}
          sub={`${monthly.totalEntries - monthly.completedEntries} left`} color="#A78BFA" />
        <StatCard label="Best Week" value={bestWeek?.label || '—'}
          sub={`${bestWeek?.completionPct || 0}% complete`} color="#FCD34D" />
        <StatCard label="Habits Done" value={monthly.completedEntries}
          sub={`of ${monthly.totalEntries} total`} color="#6EE7B7" />
      </div>

      <div className="glass-card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="sec-title">Daily Momentum</div>
        <MomentumChart dailyData={monthly.dailyBreakdown} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="sec-title">Top Habits</div>
          <TopHabits habitStats={monthly.habitBreakdown} />
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="sec-title">Streak Tracking</div>
          <StreakList streaks={monthly.streaks} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div className="sec-title">Weekly Breakdown</div>
        <WeekCards weeklyData={monthly.weeklyBreakdown} />
      </div>
    </div>
  );
}