import { Category } from '../context/types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-food', name: 'Food', icon: 'coffee', color: '#F59E0B', isDefault: true },
  { id: 'cat-bills', name: 'Bills', icon: 'file-text', color: '#F43F5E', isDefault: true },
  { id: 'cat-transport', name: 'Transport', icon: 'navigation', color: '#06B6D4', isDefault: true },
  { id: 'cat-shopping', name: 'Shopping', icon: 'shopping-bag', color: '#8B5CF6', isDefault: true },
  { id: 'cat-income', name: 'Income', icon: 'trending-up', color: '#10B981', isDefault: true },
  { id: 'cat-other', name: 'Other', icon: 'grid', color: '#94A3B8', isDefault: true },
];

export const AVAILABLE_ICONS = [
  'coffee', 'shopping-bag', 'navigation', 'file-text', 'trending-up', 'grid',
  'home', 'heart', 'gift', 'briefcase', 'book', 'music', 'film', 'smartphone',
  'zap', 'droplet', 'wifi', 'credit-card', 'dollar-sign', 'airplay',
];

export const AVAILABLE_COLORS = [
  '#0057FF', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#EF4444', '#14B8A6',
];
