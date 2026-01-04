import { create } from 'zustand';

interface Expense {
  id: string;
  amount: string; // Serialized Decimal
  currency: string;
  type: 'INCOME' | 'EXPENSE';
  description: string;
  merchant: string | null;
  category: {
    name: string;
    icon: string;
    color: string;
  };
  date: string;
}

interface ExpenseStore {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  addExpenseViaAI: (text: string) => Promise<void>;
  fetchExpenses: () => Promise<void>;
  askAffordability: (query: string) => Promise<any>;
  createPlan: (data: { name: string; amount: number; frequency: string; type: 'INCOME' | 'EXPENSE' }) => Promise<void>;
  recurringPlans: RecurringPlan[];
  fetchPlans: () => Promise<void>;
  dashboardStats: { income: number; expense: number; savings: number; savingsRate: number } | null;
  fetchDashboardStats: () => Promise<void>;
}

interface RecurringPlan {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  type: 'INCOME' | 'EXPENSE';
  nextDueDate: string;
}

// Replace with your actual local IP if testing on real device, or localhost for simulator
const API_URL = 'http://192.168.0.177:3000'; 

export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  recurringPlans: [],
  dashboardStats: null,
  loading: false,
  error: null,
  addExpenseViaAI: async (text: string) => {
    set({ loading: true, error: null });
    try {
      const userId = 'test-user-id'; 
      
      const response = await fetch(`${API_URL}/expenses/ai-add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to add expense');
      }

      const newExpense = await response.json();
      
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        loading: false,
      }));
    } catch (error) {
      console.error(error);
      set({ loading: false, error: 'Failed to add expense. Please try again.' });
    }
  },
  fetchExpenses: async () => {
      set({ loading: true, error: null });
      try {
        const userId = 'test-user-id';
        const response = await fetch(`${API_URL}/expenses?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const data = await response.json();
        set({ expenses: data, loading: false });
      } catch (error) {
          console.error(error);
          set({ loading: false, error: 'Failed to fetch expenses' });
      }
  },
  askAffordability: async (query: string) => {
    try {
        const userId = 'test-user-id';
        const response = await fetch(`${API_URL}/ai/ask-affordability`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, query })
        });
        if (!response.ok) throw new Error('Failed to ask AI');
        return await response.json();
    } catch (error) {
        console.error(error);
        return { verdict: 'Error', advice: 'Could not connect to AI Coach.', color: 'gray' };
    }
  },
  createPlan: async (data) => {
      try {
          const userId = 'test-user-id';
          await fetch(`${API_URL}/recurring`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...data, userId })
          });
      } catch (error) {
          console.error("Failed to create plan", error);
      }
  },
  fetchPlans: async () => {
      try {
          const userId = 'test-user-id';
          const response = await fetch(`${API_URL}/recurring?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch plans');
          const data = await response.json();
          set({ recurringPlans: data });
      } catch (error) {
          console.error("Failed to fetch plans", error);
      }
  },
  fetchDashboardStats: async () => {
      try {
          const userId = 'test-user-id';
          const response = await fetch(`${API_URL}/dashboard?userId=${userId}`);
          if (!response.ok) throw new Error('Failed to fetch stats');
          const data = await response.json();
          set({ dashboardStats: data });
      } catch (error) {
          console.error("Failed to fetch stats", error);
      }
  }
}));
