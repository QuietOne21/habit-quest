import React, { useRef, useEffect } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

export default function MomentumChart({ dailyData = [] }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    const labels = dailyData.map(d => d.day);
    const data   = dailyData.map(d => d.pct);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          fill: true,
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderColor: '#06B6D4',
          pointBackgroundColor: '#67E8F9',
          pointRadius: 3,
          tension: 0.4,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748B', font: { size: 10 }, callback: v => v + '%' }, min: 0, max: 100 }
        }
      }
    });

    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [dailyData]);

  return <div className="chart-wrap"><canvas ref={canvasRef} /></div>;
}