'use client';

import { useState, useMemo } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatRupiah, formatDate, getMonthName, getCurrentYearMonth } from '@/lib/utils';
import { TransactionWithRelations } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function PengeluaranPage() {
    const { transactions, addTransaction, deleteTransaction, isLoading } = useTransactions();
    const { categories } = useCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [viewImage, setViewImage] = useState<string | null>(null);

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
        category_id: '',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const expenseCategories = categories.filter((c) => c.type === 'expense');

    // Filter transactions by month/year
    const expenseTransactions = useMemo(() => {
        return transactions.filter((t) => {
            if (t.type !== 'expense') return false;
            const date = new Date(t.transaction_date);
            return (
                date.getFullYear() === parseInt(selectedYear) &&
                date.getMonth() + 1 === parseInt(selectedMonth)
            );
        });
    }, [transactions, selectedYear, selectedMonth]);

    const monthlyTotal = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    const uploadImage = async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `receipts/${fileName}`;

        const { error } = await supabase.storage
            .from('receipts')
            .upload(filePath, file);

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        const { data } = supabase.storage
            .from('receipts')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.amount) return;

        setIsSubmitting(true);
        try {
            let receipt_url = null;
            if (selectedImage) {
                receipt_url = await uploadImage(selectedImage);
            }

            await addTransaction({
                type: 'expense',
                amount: parseInt(form.amount),
                category_id: form.category_id || null,
                description: form.description || null,
                receipt_url,
                transaction_date: form.transaction_date,
            });

            setForm({
                category_id: '',
                amount: '',
                description: '',
                transaction_date: new Date().toISOString().split('T')[0],
            });
            setSelectedImage(null);
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
            key: 'category',
            header: 'Kategori',
            render: (item: TransactionWithRelations) => item.categories?.name || '-',
        },
        {
            key: 'amount',
            header: 'Jumlah',
            render: (item: TransactionWithRelations) => (
                <span className="text-danger font-medium">-{formatRupiah(item.amount)}</span>
            ),
        },
        {
            key: 'description',
            header: 'Keterangan',
            render: (item: TransactionWithRelations) => item.description || '-',
        },
        {
            key: 'receipt',
            header: 'Bukti',
            render: (item: TransactionWithRelations) =>
                item.receipt_url ? (
                    <button
                        onClick={() => setViewImage(item.receipt_url)}
                        className="text-primary hover:underline"
                    >
                        📷 Lihat
                    </button>
                ) : (
                    <span className="text-muted">-</span>
                ),
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
                    <h1 className="text-3xl font-bold gradient-text">Pengeluaran</h1>
                    <p className="text-muted mt-1">Catat uang keluar dari kas</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    + Tambah Pengeluaran
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
                        <div className="text-xl font-bold text-danger">{formatRupiah(monthlyTotal)}</div>
                    </div>
                </div>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader
                    title={`Pengeluaran ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`}
                    icon="💸"
                />
                <Table
                    columns={columns}
                    data={expenseTransactions}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    emptyMessage="Belum ada pengeluaran bulan ini"
                />
            </Card>

            {/* Add Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Tambah Pengeluaran"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        id="category"
                        label="Kategori"
                        value={form.category_id}
                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                        options={expenseCategories.map((c) => ({ value: c.id, label: c.name }))}
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
                        placeholder="Bayar listrik atas, dll"
                    />
                    <Input
                        id="date"
                        label="Tanggal"
                        type="date"
                        value={form.transaction_date}
                        onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
                        required
                    />
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-foreground">
                            Bukti Transaksi (opsional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            className="w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-card file:text-foreground file:cursor-pointer hover:file:bg-card-hover"
                        />
                        {selectedImage && (
                            <p className="text-sm text-success">✓ {selectedImage.name}</p>
                        )}
                    </div>
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

            {/* View Image Modal */}
            <Modal
                isOpen={!!viewImage}
                onClose={() => setViewImage(null)}
                title="Bukti Transaksi"
                size="lg"
            >
                {viewImage && (
                    <img
                        src={viewImage}
                        alt="Bukti transaksi"
                        className="w-full rounded-lg"
                    />
                )}
            </Modal>
        </div>
    );
}
