'use client';

import { useState } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { useAccounts } from '@/hooks/useAccounts';
import { formatRupiah } from '@/lib/utils';
import { Account } from '@/lib/types';

export default function RekeningPage() {
    const { accounts, updateBalance, isLoading } = useAccounts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [newBalance, setNewBalance] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ewallets = accounts.filter(a => a.type === 'ewallet');
    const banks = accounts.filter(a => a.type === 'bank');
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

    const openEditModal = (account: Account) => {
        setEditingAccount(account);
        setNewBalance(account.balance.toString());
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAccount || !newBalance) return;

        setIsSubmitting(true);
        try {
            await updateBalance(editingAccount.id, parseInt(newBalance));
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error updating balance:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted animate-pulse">Memuat...</div>
            </div>
        );
    }

    const AccountCard = ({ account }: { account: Account }) => (
        <div
            className="flex items-center justify-between p-4 bg-background rounded-lg hover:bg-card-hover transition-colors cursor-pointer"
            onClick={() => openEditModal(account)}
        >
            <div className="flex items-center gap-4">
                <span className="text-2xl">{account.icon}</span>
                <div>
                    <div className="font-medium">{account.name}</div>
                    <div className="text-sm text-muted">{account.account_number}</div>
                </div>
            </div>
            <div className={`text-xl font-bold ${account.balance > 0 ? 'text-success' : 'text-muted'}`}>
                {formatRupiah(account.balance)}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Rekening</h1>
                <p className="text-muted mt-1">Kelola saldo per rekening/wallet</p>
            </div>

            {/* Total Balance */}
            <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0">
                <div className="text-white/80 text-sm font-medium">Total Saldo Semua Rekening</div>
                <div className="text-3xl font-bold text-white mt-2">
                    {formatRupiah(totalBalance)}
                </div>
            </Card>

            {/* E-Wallets */}
            <Card>
                <CardHeader
                    title="E-Wallet"
                    icon="📱"
                    subtitle="Klik untuk update saldo"
                />
                <div className="space-y-3">
                    {ewallets.map((acc) => (
                        <AccountCard key={acc.id} account={acc} />
                    ))}
                </div>
            </Card>

            {/* Banks */}
            <Card>
                <CardHeader
                    title="Bank"
                    icon="🏦"
                    subtitle="Klik untuk update saldo"
                />
                <div className="space-y-3">
                    {banks.map((acc) => (
                        <AccountCard key={acc.id} account={acc} />
                    ))}
                </div>
            </Card>

            {/* Payment Info */}
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-800">
                <CardHeader title="💳 Info Pembayaran" subtitle="Nomor rekening untuk menerima iuran" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div>
                        <h4 className="font-medium text-sm text-muted mb-3">E-Wallet</h4>
                        <div className="p-4 bg-background/50 rounded-lg">
                            <div className="text-sm text-muted">Dana / ShopeePay / GoPay</div>
                            <div className="text-xl font-mono font-bold mt-1">087860811076</div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-medium text-sm text-muted mb-3">Bank Transfer</h4>
                        <div className="space-y-3">
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="text-sm text-muted">BCA Digital (501)</div>
                                <div className="font-mono font-bold">001108786076</div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="text-sm text-muted">BSI (451)</div>
                                <div className="font-mono font-bold">7316577223</div>
                            </div>
                            <div className="p-3 bg-background/50 rounded-lg">
                                <div className="text-sm text-muted">Bank Jago (542)</div>
                                <div className="font-mono font-bold">105428293091</div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={`Update Saldo ${editingAccount?.name || ''}`}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                        <span className="text-2xl">{editingAccount?.icon}</span>
                        <div>
                            <div className="font-medium">{editingAccount?.name}</div>
                            <div className="text-sm text-muted">{editingAccount?.account_number}</div>
                        </div>
                    </div>
                    <Input
                        id="balance"
                        label="Saldo Baru (Rp)"
                        type="number"
                        value={newBalance}
                        onChange={(e) => setNewBalance(e.target.value)}
                        placeholder="0"
                        required
                    />
                    <p className="text-xs text-muted">
                        Masukkan saldo aktual saat ini di rekening/wallet ini
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
