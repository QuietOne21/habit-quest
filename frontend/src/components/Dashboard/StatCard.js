import React from 'react';
import './StatCard.css';

const GLOW_MAP = {
  '#A78BFA': 'glow-purple',
  '#67E8F9': 'glow-cyan',
  '#F9A8D4': 'glow-pink',
  '#FCD34D': 'glow-yellow',
  '#6EE7B7': 'glow-cyan',
};

export default function StatCard({ label, value, sub, color }) {
  const glowClass = GLOW_MAP[color] || 'glow-purple';

  return (
    <div className={`stat-card ${glowClass}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-val" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}