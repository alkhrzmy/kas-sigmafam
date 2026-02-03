'use client';

import { useState, useMemo } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { useTransactions } from '@/hooks/useTransactions';
import { useResidents } from '@/hooks/useResidents';
import { formatRupiah, formatDate, getMonthName, getCurrentYearMonth } from '@/lib/utils';
import { TransactionWithRelations } from '@/lib/types';

export default function PemasukanPage() {
    const { transactions, addTransaction, deleteTransaction, isLoading } = useTransactions();
    const { residents } = useResidents();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Month/Year filter
    const currentDate = getCurrentYearMonth();
    const [selectedYear, setSelectedYear] = useState(currentDate.year.toString());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.month.toString());

    const years = Array.from({ length: 3 }, (_, i) => ({
        value: (currentDate.year - i).toString(),
        label: (currentDate.year - i).toString(),
    }));

    const months = Array.from({ length: 12 }, (_, i) => ({
        value: (i + 1).toString(),
        label: getMonthName(i + 1),
    }));

    const [form, setForm] = useState({
        resident_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    // Filter transactions by month/year
    const incomeTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (t.type !== 'income') return false;
            const date = new Date(t.transaction_date);
            return (
                date.getFullYear() === parseInt(selectedYear) &&
                date.getMonth() + 1 === parseInt(selectedMonth)
            );
        });
    }, [transactions, selectedYear, selectedMonth]);

    const monthlyTotal = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount) return;

        setIsSubmitting(true);
        try {
            await addTransaction({
                type: 'income',
                amount: parseInt(form.amount),
                resident_id: form.resident_id || null,
                description: form.description || null,
                transaction_date: form.transaction_date,
            });
            setForm({
                resident_id: '',
                amount: '',
                description: '',
                transaction_date: new Date().toISOString().split('T')[0],
            });
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error adding transaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus transaksi ini?')) return;
        try {
            await deleteTransaction(id);
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    };

    const columns = [
        {
            key: 'transaction_date',
            header: 'Tanggal',
            render: (item: TransactionWithRelations) => formatDate(item.transaction_date),
        },
        {
            key: 'resident',
            header: 'Dari',
            render: (item: TransactionWithRelations) => item.residents?.name || '-',
        },
        {
            key: 'amount',
            header: 'Jumlah',
            render: (item: TransactionWithRelations) => (
                <span className="text-success font-medium">+{formatRupiah(item.amount)}</span>
            ),
        },
        {
            key: 'description',
            header: 'Keterangan',
            render: (item: TransactionWithRelations) => item.description || '-',
        },
        {
            key: 'actions',
            header: '',
            render: (item: TransactionWithRelations) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-danger hover:bg-danger-bg"
                >
                    Hapus
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Pemasukan</h1>
                    <p className="text-muted mt-1">Catat uang masuk ke kas</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Tambah Pemasukan
                </Button>
            </div>

            {/* Month/Year Filter */}
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
                    <div className="ml-auto text-right">
                        <div className="text-sm text-muted">Total Bulan Ini</div>
                        <div className="text-xl font-bold text-success">{formatRupiah(monthlyTotal)}</div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader
                    title={`Pemasukan ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`}
                    icon="💰"
                />
                <Table
                    columns={columns}
                    data={incomeTransactions}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    emptyMessage="Belum ada pemasukan bulan ini"
                />
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tambah Pemasukan"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        id="resident"
                        label="Dari Penghuni"
                        value={form.resident_id}
                        onChange={(e) => setForm({ ...form, resident_id: e.target.value })}
                        options={residents.map((r) => ({ value: r.id, label: r.name }))}
                    />
                    <Input
                        id="amount"
                        label="Jumlah (Rp)"
                        type="number"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        placeholder="100000"
                        required
                    />
                    <Input
                        id="description"
                        label="Keterangan (opsional)"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Iuran bulanan, dll"
                    />
                    <Input
                        id="date"
                        label="Tanggal"
                        type="date"
                        value={form.transaction_date}
                        onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                        required
                    />
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1"
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
