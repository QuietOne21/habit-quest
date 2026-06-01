import { useState, useEffect, useCallback } from 'react';
import { getHabits, getMonthEntries, 
        toggleEntry as apiToggle, resetMonth as apiReset } from '../api/client';

export function useHabits(year, month) {
    const [habits, setHabits] = useState([]);
    const [entries,setEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [habitsRes, entriesRes] = await Promise.all([
                getHabits(), getMonthEntries(year, month),
            ]);
            setHabits(habitsRes.data);
            setEntries(entriesRes.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to load habits');
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleEntry = async (habitId, day, completed) => {
    try {
      const dateStr = typeof day === 'string'
        ? day
        : `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const res = await apiToggle(habitId, dateStr, completed);

      setEntries(prev => {
        const filtered = prev.filter(
          e => !(e.habitId === habitId && e.date === dateStr)
        );
        return [...filtered, res.data];
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to toggle');
    }
  };

   const resetAllEntries = async () => {
    try {
      await apiReset(year, month);
      setEntries([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset');
    }
  };

  const isCompleted = (habitId, day) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return entries.some(
      e => e.habitId === habitId && e.date === dateStr && e.completed
    );
  };

  return {
    habits, entries, loading, error,
    toggleEntry, resetAllEntries, isCompleted,
    refetch: fetchData,
  };


 }