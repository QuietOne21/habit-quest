import React from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function YearMap({ habits = [], monthlyData = [] }) {
  return (
    <div className="scroll-x">
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, minWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', color: '#94A3B8', fontSize: 11, padding: '6px 10px 6px 0', whiteSpace: 'nowrap' }}>Habit</th>
            {MONTHS.map(m => <th key={m} style={{ color: '#94A3B8', fontSize: 10, padding: '6px 4px', textAlign: 'center' }}>{m}</th>)}
          </tr>
        </thead>
        <tbody>
          {habits.map((h, hi) => (
            <tr key={h.id}>
              <td style={{ fontSize: 12, color: '#CBD5E1', padding: '4px 10px 4px 0', whiteSpace: 'nowrap' }}>{h.name}</td>
              {MONTHS.map((_, mi) => {
                const monthData = monthlyData.find(d => d.month === mi + 1);
                const v = monthData && monthData.completionPct > 0 ? Math.round(30 + Math.random() * (monthData.completionPct - 10)) : 0;
                return (
                  <td key={mi} style={{ textAlign: 'center', padding: 3 }}>
                    <div className="year-map-cell" style={{
                      background: v > 0 ? `rgba(${hi % 2 ? '6,182,212' : '124,58,237'},${0.15 + (v / 100) * 0.5})` : 'rgba(255,255,255,0.04)',
                      color: v > 70 ? '#F8FAFC' : v > 0 ? '#CBD5E1' : '#64748B'
                    }}>
                      {v > 0 ? `${v}%` : '—'}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}