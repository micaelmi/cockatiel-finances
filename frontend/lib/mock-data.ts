import { faker } from '@faker-js/faker';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
}

export interface FinancialSummary {
  balance: number;
  income: number;
  expenses: number;
  monthlyData: { month: string; income: number; expense: number }[];
  recentTransactions: Transaction[];
}

export const generateMockData = (): FinancialSummary => {
  const currentMonth = new Date();
  
  // Generate random balance similar to a real user
  const balance = parseFloat(faker.finance.amount({ min: 1000, max: 15000, dec: 2 }));
  const income = parseFloat(faker.finance.amount({ min: 2000, max: 5000, dec: 2 }));
  const expenses = parseFloat(faker.finance.amount({ min: 1000, max: 4000, dec: 2 }));

  // Generate monthly data for chart
  const monthlyData = Array.from({ length: 6 }).map((_, i) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - i), 1);
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      income: parseFloat(faker.finance.amount({ min: 2000, max: 5000, dec: 0 })),
      expense: parseFloat(faker.finance.amount({ min: 1500, max: 4500, dec: 0 })),
    };
  });

  // Generate recent transactions
  const recentTransactions: Transaction[] = Array.from({ length: 10 }).map(() => {
    const type = faker.helpers.arrayElement(['income', 'expense'] as TransactionType[]);
    return {
      id: faker.string.uuid(),
      date: faker.date.recent({ days: 30 }),
      amount: parseFloat(faker.finance.amount({ min: 10, max: 500, dec: 2 })),
      description: faker.commerce.productName(),
      category: type === 'income' ? 'Salary' : faker.commerce.department(),
      type,
    };
  });

  return {
    balance,
    income,
    expenses,
    monthlyData,
    recentTransactions: recentTransactions.sort((a, b) => b.date.getTime() - a.date.getTime()),
  };
};
