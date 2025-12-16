
export type Currency = 'TL' | 'EUR';

export interface Asset {
  id: string;
  type: 'Banka' | 'Fon';
  name: string;
  subType: string;
  currency: Currency;
  amount: number;
  included: boolean;
}

export interface Check {
  id: string;
  dueDateStr: string;
  valor: number;
  effectiveDateStr: string;
  amount: number;
  desc: string;
}

export interface RecurringRule {
  id: string;
  type: 'income' | 'expense';
  startDate: string;
  amount: number;
  desc: string;
  freq: 'weekly' | 'monthly';
  weekDays?: number[]; // 1-7 (Mon-Sun)
  monthType?: 'fixed' | 'special';
  fixedDay?: number;
  specialOrd?: string;
  specialDay?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  date: string;
  amount: number;
  desc: string;
  currency: Currency;
  source?: 'excel' | 'manual';
  sourceTab?: string;
}

export interface CustomTab {
  id: string;
  name: string;
}

export type ProjectionType = 'daily' | 'weekly' | 'monthly';

export interface FlowPeriod {
  start: Date;
  end: Date;
  label: string;
  incomes: number;
  expenses: number;
  balance: number;
  details: Record<string, number>;
}
