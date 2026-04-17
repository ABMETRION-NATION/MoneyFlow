import { Transaction, Recurring } from '../context/types';

const addDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const addMonths = (date: Date, months: number): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const nextDate = (d: Date, kind: Recurring): Date => {
  if (kind === 'daily') return addDays(d, 1);
  if (kind === 'weekly') return addDays(d, 7);
  if (kind === 'monthly') return addMonths(d, 1);
  return d;
};

const genId = () => `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Given the existing transactions, for every "template" transaction (recurring !== 'none'),
 * generate concrete copies for each due occurrence between the template's date and `now`.
 * A child copy has parentId = template.id and recurring = 'none'. We avoid double-creation by
 * tracking which dates have already been generated.
 */
export const materializeRecurring = (transactions: Transaction[], now: Date = new Date()): Transaction[] => {
  const templates = transactions.filter((t) => t.recurring !== 'none');
  if (templates.length === 0) return transactions;

  const generatedKeys = new Set(
    transactions
      .filter((t) => t.parentId)
      .map((t) => `${t.parentId}::${new Date(t.date).toISOString().slice(0, 10)}`)
  );

  const newOnes: Transaction[] = [];

  for (const tmpl of templates) {
    const templateDate = new Date(tmpl.date);
    // first occurrence is the template itself (already in list). Next occurrence onwards:
    let cursor = nextDate(templateDate, tmpl.recurring);
    // safety limit
    let iter = 0;
    while (cursor.getTime() <= now.getTime() && iter < 400) {
      const key = `${tmpl.id}::${cursor.toISOString().slice(0, 10)}`;
      if (!generatedKeys.has(key)) {
        newOnes.push({
          id: genId(),
          amount: tmpl.amount,
          type: tmpl.type,
          categoryId: tmpl.categoryId,
          date: cursor.toISOString(),
          note: tmpl.note,
          recurring: 'none',
          parentId: tmpl.id,
        });
        generatedKeys.add(key);
      }
      cursor = nextDate(cursor, tmpl.recurring);
      iter += 1;
    }
  }

  return [...transactions, ...newOnes];
};
