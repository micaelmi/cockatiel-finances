'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  addYears,
  subYears,
  format,
} from 'date-fns';

export type DateRangePreset = 'week' | 'month' | 'year' | 'custom';

interface UseDateRangeReturn {
  /** The currently selected preset */
  preset: DateRangePreset;
  /** Set the preset and reset baseDate to now */
  setPreset: (preset: DateRangePreset) => void;
  /** Navigate forward or backward within the current preset */
  navigate: (direction: 'prev' | 'next') => void;
  /** Human-readable label for the current range */
  label: string;
  /** The start and end dates */
  dateRange: { from: Date; to: Date };
  /** Custom range (for the calendar picker) */
  customRange: { from: Date; to: Date } | undefined;
  /** Set a custom date range (also switches preset to 'custom') */
  setCustomRange: (range: { from: Date; to: Date }) => void;
  /** ISO string filters ready for API calls */
  filters: { from: string; to: string };
}

export function useDateRange(initialPreset: DateRangePreset = 'month'): UseDateRangeReturn {
  const [preset, setPresetState] = useState<DateRangePreset>(initialPreset);
  const [baseDate, setBaseDate] = useState(new Date());
  const [customRange, setCustomRangeState] = useState<{ from: Date; to: Date } | undefined>();

  const dateRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'week':
        start = startOfWeek(baseDate, { weekStartsOn: 1 });
        end = endOfWeek(baseDate, { weekStartsOn: 1 });
        break;
      case 'month':
        start = startOfMonth(baseDate);
        end = endOfMonth(baseDate);
        break;
      case 'year':
        start = startOfYear(baseDate);
        end = endOfYear(baseDate);
        break;
      case 'custom':
        start = customRange?.from || startOfMonth(new Date());
        end = customRange?.to || endOfMonth(new Date());
        break;
    }

    return { from: start, to: end };
  }, [preset, baseDate, customRange]);

  const label = useMemo(() => {
    const now = new Date();
    switch (preset) {
      case 'week':
        if (startOfWeek(baseDate, { weekStartsOn: 1 }).getTime() === startOfWeek(now, { weekStartsOn: 1 }).getTime()) {
          return 'THIS WEEK';
        }
        return `Week of ${format(startOfWeek(baseDate, { weekStartsOn: 1 }), 'MMM d')}`;
      case 'month':
        if (startOfMonth(baseDate).getTime() === startOfMonth(now).getTime()) {
          return 'THIS MONTH';
        }
        return format(baseDate, 'MMMM yyyy');
      case 'year':
        if (startOfYear(baseDate).getTime() === startOfYear(now).getTime()) {
          return 'THIS YEAR';
        }
        return format(baseDate, 'yyyy');
      case 'custom':
        if (customRange?.from && customRange?.to) {
          return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d')}`;
        }
        return 'Custom Range';
    }
  }, [preset, baseDate, customRange]);

  const navigate = useCallback((direction: 'prev' | 'next') => {
    switch (preset) {
      case 'week':
        setBaseDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
        break;
      case 'month':
        setBaseDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
        break;
      case 'year':
        setBaseDate(prev => direction === 'next' ? addYears(prev, 1) : subYears(prev, 1));
        break;
    }
  }, [preset]);

  const setPreset = useCallback((newPreset: DateRangePreset) => {
    setPresetState(newPreset);
    setBaseDate(new Date());
  }, []);

  const setCustomRange = useCallback((range: { from: Date; to: Date }) => {
    setCustomRangeState(range);
    setPresetState('custom');
  }, []);

  const filters = useMemo(() => ({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  }), [dateRange]);

  return {
    preset,
    setPreset,
    navigate,
    label,
    dateRange,
    customRange,
    setCustomRange,
    filters,
  };
}
