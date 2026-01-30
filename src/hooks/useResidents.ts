'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Resident } from '@/lib/types';

export function useResidents() {
    const [residents, setResidents] = useState<Resident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchResidents = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('residents')
                .select('*')
                .order('name');

            if (error) throw error;
            setResidents(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchResidents();
    }, [fetchResidents]);

    const addResident = async (resident: {
        name: string;
        default_monthly_amount: number;
        room_type: 'ac' | 'non-ac';
        floor: 'atas' | 'bawah';
    }) => {
        const { data, error } = await supabase
            .from('residents')
            .insert([resident])
            .select()
            .single();

        if (error) throw error;
        setResidents((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        return data;
    };

    const updateResident = async (id: string, updates: Partial<Resident>) => {
        const { data, error } = await supabase
            .from('residents')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        setResidents((prev) =>
            prev.map((r) => (r.id === id ? data : r))
        );
        return data;
    };

    const deleteResident = async (id: string) => {
        const { error } = await supabase
            .from('residents')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setResidents((prev) => prev.filter((r) => r.id !== id));
    };

    return {
        residents,
        isLoading,
        error,
        addResident,
        updateResident,
        deleteResident,
        refetch: fetchResidents,
    };
}
