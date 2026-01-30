// Database types for Supabase

export interface Database {
    public: {
        Tables: {
            residents: {
                Row: Resident;
                Insert: Omit<Resident, 'id' | 'created_at'>;
                Update: Partial<Omit<Resident, 'id' | 'created_at'>>;
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at'>;
                Update: Partial<Omit<Category, 'id' | 'created_at'>>;
            };
            transactions: {
                Row: Transaction;
                Insert: Omit<Transaction, 'id' | 'created_at'>;
                Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
            };
            monthly_bills: {
                Row: MonthlyBill;
                Insert: Omit<MonthlyBill, 'id' | 'created_at'>;
                Update: Partial<Omit<MonthlyBill, 'id' | 'created_at'>>;
            };
        };
    };
}

export interface Resident {
    id: string;
    name: string;
    default_monthly_amount: number;
    room_type: 'ac' | 'non-ac';
    floor: 'atas' | 'bawah';
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    type: 'income' | 'expense';
    default_per_person: number | null;
    created_at: string;
}

export interface Transaction {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    resident_id: string | null;
    category_id: string | null;
    account_id: string | null;
    description: string | null;
    receipt_url: string | null;
    transaction_date: string;
    created_at: string;
}

export interface MonthlyBill {
    id: string;
    year: number;
    month: number;
    resident_id: string;
    category_id: string;
    amount_due: number;
    amount_paid: number;
    is_paid: boolean;
    paid_at: string | null;
    created_at: string;
}

export interface Account {
    id: string;
    name: string;
    type: 'ewallet' | 'bank';
    provider: string;
    account_number: string | null;
    balance: number;
    icon: string | null;
    created_at: string;
}

// Extended types with relations
export interface TransactionWithRelations extends Transaction {
    residents?: Resident | null;
    categories?: Category | null;
    accounts?: Account | null;
}

export interface MonthlyBillWithRelations extends MonthlyBill {
    residents?: Resident;
    categories?: Category;
}

