'use client';

import Card, { CardHeader } from '@/components/ui/Card';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { formatRupiah, formatDate } from '@/lib/utils';

export default function Dashboard() {
  const { transactions, isLoading: txLoading, getBalance } = useTransactions();
  const { accounts, isLoading: accLoading, getTotalBalance } = useAccounts();
  const { income, expense, balance } = getBalance();
  const recentTransactions = transactions.slice(0, 5);
  const totalAccountBalance = getTotalBalance();

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-0">
          <div className="text-white/80 text-sm font-medium">Saldo Kas</div>
          <div className="text-3xl font-bold text-white mt-2">
            {formatRupiah(totalAccountBalance)}
          </div>
          <div className="text-white/60 text-sm mt-2">
            {totalAccountBalance >= 0 ? '✅ Surplus' : '⚠️ Defisit'}
          </div>
        </Card>

        {/* Income Card */}
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-bg flex items-center justify-center text-2xl">
              💰
            </div>
            <div>
              <div className="text-muted text-sm">Total Pemasukan</div>
              <div className="text-xl font-bold text-success">
                {formatRupiah(income)}
              </div>
            </div>
          </div>
        </Card>

        {/* Expense Card */}
        <Card hover>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-danger-bg flex items-center justify-center text-2xl">
              💸
            </div>
            <div>
              <div className="text-muted text-sm">Total Pengeluaran</div>
              <div className="text-xl font-bold text-danger">
                {formatRupiah(expense)}
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
        <CardHeader title="Transaksi Terakhir" icon="📋" />

        {recentTransactions.length === 0 ? (
          <div className="text-center text-muted py-8">
            Belum ada transaksi
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
