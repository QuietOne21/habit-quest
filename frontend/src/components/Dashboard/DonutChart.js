import React, { useRef, useEffect } from 'react';
import { Chart, DoughnutController, ArcElement } from 'chart.js';

Chart.register(DoughnutController, ArcElement);

export default function DonutChart({ pct, color, size = 120 }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [pct, 100 - pct],
          backgroundColor: [color, 'rgba(255,255,255,0.06)'],
          borderWidth: 0,
          hoverOffset: 4,
        }]
      },
      options: {
        cutout: '75%',
        responsive: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        }
      }
    });

    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, [pct, color]);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: 'auto' }}>
      <canvas ref={canvasRef} width={size} height={size} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: 20, fontWeight: 800,
        fontFamily: 'Syne, sans-serif', color,
      }}>
        {Math.round(pct)}%
      </div>
    </div>
  );
}