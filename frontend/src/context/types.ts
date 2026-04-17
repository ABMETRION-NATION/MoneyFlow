export type TxType = 'income' | 'expense';
export type Recurring = 'none' | 'daily' | 'weekly' | 'monthly';

export type Category = {
  id: string;
  name: string;
  icon: string; // Feather icon name
  color: string;
  isDefault?: boolean;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TxType;
  categoryId: string;
  date: string; // ISO
  note?: string;
  recurring: Recurring;
  parentId?: string; // if created from a recurring template
};

export type Budget = {
  monthly: number | null; // null = no budget
};

export type ThemeMode = 'dark' | 'light';

export type AppState = {
  hydrated: boolean;
  firstLaunch: boolean;
  theme: ThemeMode;
  currency: string; // e.g. 'INR'
  transactions: Transaction[];
  categories: Category[];
  budget: Budget;
  lastRecurringRunAt: string | null;
};
