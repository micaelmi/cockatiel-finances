'use client';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Wallet, Info } from 'lucide-react';

interface AccountSummary {
  id: string;
  name: string;
  balance: number;
  color: string;
}

interface AccountSummaryPopoverProps {
  accounts: AccountSummary[];
  trigger?: React.ReactNode;
}

export function AccountSummaryPopover({ accounts, trigger }: AccountSummaryPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="rounded-full w-4 h-4">
            <Info className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="p-4 w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Wallet className="w-4 h-4" />
            <h4 className="font-bold text-sm">Account Balances</h4>
          </div>
          <div className="space-y-3">
            {accounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="rounded-full w-2 h-2" 
                    style={{ backgroundColor: account.color }}
                  />
                  <span className="text-muted-foreground">{account.name}</span>
                </div>
                <span className="font-mono font-bold">
                  ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
          {accounts.length === 0 && (
            <p className="py-2 text-muted-foreground text-xs text-center">
              No accounts found.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
