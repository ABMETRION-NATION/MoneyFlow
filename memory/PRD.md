# MoneyFlow — Product Requirements Document

## Overview
MoneyFlow is a local-first personal finance mobile app built with React Native (Expo Router). It helps users track income, spending, and overall financial habits via a clean, premium, dark-theme UI. No backend required — all data is persisted locally via AsyncStorage.

## Tech stack
- **Framework**: React Native 0.81 + Expo SDK 54, expo-router
- **State**: React Context + useReducer, persisted via @react-native-async-storage/async-storage
- **Charts**: react-native-gifted-charts (line, bar, pie)
- **Icons**: @expo/vector-icons (Feather family)
- **Other**: expo-file-system + expo-sharing (CSV export), date-fns, react-native-safe-area-context

## Navigation
Bottom tab navigation with five tabs:
1. **Home (Dashboard)** — balance, income/expense, quick cards, weekly/monthly line chart, recent activity
2. **Activity (Transactions)** — searchable, filterable, sortable list; add/edit/delete via modal
3. **Insights** — income vs expense, spending-by-category donut, 6-month bar chart
4. **Budget** — set/edit monthly budget, progress bar, category breakdown
5. **Settings** — theme toggle, currency, categories, CSV export, clear data, social login UI placeholders

Modal routes: `/transaction` (add/edit), `/currency-picker` (first launch + change), `/categories` (manage).

## Features
- **First-launch currency picker** — user selects from 9 currencies; INR default.
- **Transactions** — amount, type (income/expense), category, date, optional note, recurring (none/daily/weekly/monthly).
- **Categories** — 6 default + unlimited custom with icon + color. Default categories locked.
- **Budget** — optional monthly limit with color-graded progress (green → orange → red) and per-category breakdown.
- **Search/Filter/Sort** — search by note/category/amount; filter by type & category; sort newest/oldest/highest.
- **CSV export** — writes to cache and shares via system share sheet.
- **Recurring materialization** — on app launch, due occurrences (template + parentId marker) are auto-generated.
- **Theme toggle** — dark (default) / light; full palette swap.
- **Clear data** — wipes transactions/categories/budget (preserves currency + theme).

## Data model (local-only)
- `Transaction { id, amount, type, categoryId, date, note?, recurring, parentId? }`
- `Category { id, name, icon, color, isDefault? }`
- `Budget { monthly: number | null }`
- `AppState { hydrated, firstLaunch, theme, currency, transactions[], categories[], budget, lastRecurringRunAt }`

Persisted under key `@moneyflow/state/v1`.

## Future modules (not activated)
Placeholder folders under `/app/frontend/modules/`:
- `backend_sync` — cloud sync
- `advanced_analytics` — forecasts, anomaly detection
- `subscriptions` — subscription tracking
- `premium_features` — PDF export, advanced reports
