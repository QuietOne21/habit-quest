import React from 'react';
import './TabNav.css';

const TABS = [
  { id: 'annual',  label: 'Annual' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'daily',   label: 'Daily Habits' },
];

export default function TabNav({ activeTab, onTabChange }) {
  return (
    <div className="tabs">
      {TABS.map(tab => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}