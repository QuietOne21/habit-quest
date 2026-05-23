import React from 'react';
import StatCard from '../Dashboard/StatCard';
import MonthlyBars from './MonthlyBars';
import DonutChart from '../Dashboard/DonutChart';
import YearMap from './YearMap';
import './AnnualPanel.css';

export default function AnnualPanel({ dashboard }) {
  const annual = dashboard?.annual;
  const user   = dashboard?.user;

  if (!annual) return <div style={{ padding: 40, textAlign: 'center', color: '#64748B' }}>Loading annual stats...</div>;

  return (
    <div className="annual-grid">
      <div className="annual-stats-grid">
        <StatCard label="Yearly Progress" value={`${annual.completionPct}%`}
          sub={`${annual.completedHabits} / ${annual.totalHabits} habits`} color="#A78BFA" />
        <StatCard label="Best Month" value={annual.bestMonth || '—'}
          sub={`${annual.bestMonthPct}% completion`} color="#67E8F9" />
        <StatCard label="Current Streak" value={`${user?.currentStreak || 0} days`}
          sub={`Longest: ${user?.longestStreak || 0} days`} color="#F9A8D4" />
        <StatCard label="XP Earned" value={user?.xp?.toLocaleString() || '0'}
          sub={`Next level: ${user?.xpToNextLevel || 0} XP`} color="#FCD34D" />
      </div>

      <div className="annual-charts-grid">
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="sec-title">Monthly Performance</div>
          <MonthlyBars monthlyData={annual.monthlyBreakdown} />
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div className="sec-title">Overall Completion</div>
          <DonutChart pct={annual.completionPct} color="#7C3AED" />
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>
              <span>Annual goal</span><span style={{ color: '#A78BFA' }}>{annual.completionPct}%</span>
            </div>
            <div className="pbar-track">
              <div className="pbar-fill" style={{ width: `${annual.completionPct}%`, background: 'linear-gradient(90deg, #7C3AED, #A78BFA)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: 20 }}>
        <div className="sec-title">Yearly Progress Map</div>
        <YearMap habits={dashboard.habits} monthlyData={annual.monthlyBreakdown} />
      </div>
    </div>
  );
}