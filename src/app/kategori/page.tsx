'use client';

import { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import Table from '@/components/ui/Table';
import { useCategories } from '@/hooks/useCategories';
import { formatRupiah } from '@/lib/utils';
import { Category } from '@/lib/types';

export default function KategoriPage() {
    const { categories, addCategory, updateCategory, deleteCategory, isLoading } = useCategories();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        type: 'expense' as 'income' | 'expense',
        default_per_person: '',
    });

    const openAddModal = () => {
        setEditingCategory(null);
        setForm({
            name: '',
            type: 'expense',
            default_per_person: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setForm({
            name: category.name,
            type: category.type,
            default_per_person: category.default_per_person?.toString() || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) return;

        setIsSubmitting(true);
        try {
            const categoryData = {
                name: form.name,
                type: form.type,
                default_per_person: form.default_per_person ? parseInt(form.default_per_person) : null,
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, categoryData);
            } else {
                await addCategory(categoryData);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving category:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus kategori "${name}"?`)) return;
        try {
            await deleteCategory(id);
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const expenseCategories = categories.filter((c) => c.type === 'expense');
    const incomeCategories = categories.filter((c) => c.type === 'income');

    const columns = [
        {
            key: 'name',
            header: 'Nama Kategori',
            render: (item: Category) => (
                <span className="font-medium">{item.name}</span>
            ),
        },
        {
            key: 'type',
            header: 'Tipe',
            render: (item: Category) => (
                <span
                    className={`px-2 py-1 rounded text-xs font-medium ${item.type === 'expense'
                            ? 'bg-danger-bg text-danger'
                            : 'bg-success-bg text-success'
                        }`}
                >
                    {item.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </span>
            ),
        },
        {
            key: 'default',
            header: 'Default/Orang',
            render: (item: Category) =>
                item.default_per_person ? formatRupiah(item.default_per_person) : '-',
        },
        {
            key: 'actions',
            header: '',
            render: (item: Category) => (
                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(item)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.name)}
                        className="text-danger hover:bg-danger-bg"
                    >
                        Hapus
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Kategori</h1>
                    <p className="text-muted mt-1">Kelola kategori transaksi</p>
                </div>
                <Button onClick={openAddModal}>
                    + Tambah Kategori
                </Button>
            </div>

            {/* Expense Categories */}
            <Card>
                <CardHeader
                    title="Kategori Pengeluaran"
                    icon="💸"
                    subtitle={`${expenseCategories.length} kategori`}
                />
                <Table
                    columns={columns}
                    data={expenseCategories}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    emptyMessage="Belum ada kategori pengeluaran"
                />
            </Card>

            {/* Income Categories */}
            <Card>
                <CardHeader
                    title="Kategori Pemasukan"
                    icon="💰"
                    subtitle={`${incomeCategories.length} kategori`}
                />
                <Table
                    columns={columns}
                    data={incomeCategories}
                    keyExtractor={(item) => item.id}
                    isLoading={isLoading}
                    emptyMessage="Belum ada kategori pemasukan"
                />
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="name"
                        label="Nama Kategori"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Listrik, Air PAM, dll"
                        required
                    />
                    <Select
                        id="type"
                        label="Tipe"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as 'income' | 'expense' })}
                        options={[
                            { value: 'expense', label: '💸 Pengeluaran' },
                            { value: 'income', label: '💰 Pemasukan' },
                        ]}
                    />
                    <Input
                        id="default"
                        label="Default per Orang (opsional)"
                        type="number"
                        value={form.default_per_person}
                        onChange={(e) => setForm({ ...form, default_per_person: e.target.value })}
                        placeholder="12500"
                    />
                    <p className="text-xs text-muted">
                        Jika diisi, nilai ini akan digunakan saat generate iuran bulanan
                    </p>
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
