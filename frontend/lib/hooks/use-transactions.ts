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
export function useTransactions(filters?: { from?: string; to?: string }) {
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

      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData<Transaction[]>(
        transactionKeys.lists()
      );

      // Optimistically update
      queryClient.setQueryData<Transaction[]>(
        transactionKeys.lists(),
        (old) => old?.filter((t) => t.id !== deletedId) ?? []
      );

      return { previousTransactions };
    },
    onError: (_err, _deletedId, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(
          transactionKeys.lists(),
          context.previousTransactions
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}
