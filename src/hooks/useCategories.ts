'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/lib/types';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) throw error;
            setCategories(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const addCategory = async (category: {
        name: string;
        type: 'income' | 'expense';
        default_per_person?: number | null;
    }) => {
        const { data, error } = await supabase
            .from('categories')
            .insert([category])
            .select()
            .single();

        if (error) throw error;
        setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        return data;
    };

    const updateCategory = async (id: string, updates: Partial<Category>) => {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        setCategories((prev) =>
            prev.map((c) => (c.id === id ? data : c))
        );
        return data;
    };

    const deleteCategory = async (id: string) => {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    return {
        categories,
        isLoading,
        error,
        addCategory,
        updateCategory,
        deleteCategory,
        refetch: fetchCategories,
    };
}
