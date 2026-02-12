'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getDashboardSummary,
} from '../api/transactions';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  DashboardSummary,
} from '../api/types';

// Query Keys
export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
  summaries: () => [...transactionKeys.all, 'summary'] as const,
  summary: (filters: { from: string; to: string }) => 
    [...transactionKeys.summaries(), filters] as const,
};

// Queries
export function useTransactions(filters?: { from?: string; to?: string; page?: number; limit?: number; type?: 'INCOME' | 'EXPENSE' }) {
  const { user } = useUser();

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useDashboardSummary(filters: { from: string; to: string }) {
  const { user } = useUser();

  return useQuery({
    queryKey: transactionKeys.summary(filters),
    queryFn: () => getDashboardSummary(filters),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
}

// Mutations
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate and refetch transactions list
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      // Also invalidate accounts as balance might have changed
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      // Invalidate summaries
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: transactionKeys.lists() });

      // We can't easily snapshot all lists, so we settle for invalidation mostly, 
      // but if we were to optimistically update, we'd need to find the specific query.
      // For now, let's just invalidate on success/settled to be safe with pagination.
      // Optimistic update for paginated lists is complex.
    },
    onSuccess: () => {
      // toast.success('Transaction deleted');
    },
    onError: (err) => {
      // toast.error('Failed to delete transaction');
      console.error(err);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: transactionKeys.summaries() });
    },
  });
}
