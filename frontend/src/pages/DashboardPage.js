import React, { useState, useCallback } from 'react';
import Header from '../components/Layout/Header';
import TabNav from '../components/Layout/TabNav';
import AnnualPanel from '../components/Annual/AnnualPanel';
import MonthlyPanel from '../components/Monthly/MonthlyPanel';
import DailyPanel from '../components/Daily/DailyPanel';
import { useStats } from '../hooks/useStats';
import { useHabits } from '../hooks/useHabits';

export default function DashboardPage() {
  const now = new Date();
  const [year]      = useState(now.getFullYear());
  const [month]     = useState(now.getMonth() + 1);
  const [activeTab, setActiveTab] = useState('annual');

  const { dashboard, loading: statsLoading, refetch: refetchStats } = useStats(year, month);
  const { habits, entries, loading: habitsLoading, isCompleted, toggleEntry, resetAllEntries, refetch: refetchHabits } = useHabits(year, month);

  const handleToggle = useCallback(async (habitId, day, completed) => {
    await toggleEntry(habitId, day, completed);
    refetchStats();
  }, [toggleEntry, refetchStats]);

  const handleReset = useCallback(async () => {
    if (window.confirm('Reset all entries for this month?')) {
      await resetAllEntries();
      refetchStats();
    }
  }, [resetAllEntries, refetchStats]);

  const isLoading = statsLoading || habitsLoading;

  return (
    <div style={{ maxWidth: 1200, margin: 'auto', position: 'relative', zIndex: 1 }}>
      <Header dashboard={dashboard} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {isLoading && (
        <div style={{ padding: 60, textAlign: 'center', color: '#64748B', fontSize: 16 }}>
          Loading dashboard...
        </div>
      )}

      {!isLoading && activeTab === 'annual'  && <AnnualPanel dashboard={dashboard} />}
      {!isLoading && activeTab === 'monthly' && <MonthlyPanel dashboard={dashboard} />}
      {!isLoading && activeTab === 'daily'   && (
        <DailyPanel
          habits={habits} entries={entries} year={year} month={month}
          isCompleted={isCompleted} onToggle={handleToggle} onReset={handleReset}
        />
      )}
    </div>
  );
}