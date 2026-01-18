import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

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
  addMultipleExpensesViaVoice: (transcript: string) => Promise<{ addedCount: number; expenses: Expense[] }>;
  fetchExpenses: () => Promise<void>;
  askAffordability: (query: string) => Promise<any>;
  createPlan: (data: { name: string; amount: number; frequency: string; type: 'INCOME' | 'EXPENSE'; category?: string }) => Promise<void>;
  recurringPlans: RecurringPlan[];
  fetchPlans: () => Promise<void>;
  dashboardStats: { income: number; expense: number; savings: number; savingsRate: number } | null;
  fetchDashboardStats: () => Promise<void>;
  scanReceipt: (imageUrl: string) => Promise<any>;
  addTransaction: (data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

interface RecurringPlan {
  id: string;
  name: string;
  amount: string;
  frequency: string;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  nextDueDate: string;
}

// Replace with your actual local IP if testing on real device, or localhost for simulator
const API_URL = 'http://192.168.0.177:3000'; // Local Machine IP
// const API_URL = 'http://10.0.2.2:3000'; // For Android Emulator
// const API_URL = 'http://localhost:3000'; // For iOS Simulator
// const API_URL = 'https://smartspend-h9vm.onrender.com'; // Production

// Helper function to get current user ID
const getUserId = () => {
  const { userProfile } = useAuthStore.getState();
  if (!userProfile?.id) {
    throw new Error('User not authenticated');
  }
  return userProfile.id;
};

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  recurringPlans: [],
  dashboardStats: null,
  loading: false,
  error: null,
  addExpenseViaAI: async (text: string) => {
    set({ loading: true, error: null });
    try {
      const userId = getUserId();

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
  addMultipleExpensesViaVoice: async (transcript: string) => {
    set({ loading: true, error: null });
    try {
      const userId = getUserId();
      console.log('Sending voice transcript to API:', transcript);

      const response = await fetch(`${API_URL}/expenses/ai-add-multiple`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: transcript, userId }),
      });

      console.log('API Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to process voice input: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', JSON.stringify(result));
      const { transactions } = result;

      // Add new transactions to the store
      set((state) => ({
        expenses: [...(transactions || []), ...state.expenses],
        loading: false,
      }));

      return {
        addedCount: transactions?.length || 0,
        expenses: transactions || [],
      };
    } catch (error) {
      console.error('Voice input error:', error);
      set({ loading: false, error: 'Failed to process voice input. Please try again.' });
      throw error;
    }
  },
  fetchExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const userId = getUserId();
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
      const userId = getUserId();
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
  createPlan: async (data: { name: string; amount: number; frequency: string; type: 'INCOME' | 'EXPENSE'; category?: string }) => {
    try {
      const userId = getUserId();
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
      const userId = getUserId();
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
      const userId = getUserId();
      const response = await fetch(`${API_URL}/dashboard?userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      set({ dashboardStats: data });
    } catch (error) {
      console.error("Failed to fetch stats", error);
    }
  },
  scanReceipt: async (imageUrl: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/ai/scan-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      if (!response.ok) throw new Error('Failed to scan receipt');
      const data = await response.json();
      set({ loading: false });
      return data;
    } catch (error) {
      console.error("Scan failed", error);
      set({ loading: false, error: 'Failed to scan receipt' });
      throw error;
    }
  },
  addTransaction: async (data: any) => {
    set({ loading: true, error: null });
    try {
      const userId = getUserId();
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, userId })
      });
      if (!response.ok) throw new Error('Failed to create transaction');

      const newExpense = await response.json();
      set((state) => ({
        expenses: [newExpense, ...state.expenses],
        loading: false
      }));
    } catch (error) {
      console.error("Create failed", error);
      set({ loading: false, error: 'Failed to save transaction' });
      throw error;
    }
  },
  deleteTransaction: async (id: string) => {
    // Optimistic Update
    set((state) => ({
      expenses: state.expenses.filter((e) => e.id !== id),
    }));

    try {
      const userId = getUserId();
      const response = await fetch(`${API_URL}/expenses/${id}?userId=${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error("Delete failed", error);
      // Revert or fetch to sync
      get().fetchExpenses();
    }
  }
}));
