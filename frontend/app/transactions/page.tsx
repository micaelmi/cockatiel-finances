'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  MoreHorizontal, 
  PlusCircle, 
  Trash, 
  Edit,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  Loader2,
  MessageSquare,
  Tag as TagIcon
} from 'lucide-react';
import { PaginationState, ColumnDef as TableColumnDef, Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { TransactionForm } from '@/components/forms/transaction-form';
import { DataTable } from './data-table';
import { useTransactions, useDeleteTransaction, useDashboardSummary } from '@/lib/hooks/use-transactions';
import { cn } from '@/lib/utils';
import { IconRenderer } from '@/components/ui/icon-renderer';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Transaction } from '@/lib/api/types';

type DateRangePreset = 'week' | 'month' | 'year' | 'custom';

export default function TransactionsPage() {
  const { user } = useUser();
  const router = useRouter();

  // State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('month');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  
  // Dialog State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

  // Queries
  const filters = useMemo(() => ({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    type: typeFilter === 'ALL' ? undefined : typeFilter,
  }), [dateRange, pagination, typeFilter]);

  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactions(filters);
  const { data: summaryData, isLoading: isSummaryLoading } = useDashboardSummary({
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  });

  const deleteTransaction = useDeleteTransaction();

  // Handlers
  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'week':
        setDateRange({ from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) });
        break;
      case 'month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'year':
        setDateRange({ from: startOfYear(now), to: endOfYear(now) });
        break;
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = async () => {
    if (deletingTransactionId) {
      try {
        await deleteTransaction.mutateAsync(deletingTransactionId);
      } catch (error) {
        console.error('Failed to delete transaction', error);
      } finally {
        setDeletingTransactionId(null);
      }
    }
  };

  // Columns
  const columns = useMemo<TableColumnDef<Transaction>[]>(() => [
    {
      accessorKey: "amount",
      header: () => <div className="pl-4">Amount</div>,
      cell: ({ row }: { row: Row<Transaction> }) => {
        const amount = parseFloat(row.getValue("amount"));
        const type = row.original.type;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
 
        return (
          <div className={cn(
            "pl-4 font-mono font-bold text-base whitespace-nowrap",
            type === 'INCOME' ? "text-emerald-600" : "text-red-600"
          )}>
            {type === 'INCOME' ? '+' : '-'}{formatted}
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: { row: Row<Transaction> }) => {
        return <div className="font-medium text-sm whitespace-nowrap">{format(new Date(row.getValue("date")), "MMM dd, yyyy")}</div>
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }: { row: Row<Transaction> }) => {
        const category = row.original.category;
        const tags = row.original.tags || [];
        const comments = row.original.comments;
        const date = new Date(row.getValue("date"));
        const accountName = row.original.account.name;

        return (
          <div className="flex flex-col gap-1 min-w-[150px]">
            <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{row.getValue("description")}</span>
                {comments && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">{comments}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
            
            {/* Mobile Metadata */}
            <div className="md:hidden flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                <span>{format(date, "MMM dd")}</span>
                <span>•</span>
                <span>{accountName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               {category && (
                 <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm text-[10px] text-muted-foreground">
                    <div 
                        className="rounded-full w-2 h-2"
                        style={{ backgroundColor: category.color || '#94a3b8' }}
                    />
                   <span>{category.name}</span>
                 </div>
               )}
               {tags.map(tag => (
                   <div key={tag.id} className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded-sm text-[10px] text-muted-foreground">
                        <TagIcon className="w-2 h-2" />
                        {tag.name}
                   </div>
               ))}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: { row: Row<Transaction> }) => {
        const account = row.original.account;
        return (
          <div className="flex items-center gap-2">
             <span className="text-muted-foreground text-sm">{account.name}</span>
          </div>
        )
      },
    },
    {
      id: "actions",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }: { row: Row<Transaction> }) => {
        const transaction = row.original;
 
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 w-8 h-8">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                    <Edit className="mr-2 w-4 h-4" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    onClick={() => setDeletingTransactionId(transaction.id)}
                    className="text-red-600 focus:text-red-600"
                >
                    <Trash className="mr-2 w-4 h-4" />
                    Delete
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ], []);

  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="mx-auto px-4 pt-24 pb-12 max-w-7xl container">
        
        {/* Page Header */}
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-bold text-3xl tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">Manage and track your financial activity.</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none gap-2 w-full sm:w-auto" asChild>
                <Link href="/transactions/income">
                    <PlusCircle className="w-4 h-4" />
                    Income
                </Link>
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none gap-2 w-full sm:w-auto" asChild>
                <Link href="/transactions/expense">
                    <PlusCircle className="w-4 h-4" />
                    Expense
                </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
            {/* Summary Cards - Order 3 on mobile, Order 1 on desktop */}
            <div className="gap-4 order-3 md:order-1 grid grid-cols-1 md:grid-cols-3">
                <Card className="shadow-sm border-l-4 border-l-primary">
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Total Income</CardTitle>
                        <ArrowUpCircle className="w-4 h-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">
                            {isSummaryLoading ? <Skeleton className="w-20 h-8" /> : 
                             `$${summaryData?.income.toLocaleString() ?? '0.00'}`}
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-destructive">
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Total Expenses</CardTitle>
                        <ArrowDownCircle className="w-4 h-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="font-bold text-2xl">
                            {isSummaryLoading ? <Skeleton className="w-20 h-8" /> : 
                             `$${summaryData?.expense.toLocaleString() ?? '0.00'}`}
                        </div>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
                        <CardTitle className="font-medium text-sm">Net Balance</CardTitle>
                        <Wallet className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={cn("font-bold text-2xl", (summaryData?.income || 0) - (summaryData?.expense || 0) >= 0 ? 'text-green-600' : 'text-red-600')}>
                             {isSummaryLoading ? <Skeleton className="w-20 h-8" /> : 
                             `$${((summaryData?.income || 0) - (summaryData?.expense || 0)).toLocaleString()}`}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Table - Order 1 & 2 on mobile, Order 2 & 3 on desktop */}
            <div className="flex flex-col gap-6 order-1 md:order-2">
                {/* Filters */}
                <div className="flex md:flex-row flex-col justify-between items-start md:items-center gap-6 bg-card p-4 border rounded-xl">
                    <div className="flex sm:flex-row flex-col items-start sm:items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-wrap items-center gap-2">
                            <Select value={dateRangePreset} onValueChange={(val: DateRangePreset) => handlePresetChange(val)}>
                                <SelectTrigger className="w-full md:w-[140px]">
                                    <SelectValue placeholder="Period" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="week">This Week</SelectItem>
                                    <SelectItem value="month">This Month</SelectItem>
                                    <SelectItem value="year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                            
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("justify-start w-full md:w-[240px] font-normal text-left", !dateRange && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 w-4 h-4" />
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                                    {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-auto" align="start">
                                    <Calendar
                                        mode="range"
                                        defaultMonth={dateRange?.from}
                                        selected={dateRange}
                                        onSelect={(range) => {
                                            if (range?.from && range?.to) {
                                                setDateRange({ from: range.from, to: range.to });
                                                setDateRangePreset('custom');
                                            }
                                        }}
                                        numberOfMonths={2}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-muted/50 p-1.5 border rounded-lg w-full md:w-auto">
                        <RadioGroup 
                            value={typeFilter} 
                            onValueChange={(val: 'ALL' | 'INCOME' | 'EXPENSE') => {
                                setTypeFilter(val);
                                setPagination(prev => ({ ...prev, pageIndex: 0 }));
                            }}
                            className="flex items-center gap-0 w-full md:w-auto"
                        >
                            <div className="flex-1">
                                <RadioGroupItem value="ALL" id="all" className="sr-only" />
                                <Label
                                    htmlFor="all"
                                    className={cn(
                                        "flex justify-center items-center px-4 py-1.5 rounded-md text-sm whitespace-nowrap transition-all cursor-pointer",
                                        typeFilter === 'ALL' ? "bg-background shadow-sm text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    All
                                </Label>
                            </div>
                            <div className="flex-1">
                                <RadioGroupItem value="INCOME" id="income" className="sr-only" />
                                <Label
                                    htmlFor="income"
                                    className={cn(
                                        "flex justify-center items-center px-4 py-1.5 rounded-md text-sm whitespace-nowrap transition-all cursor-pointer",
                                        typeFilter === 'INCOME' ? "bg-background shadow-sm text-emerald-600 font-bold" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Income
                                </Label>
                            </div>
                            <div className="flex-1">
                                <RadioGroupItem value="EXPENSE" id="expense" className="sr-only" />
                                <Label
                                    htmlFor="expense"
                                    className={cn(
                                        "flex justify-center items-center px-4 py-1.5 rounded-md text-sm whitespace-nowrap transition-all cursor-pointer",
                                        typeFilter === 'EXPENSE' ? "bg-background shadow-sm text-red-600 font-bold" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    Expense
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                {/* Data Table */}
                <DataTable 
                    columns={columns} 
                    data={transactionsData?.data || []}
                    pageCount={transactionsData?.meta.totalPages || 0}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    isLoading={isTransactionsLoading}
                    onRowClick={setViewingTransaction}
                />
            </div>
        </div>

      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction details.
            </DialogDescription>
          </DialogHeader>
          <TransactionForm 
            initialData={editingTransaction || undefined} 
            transactionId={editingTransaction?.id}
            onSuccess={() => setEditingTransaction(null)} 
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deletingTransactionId} onOpenChange={(open) => !open && setDeletingTransactionId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the transaction.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTransactionId(null)}>Cancel</Button>
            <Button 
                onClick={handleDelete}
                variant="destructive"
            >
                Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={!!viewingTransaction} onOpenChange={(open) => !open && setViewingTransaction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {viewingTransaction && (
             <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="font-mono text-muted-foreground text-sm">{format(new Date(viewingTransaction.date), "PPP")}</div>
                        <h3 className="font-bold text-lg">{viewingTransaction.description}</h3>
                    </div>
                    <div className={cn(
                        "font-mono font-bold text-xl",
                        viewingTransaction.type === 'INCOME' ? "text-emerald-600" : "text-red-600"
                    )}>
                        {viewingTransaction.type === 'INCOME' ? '+' : '-'}${parseFloat(viewingTransaction.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div className="gap-2 grid grid-cols-2">
                    <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase">Category</span>
                        <div className="flex items-center gap-2">
                            <div 
                                className="rounded-full w-3 h-3" 
                                style={{ backgroundColor: viewingTransaction.category?.color || '#94a3b8' }}
                            />
                            <span>{viewingTransaction.category?.name || 'Uncategorized'}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase">Account</span>
                        <div>{viewingTransaction.account.name}</div>
                    </div>
                </div>

                {viewingTransaction.comments && (
                    <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase">Comments</span>
                        <p className="bg-muted p-2 rounded-md text-sm">{viewingTransaction.comments}</p>
                    </div>
                )}
                
                {viewingTransaction.tags && viewingTransaction.tags.length > 0 && (
                     <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase">Tags</span>
                        <div className="flex flex-wrap gap-2">
                            {viewingTransaction.tags.map(tag => (
                                <Badge key={tag.id} variant="secondary" className="gap-1 font-normal">
                                    <TagIcon className="w-3 h-3" />
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                     <Button variant="outline" size="sm" onClick={() => {
                         setViewingTransaction(null);
                         handleEdit(viewingTransaction);
                     }}>
                        <Edit className="mr-2 w-3 h-3" /> Edit
                     </Button>
                     <Button variant="destructive" size="sm" onClick={() => {
                         setViewingTransaction(null);
                         setDeletingTransactionId(viewingTransaction.id);
                     }}>
                        <Trash className="mr-2 w-3 h-3" /> Delete
                     </Button>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-muted rounded-md animate-pulse", className)} />
  )
}
