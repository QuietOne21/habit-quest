import React from 'react';

export default function DayBox({ habitId, day, completed, weekNum, onToggle }) {
  const handleClick = () => {
    onToggle(habitId, day, !completed);
  };

  const className = completed ? `day-box done w${weekNum}` : 'day-box';

  return (
    <div
      className={className}
      onClick={handleClick}
      role="checkbox"
      aria-checked={completed}
      aria-label={`Day ${day}`}
      data-testid={`daybox-${habitId}-${day}`}
    >
      {completed ? '✓' : ''}
    </div>
  );
}