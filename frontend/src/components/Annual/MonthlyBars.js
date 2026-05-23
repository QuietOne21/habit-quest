import React from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#A78BFA','#67E8F9','#F9A8D4','#FCD34D','#6EE7B7','#FB923C','#818CF8','#F472B6','#34D399','#A78BFA','#67E8F9','#F9A8D4'];

export default function MonthlyBars({ monthlyData = [] }) {
  const values = MONTHS.map((_, i) => {
    const m = monthlyData.find(d => d.month === i + 1);
    return m ? m.completionPct : 0;
  });

  const active = values.filter(v => v > 0);
  const maxVal = Math.max(...active, 1);

  return (
    <>
      <div className="bar-row">
        {values.map((v, i) => {
          const pct = v ? (v / maxVal) * 100 : 3;
          return (
            <div className="bar-col" key={i}>
              <div className="bar-fill" style={{ height: `${pct}%`, background: v ? COLORS[i] : 'rgba(255,255,255,0.06)' }} />
            </div>
          );
        })}
      </div>
      <div className="bar-label-row">
        {MONTHS.map((m, i) => <div className="bar-lbl" key={i}>{m}</div>)}
      </div>
    </>
  );
}