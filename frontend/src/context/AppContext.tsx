import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Transaction, Category, ThemeMode, Budget } from './types';
import { DEFAULT_CATEGORIES } from '../utils/defaults';
import { materializeRecurring } from '../utils/recurring';

const STORAGE_KEY = '@moneyflow/state/v1';

const initialState: AppState = {
  hydrated: false,
  firstLaunch: true,
  theme: 'dark',
  currency: 'INR',
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  budget: { monthly: null },
  lastRecurringRunAt: null,
};

type Action =
  | { type: 'HYDRATE'; payload: Partial<AppState> }
  | { type: 'SET_FIRST_LAUNCH_DONE' }
  | { type: 'SET_THEME'; payload: ThemeMode }
  | { type: 'SET_CURRENCY'; payload: string }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_BUDGET'; payload: Budget }
  | { type: 'MATERIALIZE_RECURRING' }
  | { type: 'CLEAR_ALL' };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, hydrated: true };
    case 'SET_FIRST_LAUNCH_DONE':
      return { ...state, firstLaunch: false };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(
          (t) => t.id !== action.payload && t.parentId !== action.payload
        ),
      };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      };
    case 'DELETE_CATEGORY': {
      // reassign transactions using deleted category to 'Other'
      const fallback = 'cat-other';
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        transactions: state.transactions.map((t) =>
          t.categoryId === action.payload ? { ...t, categoryId: fallback } : t
        ),
      };
    }
    case 'SET_BUDGET':
      return { ...state, budget: action.payload };
    case 'MATERIALIZE_RECURRING':
      return {
        ...state,
        transactions: materializeRecurring(state.transactions, new Date()),
        lastRecurringRunAt: new Date().toISOString(),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        transactions: [],
        categories: DEFAULT_CATEGORIES,
        budget: { monthly: null },
        lastRecurringRunAt: null,
      };
    default:
      return state;
  }
};

type Ctx = {
  state: AppState;
  dispatch: React.Dispatch<Action>;
};

const AppContext = createContext<Ctx | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate once
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<AppState>;
          // ensure default categories exist if user somehow wiped them
          const cats = parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CATEGORIES;
          dispatch({
            type: 'HYDRATE',
            payload: {
              ...parsed,
              categories: cats,
            },
          });
        } else {
          dispatch({ type: 'HYDRATE', payload: {} });
        }
      } catch {
        dispatch({ type: 'HYDRATE', payload: {} });
      }
    })();
  }, []);

  // Persist on change (after hydration)
  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _h, ...persistable } = state;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable)).catch(() => {});
  }, [state]);

  // Run recurring materialization after hydration (once per session)
  useEffect(() => {
    if (!state.hydrated) return;
    dispatch({ type: 'MATERIALIZE_RECURRING' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.hydrated]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): Ctx => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const genId = (prefix = 'tx') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
