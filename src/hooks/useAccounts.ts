'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Account, BalanceHistory } from '@/lib/types';

export function useAccounts() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .order('type')
                .order('name');

            if (error) throw error;
            setAccounts(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const updateBalance = async (id: string, newBalance: number, note?: string) => {
        // Get current balance first
        const currentAccount = accounts.find(a => a.id === id);
        if (!currentAccount) throw new Error('Account not found');

        const oldBalance = currentAccount.balance;

        // Save history record
        const { error: historyError } = await supabase
            .from('balance_history')
            .insert([{
                account_id: id,
                old_balance: oldBalance,
                new_balance: newBalance,
                note: note || null,
            }]);

        if (historyError) {
            console.error('History error:', historyError);
            throw historyError;
        }

        // Update balance
        const { data, error } = await supabase
            .from('accounts')
            .update({ balance: newBalance })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        setAccounts((prev) =>
            prev.map((a) => (a.id === id ? data : a))
        );
        return data;
    };

    const fetchHistory = async (accountId: string): Promise<BalanceHistory[]> => {
        const { data, error } = await supabase
            .from('balance_history')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;
        return data || [];
    };

    const undoLastChange = async (accountId: string) => {
        // Get the latest history entry
        const { data: history, error: fetchError } = await supabase
            .from('balance_history')
            .select('*')
            .eq('account_id', accountId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (fetchError || !history) throw new Error('Tidak ada riwayat untuk di-undo');

        // Revert balance to old_balance
        const { data, error: updateError } = await supabase
            .from('accounts')
            .update({ balance: history.old_balance })
            .eq('id', accountId)
            .select()
            .single();

        if (updateError) throw updateError;

        // Delete the history entry
        const { error: deleteError } = await supabase
            .from('balance_history')
            .delete()
            .eq('id', history.id);

        if (deleteError) throw deleteError;

        setAccounts((prev) =>
            prev.map((a) => (a.id === accountId ? data : a))
        );
        return data;
    };

    const getTotalBalance = () => {
        return accounts.reduce((sum, a) => sum + a.balance, 0);
    };

    return {
        accounts,
        isLoading,
        error,
        updateBalance,
        fetchHistory,
        undoLastChange,
        getTotalBalance,
        refetch: fetchAccounts,
    };
}
