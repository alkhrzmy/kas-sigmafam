'use client';

import { useState, useMemo } from 'react';
import Card, { CardHeader } from '@/components/ui/Card';
import Select from '@/components/ui/Select';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { formatRupiah, formatDate, getMonthName, getCurrentYearMonth } from '@/lib/utils';

export default function Dashboard() {
  const { transactions, isLoading: txLoading } = useTransactions();
  const { accounts, isLoading: accLoading, getTotalBalance } = useAccounts();
  const totalAccountBalance = getTotalBalance();

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

  const monthlyIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpense;

  const recentTransactions = filteredTransactions.slice(0, 5);

  const isLoading = txLoading || accLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted animate-pulse">Memuat...</div>
      </div>
    );
  }

  const ewallets = accounts.filter(a => a.type === 'ewallet');
  const banks = accounts.filter(a => a.type === 'bank');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="text-muted mt-1">Ringkasan kas kontrakan</p>
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
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Saldo Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0">
          <div className="text-white/80 text-sm font-medium">Total Saldo Kas</div>
          <div className="text-2xl font-bold text-white mt-2">
            {formatRupiah(totalAccountBalance)}
          </div>
          <div className="text-white/60 text-xs mt-1">
            Saldo semua rekening
          </div>
        </Card>

        {/* Monthly Balance */}
        <Card hover>
          <div className="text-muted text-sm">Saldo Bulan Ini</div>
          <div className={`text-xl font-bold mt-1 ${monthlyBalance >= 0 ? 'text-success' : 'text-danger'}`}>
            {monthlyBalance >= 0 ? '+' : ''}{formatRupiah(monthlyBalance)}
          </div>
          <div className="text-xs text-muted mt-1">
            {getMonthName(parseInt(selectedMonth))} {selectedYear}
          </div>
        </Card>

        {/* Income Card */}
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success-bg flex items-center justify-center text-xl">
              💰
            </div>
            <div>
              <div className="text-muted text-xs">Pemasukan</div>
              <div className="text-lg font-bold text-success">
                {formatRupiah(monthlyIncome)}
              </div>
            </div>
          </div>
        </Card>

        {/* Expense Card */}
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-bg flex items-center justify-center text-xl">
              💸
            </div>
            <div>
              <div className="text-muted text-xs">Pengeluaran</div>
              <div className="text-lg font-bold text-danger">
                {formatRupiah(monthlyExpense)}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Balances */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* E-Wallets */}
        <Card>
          <CardHeader title="E-Wallet" icon="📱" />
          <div className="space-y-3">
            {ewallets.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{acc.icon}</span>
                  <div>
                    <div className="font-medium">{acc.name}</div>
                    <div className="text-xs text-muted">{acc.account_number}</div>
                  </div>
                </div>
                <div className={`font-bold ${acc.balance > 0 ? 'text-success' : 'text-muted'}`}>
                  {formatRupiah(acc.balance)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Banks */}
        <Card>
          <CardHeader title="Bank" icon="🏦" />
          <div className="space-y-3">
            {banks.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{acc.icon}</span>
                  <div>
                    <div className="font-medium">{acc.name}</div>
                    <div className="text-xs text-muted">{acc.account_number}</div>
                  </div>
                </div>
                <div className={`font-bold ${acc.balance > 0 ? 'text-success' : 'text-muted'}`}>
                  {formatRupiah(acc.balance)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Payment Info */}
      <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-800">
        <CardHeader title="💳 Info Pembayaran" subtitle="Transfer iuran ke salah satu rekening berikut" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted mb-2">E-Wallet</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Dana / ShopeePay / GoPay</span>
                <span className="font-mono font-medium">087860811076</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted mb-2">Bank Transfer</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>BCA Digital (501)</span>
                <span className="font-mono font-medium">001108786076</span>
              </div>
              <div className="flex justify-between">
                <span>BSI (451)</span>
                <span className="font-mono font-medium">7316577223</span>
              </div>
              <div className="flex justify-between">
                <span>Bank Jago (542)</span>
                <span className="font-mono font-medium">105428293091</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader
          title={`Transaksi ${getMonthName(parseInt(selectedMonth))} ${selectedYear}`}
          icon="📋"
        />

        {recentTransactions.length === 0 ? (
          <div className="text-center text-muted py-8">
            Belum ada transaksi bulan ini
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'income'
                      ? 'bg-success-bg text-success'
                      : 'bg-danger-bg text-danger'
                      }`}
                  >
                    {tx.type === 'income' ? '↓' : '↑'}
                  </div>
                  <div>
                    <div className="font-medium">
                      {tx.type === 'income'
                        ? tx.residents?.name || 'Pemasukan'
                        : tx.categories?.name || 'Pengeluaran'}
                    </div>
                    <div className="text-sm text-muted">
                      {tx.description || formatDate(tx.transaction_date)}
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold ${tx.type === 'income' ? 'text-success' : 'text-danger'
                    }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatRupiah(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a href="/pemasukan" className="block">
          <Card hover className="text-center py-8">
            <div className="text-3xl mb-2">💰</div>
            <div className="font-medium">Tambah Pemasukan</div>
          </Card>
        </a>
        <a href="/pengeluaran" className="block">
          <Card hover className="text-center py-8">
            <div className="text-3xl mb-2">💸</div>
            <div className="font-medium">Tambah Pengeluaran</div>
          </Card>
        </a>
        <a href="/iuran" className="block">
          <Card hover className="text-center py-8">
            <div className="text-3xl mb-2">📅</div>
            <div className="font-medium">Iuran Bulanan</div>
          </Card>
        </a>
        <a href="/rekening" className="block">
          <Card hover className="text-center py-8">
            <div className="text-3xl mb-2">🏦</div>
            <div className="font-medium">Kelola Rekening</div>
          </Card>
        </a>
      </div>
    </div>
  );
}
