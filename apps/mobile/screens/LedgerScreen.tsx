import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { useExpenseStore } from '../stores/useExpenseStore';
import { VibeInput } from '../components/VibeInput';

export default function LedgerScreen() {
  const { expenses, fetchExpenses } = useExpenseStore();

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Ledger</Text>
      
      <View style={styles.inputSection}>
        <VibeInput />
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.merchant}>{item.merchant || 'Unknown Merchant'}</Text>
              <Text style={[styles.amount, item.type === 'INCOME' && styles.incomeAmount]}>
                {item.type === 'INCOME' ? '+' : ''} {item.currency} {item.amount}
              </Text>
            </View>
            <View style={styles.cardFooter}>
              <Text style={styles.category}>{item.category?.name || 'Uncategorized'}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
             <Text style={styles.emptyText}>No transactions yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: { fontSize: 32, fontWeight: '700', margin: 20 },
  inputSection: { paddingHorizontal: 20, marginBottom: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#999', fontSize: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  merchant: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  amount: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  date: { fontSize: 12, color: '#9CA3AF' },
  description: { fontSize: 14, color: '#4B5563', fontStyle: 'italic' },
  incomeAmount: { color: '#34C759' },
});
