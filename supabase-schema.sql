-- ==========================================
-- Kas Kontrakan Sigma - Database Schema
-- ==========================================
-- Run this SQL in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. RESIDENTS TABLE
-- ==========================================
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    default_monthly_amount INTEGER NOT NULL DEFAULT 100000,
    room_type VARCHAR(10) NOT NULL CHECK (room_type IN ('ac', 'non-ac')),
    floor VARCHAR(10) NOT NULL CHECK (floor IN ('atas', 'bawah')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial residents data
INSERT INTO residents (name, default_monthly_amount, room_type, floor) VALUES
    ('Kemas', 200000, 'ac', 'atas'),
    ('Dapa', 200000, 'ac', 'bawah'),
    ('Irvan', 100000, 'non-ac', 'atas'),
    ('Aji', 100000, 'non-ac', 'atas'),
    ('Jim', 100000, 'non-ac', 'atas'),
    ('Ferdy', 100000, 'non-ac', 'atas'),
    ('Randa', 100000, 'non-ac', 'bawah'),
    ('Virdio', 100000, 'non-ac', 'bawah');

-- ==========================================
-- 2. CATEGORIES TABLE
-- ==========================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    default_per_person INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initial categories data
INSERT INTO categories (name, type, default_per_person) VALUES
    ('Listrik Atas', 'expense', NULL),
    ('Listrik Bawah', 'expense', NULL),
    ('Keamanan', 'expense', 12500),
    ('Air PAM', 'expense', 15000),
    ('Galon', 'expense', 10000),
    ('Kulkas', 'expense', 12500),
    ('Iuran Bulanan', 'income', NULL);

-- ==========================================
-- 3. TRANSACTIONS TABLE
-- ==========================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount INTEGER NOT NULL,
    resident_id UUID REFERENCES residents(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    receipt_url TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- ==========================================
-- 4. MONTHLY_BILLS TABLE
-- ==========================================
CREATE TABLE monthly_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    amount_due INTEGER NOT NULL DEFAULT 0,
    amount_paid INTEGER NOT NULL DEFAULT 0,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(year, month, resident_id, category_id)
);

-- Index for faster queries
CREATE INDEX idx_monthly_bills_period ON monthly_bills(year, month);

-- ==========================================
-- 5. ROW LEVEL SECURITY (Optional - Disable for no-auth)
-- ==========================================
-- Since this app has no authentication, we allow all operations

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_bills ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth required)
CREATE POLICY "Allow all for residents" ON residents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for monthly_bills" ON monthly_bills FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 6. STORAGE BUCKET FOR RECEIPTS
-- ==========================================
-- Run this in Supabase Dashboard > Storage > Create new bucket:
-- Bucket name: receipts
-- Public bucket: Yes (or configure RLS if needed)

-- If using SQL to create bucket (Supabase v2):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
