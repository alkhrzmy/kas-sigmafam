'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Account } from '@/lib/types';

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

    const updateBalance = async (id: string, newBalance: number) => {
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

    const getTotalBalance = () => {
        return accounts.reduce((sum, a) => sum + a.balance, 0);
    };

    return {
        accounts,
        isLoading,
        error,
        updateBalance,
        getTotalBalance,
        refetch: fetchAccounts,
    };
}
