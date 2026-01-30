'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { TransactionWithRelations } from '@/lib/types';

export function useTransactions() {
    const [transactions, setTransactions] = useState<TransactionWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          residents (*),
          categories (*)
        `)
                .order('transaction_date', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = async (transaction: {
        type: 'income' | 'expense';
        amount: number;
        resident_id?: string | null;
        category_id?: string | null;
        description?: string | null;
        receipt_url?: string | null;
        transaction_date: string;
    }) => {
        const { data, error } = await supabase
            .from('transactions')
            .insert([transaction])
            .select(`*, residents (*), categories (*)`)
            .single();

        if (error) {
            console.error('Supabase error:', error.message, error.details, error.hint);
            throw new Error(error.message || 'Database error');
        }
        setTransactions((prev) => [data, ...prev]);
        return data;
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    const getBalance = () => {
        const income = transactions
            .filter((t) => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter((t) => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return { income, expense, balance: income - expense };
    };

    return {
        transactions,
        isLoading,
        error,
        addTransaction,
        deleteTransaction,
        getBalance,
        refetch: fetchTransactions,
    };
}
