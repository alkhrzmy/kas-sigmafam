-- ==========================================
-- Kas Kontrakan Sigma - Additional Schema
-- ==========================================
-- Payment Accounts for tracking where money is stored

-- ==========================================
-- ACCOUNTS TABLE (Rekening/Wallet)
-- ==========================================
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ewallet', 'bank')),
    provider VARCHAR(50) NOT NULL,
    account_number VARCHAR(50),
    balance INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial accounts data
INSERT INTO accounts (name, type, provider, account_number, balance, icon) VALUES
    ('Dana', 'ewallet', 'Dana', '087860811076', 39500, '💳'),
    ('ShopeePay', 'ewallet', 'Shopee', '087860811076', 0, '🛒'),
    ('GoPay', 'ewallet', 'Gojek', '087860811076', 0, '🟢'),
    ('BCA Digital', 'bank', 'BCA', '001108786076', 0, '🏦'),
    ('BSI', 'bank', 'BSI', '7316577223', 0, '🕌'),
    ('Bank Jago', 'bank', 'Jago', '105428293091', 0, '🐯');

-- Enable RLS
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- ADD account_id TO TRANSACTIONS TABLE
-- ==========================================
-- Run this to add account tracking to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES accounts(id) ON DELETE SET NULL;
