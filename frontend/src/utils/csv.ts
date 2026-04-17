import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Transaction, Category } from '../context/types';

const escapeCsv = (v: string): string => {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
};

export const exportTransactionsToCSV = async (
  transactions: Transaction[],
  categories: Category[],
  currencyCode: string
): Promise<{ success: boolean; message: string }> => {
  if (transactions.length === 0) {
    return { success: false, message: 'No transactions to export' };
  }
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const header = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Note', 'Recurring'];
  const rows = transactions.map((t) => [
    new Date(t.date).toISOString().slice(0, 10),
    t.type,
    catMap.get(t.categoryId) || 'Other',
    t.amount.toFixed(2),
    currencyCode,
    t.note || '',
    t.recurring || 'none',
  ]);
  const csv = [header, ...rows].map((r) => r.map((x) => escapeCsv(String(x))).join(',')).join('\n');

  const fileName = `moneyflow_transactions_${Date.now()}.csv`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: 'utf8' as any });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export transactions',
      UTI: 'public.comma-separated-values-text',
    });
    return { success: true, message: 'Exported successfully' };
  }
  return { success: true, message: `Saved to ${fileUri}` };
};
