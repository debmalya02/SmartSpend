import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseStore } from '../stores/useExpenseStore';

export default function DashboardScreen() {
  const { dashboardStats, fetchDashboardStats } = useExpenseStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
  }, []);

  React.useEffect(() => {
    fetchDashboardStats();
  }, []);

  const stats = dashboardStats || {
    income: 0,
    expense: 0,
    savings: 0,
    savingsRate: 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
        }
      >
        <Text style={styles.header}>Dashboard</Text>
        
        {/* Savings Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Savings</Text>
          <Text style={styles.amount}>₹{stats.savings.toLocaleString()}</Text>
          <View style={styles.row}>
            <Text style={styles.metric}>{stats.savingsRate}%</Text>
            <Text style={styles.subtext}>saved this month</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(stats.savingsRate, 100)}%` }]} />
          </View>
        </View>

        {/* Other Widgets */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.label}>Income</Text>
            <Text style={[styles.value, { color: '#34C759' }]}>₹{stats.income.toLocaleString()}</Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.label}>Expenses</Text>
            <Text style={[styles.value, { color: '#FF3B30' }]}>₹{stats.expense.toLocaleString()}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  scroll: { padding: 20 },
  header: { fontSize: 32, fontWeight: '700', marginBottom: 20, color: '#000' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, color: '#666', marginBottom: 5 },
  amount: { fontSize: 36, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 15, gap: 8 },
  metric: { fontSize: 20, fontWeight: '600', color: '#34C759' },
  subtext: { color: '#999' },
  progressBarBg: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 4 },
  halfCard: { flex: 1 },
  label: { fontSize: 14, color: '#888' },
  value: { fontSize: 22, fontWeight: '600', marginTop: 4 },
});
