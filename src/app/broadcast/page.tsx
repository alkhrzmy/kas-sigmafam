'use client';

import { useState, useMemo } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useCategories } from '@/hooks/useCategories';
import { formatRupiah, getMonthName, getCurrentYearMonth } from '@/lib/utils';

export default function BroadcastPage() {
    const { transactions } = useTransactions();
    const { getTotalBalance } = useAccounts();
    const { categories } = useCategories();
    const [copied, setCopied] = useState(false);

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

    // Filter transactions by month/year
    const filteredTransactions = useMemo(() => {
        return transactions.filter((t) => {
            const date = new Date(t.transaction_date);
            return (
                date.getFullYear() === parseInt(selectedYear) &&
                date.getMonth() + 1 === parseInt(selectedMonth)
            );
        });
    }, [transactions, selectedYear, selectedMonth]);

    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
    const saldo = getTotalBalance();

    // Generate broadcast message
    const generateMessage = () => {
        const monthName = getMonthName(parseInt(selectedMonth));
        const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://kas-sigmafam.vercel.app';

        let message = `${appUrl}\n\n`;
        message += `*Iuran ${monthName} ${selectedYear}*\n\n`;

        // Income section
        if (incomeTransactions.length > 0) {
            message += `*Uang Diterima:*\n`;
            const incomeItems = incomeTransactions.map(t => {
                const name = t.residents?.name || 'Lainnya';
                const amount = formatRupiahShort(t.amount);
                return `${name} ${amount}`;
            });
            message += incomeItems.join(' + ') + '\n';
            message += `Total: ${formatRupiah(totalIncome)}\n\n`;
        }

        // Expense section
        if (expenseTransactions.length > 0) {
            message += `*Uang Keluar:*\n`;
            const expenseItems = expenseTransactions.map(t => {
                const category = t.categories?.name || 'Lainnya';
                const amount = formatRupiahShort(t.amount);
                return `${amount} (${category})`;
            });
            message += expenseItems.join(' + ') + '\n';
            message += `Total: ${formatRupiah(totalExpense)}\n\n`;
        }

        // Iuran breakdown section
        const expenseCategories = categories.filter(c => c.type === 'expense');
        const listrikCategories = expenseCategories.filter(c =>
            c.name.toLowerCase().includes('listrik')
        );
        const otherCategories = expenseCategories.filter(c =>
            !c.name.toLowerCase().includes('listrik')
        );

        if (listrikCategories.length > 0) {
            message += `*Iuran Listrik:*\n`;
            listrikCategories.forEach((cat, index) => {
                const perPerson = cat.default_per_person ? formatRupiahShort(cat.default_per_person) + '/org' : '-';
                message += `${index + 1}. ${cat.name} ${perPerson}\n`;
            });
            message += '\n';
        }

        if (otherCategories.length > 0) {
            message += `*Iuran Lain-lain:*\n`;
            otherCategories.forEach((cat, index) => {
                const perPerson = cat.default_per_person ? formatRupiahShort(cat.default_per_person) + '/org' : '-';
                message += `${index + 1}. ${cat.name} ${perPerson}\n`;
            });
            message += '\n';
        }

        // Summary
        message += `*Ringkasan ${monthName}:*\n`;
        message += `Pemasukan: ${formatRupiah(totalIncome)}\n`;
        message += `Pengeluaran: ${formatRupiah(totalExpense)}\n`;
        message += `Selisih: ${totalIncome - totalExpense >= 0 ? '+' : ''}${formatRupiah(totalIncome - totalExpense)}\n\n`;

        message += `*Saldo Kas Saat Ini: ${formatRupiah(saldo)}*`;

        return message;
    };

    const formatRupiahShort = (amount: number) => {
        if (amount >= 1000000) {
            return `${amount / 1000000}jt`;
        } else if (amount >= 1000) {
            return `${amount / 1000}k`;
        }
        return amount.toString();
    };

    const message = generateMessage();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(message);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold gradient-text">Broadcast</h1>
                <p className="text-muted mt-1">Generate pesan untuk WhatsApp</p>
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
                    <div className="ml-auto">
                        <Button onClick={handleCopy}>
                            {copied ? '✅ Tersalin!' : '📋 Copy ke Clipboard'}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader
                    title={`Preview Broadcast ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`}
                    icon="📱"
                />
                <div className="bg-background rounded-lg p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                    {message}
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-success">{incomeTransactions.length}</div>
                        <div className="text-sm text-muted">Transaksi Masuk</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-danger">{expenseTransactions.length}</div>
                        <div className="text-sm text-muted">Transaksi Keluar</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-success">{formatRupiah(totalIncome)}</div>
                        <div className="text-sm text-muted">Total Masuk</div>
                    </div>
                </Card>
                <Card>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-danger">{formatRupiah(totalExpense)}</div>
                        <div className="text-sm text-muted">Total Keluar</div>
                    </div>
                </Card>
            </div>

            {/* WhatsApp Button */}
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-800">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-lg">Kirim ke WhatsApp</h3>
                        <p className="text-sm text-muted mt-1">Buka WhatsApp dengan pesan yang sudah disiapkan</p>
                    </div>
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                    >
                        📱 Buka WhatsApp
                    </a>
                </div>
            </Card>
        </div>
    );
}
