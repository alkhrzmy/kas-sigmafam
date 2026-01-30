'use client';

import { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { useResidents } from '@/hooks/useResidents';
import { formatRupiah } from '@/lib/utils';
import { Resident } from '@/lib/types';

export default function PenghuniPage() {
    const { residents, addResident, updateResident, deleteResident, isLoading } = useResidents();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResident, setEditingResident] = useState<Resident | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: '',
        default_monthly_amount: '',
        room_type: 'non-ac' as 'ac' | 'non-ac',
        floor: 'atas' as 'atas' | 'bawah',
    });

    const openAddModal = () => {
        setEditingResident(null);
        setForm({
            name: '',
            default_monthly_amount: '100000',
            room_type: 'non-ac',
            floor: 'atas',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (resident: Resident) => {
        setEditingResident(resident);
        setForm({
            name: resident.name,
            default_monthly_amount: resident.default_monthly_amount.toString(),
            room_type: resident.room_type,
            floor: resident.floor,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.default_monthly_amount) return;

        setIsSubmitting(true);
        try {
            if (editingResident) {
                await updateResident(editingResident.id, {
                    name: form.name,
                    default_monthly_amount: parseInt(form.default_monthly_amount),
                    room_type: form.room_type,
                    floor: form.floor,
                });
            } else {
                await addResident({
                    name: form.name,
                    default_monthly_amount: parseInt(form.default_monthly_amount),
                    room_type: form.room_type,
                    floor: form.floor,
                });
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving resident:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus penghuni "${name}"?`)) return;
        try {
            await deleteResident(id);
        } catch (error) {
            console.error('Error deleting resident:', error);
        }
    };

    const residentsAtasAC = residents.filter((r) => r.floor === 'atas' && r.room_type === 'ac');
    const residentsAtasNonAC = residents.filter((r) => r.floor === 'atas' && r.room_type === 'non-ac');
    const residentsBawahAC = residents.filter((r) => r.floor === 'bawah' && r.room_type === 'ac');
    const residentsBawahNonAC = residents.filter((r) => r.floor === 'bawah' && r.room_type === 'non-ac');

    const ResidentCard = ({ resident }: { resident: Resident }) => (
        <Card hover className="relative group">
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                    onClick={() => openEditModal(resident)}
                    className="p-1.5 rounded bg-card-hover hover:bg-primary/20 text-sm"
                >
                    ✏️
                </button>
                <button
                    onClick={() => handleDelete(resident.id, resident.name)}
                    className="p-1.5 rounded bg-card-hover hover:bg-danger/20 text-sm"
                >
                    🗑️
                </button>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl">
                    👤
                </div>
                <div>
                    <h3 className="font-semibold text-lg">{resident.name}</h3>
                    <p className="text-sm text-muted">
                        {resident.room_type === 'ac' ? '❄️ Kamar AC' : '🌡️ Non-AC'}
                    </p>
                    <p className="text-sm text-success font-medium">
                        {formatRupiah(resident.default_monthly_amount)}/bulan
                    </p>
                </div>
            </div>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted animate-pulse">Memuat...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold gradient-text">Penghuni</h1>
                    <p className="text-muted mt-1">Kelola data penghuni kontrakan</p>
                </div>
                <Button onClick={openAddModal}>
                    + Tambah Penghuni
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="text-3xl font-bold text-primary">{residents.length}</div>
                    <div className="text-sm text-muted">Total Penghuni</div>
                </Card>
                <Card>
                    <div className="text-3xl font-bold text-blue-400">
                        {residents.filter((r) => r.room_type === 'ac').length}
                    </div>
                    <div className="text-sm text-muted">Kamar AC</div>
                </Card>
                <Card>
                    <div className="text-3xl font-bold text-orange-400">
                        {residents.filter((r) => r.floor === 'atas').length}
                    </div>
                    <div className="text-sm text-muted">Lantai Atas</div>
                </Card>
                <Card>
                    <div className="text-3xl font-bold text-purple-400">
                        {residents.filter((r) => r.floor === 'bawah').length}
                    </div>
                    <div className="text-sm text-muted">Lantai Bawah</div>
                </Card>
            </div>

            {/* Lantai Atas */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    🔼 Lantai Atas
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...residentsAtasAC, ...residentsAtasNonAC].map((resident) => (
                        <ResidentCard key={resident.id} resident={resident} />
                    ))}
                </div>
            </div>

            {/* Lantai Bawah */}
            <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    🔽 Lantai Bawah
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...residentsBawahAC, ...residentsBawahNonAC].map((resident) => (
                        <ResidentCard key={resident.id} resident={resident} />
                    ))}
                </div>
            </div>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingResident ? 'Edit Penghuni' : 'Tambah Penghuni'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="name"
                        label="Nama"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Nama penghuni"
                        required
                    />
                    <Input
                        id="amount"
                        label="Iuran Default (Rp/bulan)"
                        type="number"
                        value={form.default_monthly_amount}
                        onChange={(e) => setForm({ ...form, default_monthly_amount: e.target.value })}
                        placeholder="100000"
                        required
                    />
                    <Select
                        id="room_type"
                        label="Tipe Kamar"
                        value={form.room_type}
                        onChange={(e) => setForm({ ...form, room_type: e.target.value as 'ac' | 'non-ac' })}
                        options={[
                            { value: 'ac', label: '❄️ Kamar AC' },
                            { value: 'non-ac', label: '🌡️ Non-AC' },
                        ]}
                    />
                    <Select
                        id="floor"
                        label="Lantai"
                        value={form.floor}
                        onChange={(e) => setForm({ ...form, floor: e.target.value as 'atas' | 'bawah' })}
                        options={[
                            { value: 'atas', label: '🔼 Lantai Atas' },
                            { value: 'bawah', label: '🔽 Lantai Bawah' },
                        ]}
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
