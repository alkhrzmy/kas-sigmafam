'use client';

import { useState, useEffect } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useResidents } from '@/hooks/useResidents';
import { useCategories } from '@/hooks/useCategories';
import { formatRupiah, getMonthName, getCurrentYearMonth } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { MonthlyBillWithRelations } from '@/lib/types';

export default function IuranPage() {
    const { residents } = useResidents();
    const { categories } = useCategories();
    const [bills, setBills] = useState<MonthlyBillWithRelations[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const currentDate = getCurrentYearMonth();
    const [selectedYear, setSelectedYear] = useState(currentDate.year.toString());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.month.toString());

    const expenseCategories = categories.filter((c) => c.type === 'expense');

    const years = Array.from({ length: 3 }, (_, i) => ({
        value: (currentDate.year - i).toString(),
        label: (currentDate.year - i).toString(),
    }));

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: getMonthName(i + 1),
    }));

    useEffect(() => {
        fetchBills();
    }, [selectedYear, selectedMonth]);

    const fetchBills = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('monthly_bills')
                .select(`*, residents (*), categories (*)`)
                .eq('year', parseInt(selectedYear))
                .eq('month', parseInt(selectedMonth));

            if (error) throw error;
            setBills(data || []);
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const generateBills = async () => {
        // Generate bills for all residents and expense categories
        const newBills = [];
        for (const resident of residents) {
            for (const category of expenseCategories) {
                // Check if bill already exists
                const exists = bills.some(
                    (b) => b.resident_id === resident.id && b.category_id === category.id
                );
                if (!exists) {
                    newBills.push({
                        year: parseInt(selectedYear),
                        month: parseInt(selectedMonth),
                        resident_id: resident.id,
                        category_id: category.id,
                        amount_due: category.default_per_person || 0,
                        amount_paid: 0,
                        is_paid: false,
                    });
                }
            }
        }

        if (newBills.length > 0) {
            const { error } = await supabase
                .from('monthly_bills')
                .insert(newBills);

            if (error) {
                console.error('Error generating bills:', error);
            } else {
                fetchBills();
            }
        }
    };

    const togglePaid = async (bill: MonthlyBillWithRelations) => {
        const newIsPaid = !bill.is_paid;
        const { error } = await supabase
            .from('monthly_bills')
            .update({
                is_paid: newIsPaid,
                amount_paid: newIsPaid ? bill.amount_due : 0,
                paid_at: newIsPaid ? new Date().toISOString() : null,
            })
            .eq('id', bill.id);

        if (error) {
            console.error('Error updating bill:', error);
        } else {
            setBills((prev) =>
                prev.map((b) =>
                    b.id === bill.id
                        ? { ...b, is_paid: newIsPaid, amount_paid: newIsPaid ? b.amount_due : 0 }
                        : b
                )
            );
        }
    };

    // Group bills by resident
    const billsByResident = residents.map((resident) => ({
        resident,
        bills: expenseCategories.map((category) => {
            const bill = bills.find(
                (b) => b.resident_id === resident.id && b.category_id === category.id
            );
            return { category, bill };
        }),
    }));

    const totalDue = bills.reduce((sum, b) => sum + b.amount_due, 0);
    const totalPaid = bills.reduce((sum, b) => sum + b.amount_paid, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Iuran Bulanan</h1>
                    <p className="text-muted mt-1">Tracking pembayaran iuran penghuni</p>
                </div>
                <Button onClick={generateBills}>
                    + Generate Iuran
                </Button>
            </div>

            {/* Month Selector */}
            <Card>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="w-32">
                        <Select
                            id="month"
                            label="Bulan"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            options={months}
                        />
                    </div>
                    <div className="w-32">
                        <Select
                            id="year"
                            label="Tahun"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            options={years}
                        />
                    </div>
                    <div className="ml-auto flex gap-4">
                        <div className="text-right">
                            <div className="text-sm text-muted">Total Tagihan</div>
                            <div className="text-lg font-bold">{formatRupiah(totalDue)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted">Sudah Dibayar</div>
                            <div className="text-lg font-bold text-success">{formatRupiah(totalPaid)}</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Bills Table */}
            <Card>
                <CardHeader
                    title={`Iuran ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`}
                    icon="📅"
                />

                {isLoading ? (
                    <div className="text-center text-muted py-8">Memuat...</div>
                ) : bills.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted mb-4">Belum ada data iuran untuk bulan ini</p>
                        <Button onClick={generateBills}>Generate Iuran</Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted">
                                        Penghuni
                                    </th>
                                    {expenseCategories.map((cat) => (
                                        <th
                                            key={cat.id}
                                            className="px-4 py-3 text-center text-sm font-medium text-muted"
                                        >
                                            {cat.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {billsByResident.map(({ resident, bills: residentBills }) => (
                                    <tr
                                        key={resident.id}
                                        className="border-b border-border/50 hover:bg-card-hover"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{resident.name}</div>
                                            <div className="text-xs text-muted">
                                                {resident.room_type === 'ac' ? '❄️ AC' : '🌡️ Non-AC'} • Lantai {resident.floor}
                                            </div>
                                        </td>
                                        {residentBills.map(({ category, bill }) => (
                                            <td key={category.id} className="px-4 py-3 text-center">
                                                {bill ? (
                                                    <button
                                                        onClick={() => togglePaid(bill)}
                                                        className={`w-10 h-10 rounded-lg transition-all ${bill.is_paid
                                                            ? 'bg-success-bg text-success'
                                                            : 'bg-card hover:bg-card-hover text-muted'
                                                            }`}
                                                    >
                                                        {bill.is_paid ? '✅' : '⬜'}
                                                    </button>
                                                ) : (
                                                    <span className="text-muted">-</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
