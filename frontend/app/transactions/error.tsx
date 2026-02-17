'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TransactionsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col justify-center items-center gap-6 min-h-[400px]">
      <AlertTriangle className="w-12 h-12 text-destructive" />
      <div className="space-y-2 text-center">
        <h2 className="font-semibold text-xl">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          An error occurred while loading transactions.
        </p>
      </div>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
