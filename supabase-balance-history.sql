-- Balance History Table
-- Tracks all changes to account balances for audit trail and undo capability

CREATE TABLE IF NOT EXISTS balance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    old_balance INTEGER NOT NULL,
    new_balance INTEGER NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by account
CREATE INDEX IF NOT EXISTS idx_balance_history_account_id ON balance_history(account_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_created_at ON balance_history(created_at DESC);

-- RLS
ALTER TABLE balance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for balance_history" ON balance_history
FOR ALL USING (true) WITH CHECK (true);
