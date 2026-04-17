import { Transaction } from '../context/types';

export const sumByType = (transactions: Transaction[]): { income: number; expense: number; balance: number } => {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, balance: income - expense };
};

export const sameMonth = (dateIso: string, ref: Date = new Date()): boolean => {
  const d = new Date(dateIso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
};

export const sameWeek = (dateIso: string, ref: Date = new Date()): boolean => {
  const d = new Date(dateIso);
  const diff = (ref.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff < 7;
};

export const weeklyBuckets = (transactions: Transaction[]): { label: string; value: number; fullDate: Date }[] => {
  // last 7 days, expense totals
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { label: string; value: number; fullDate: Date }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
    days.push({ label, value: 0, fullDate: d });
  }
  for (const t of transactions) {
    if (t.type !== 'expense') continue;
    const td = new Date(t.date);
    td.setHours(0, 0, 0, 0);
    const bucket = days.find((x) => x.fullDate.getTime() === td.getTime());
    if (bucket) bucket.value += t.amount;
  }
  return days;
};

export const monthlyBuckets = (transactions: Transaction[]): { label: string; income: number; expense: number; fullDate: Date }[] => {
  const now = new Date();
  const months: { label: string; income: number; expense: number; fullDate: Date }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: d.toLocaleDateString('en-US', { month: 'short' }), income: 0, expense: 0, fullDate: d });
  }
  for (const t of transactions) {
    const d = new Date(t.date);
    const bucket = months.find(
      (m) => m.fullDate.getFullYear() === d.getFullYear() && m.fullDate.getMonth() === d.getMonth()
    );
    if (!bucket) continue;
    if (t.type === 'income') bucket.income += t.amount;
    else bucket.expense += t.amount;
  }
  return months;
};

export const categoryBreakdown = (
  transactions: Transaction[],
  type: 'income' | 'expense' = 'expense'
): { categoryId: string; total: number }[] => {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== type) continue;
    map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([categoryId, total]) => ({ categoryId, total }))
    .sort((a, b) => b.total - a.total);
};
