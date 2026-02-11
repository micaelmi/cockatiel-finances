'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TimeRange = 'week' | 'month' | 'year';

interface TimeRangeFilterProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export function TimeRangeFilter({ value, onChange }: TimeRangeFilterProps) {
  return (
    <div className="flex justify-center items-center gap-1 bg-muted p-1 border rounded-lg w-full md:w-fit">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-3 h-8 font-mono text-xs transition-all",
          value === 'week' ? "bg-emerald-500 text-emerald-50 shadow-sm" : "hover:bg-background/50"
        )}
        onClick={() => onChange('week')}
      >
        Week
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-3 h-8 font-mono text-xs transition-all",
          value === 'month' ? "bg-emerald-500 text-emerald-50 shadow-sm" : "hover:bg-background/50"
        )}
        onClick={() => onChange('month')}
      >
        Month
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "px-3 h-8 font-mono text-xs transition-all",
          value === 'year' ? "bg-emerald-500 text-emerald-50 shadow-sm" : "hover:bg-background/50"
        )}
        onClick={() => onChange('year')}
      >
        Year
      </Button>
    </div>
  );
}
