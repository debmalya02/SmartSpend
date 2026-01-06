import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseStore } from '../stores/useExpenseStore';

import { Card } from '../components/Card';
import { COLORS, SPACING } from '../constants/Theme';

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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        <Text style={styles.header}>Dashboard</Text>

        {/* Savings Card - Premium Gradient */}
        <Card variant="primary">
          <Text style={[styles.cardTitle, { color: 'rgba(255,255,255,0.8)' }]}>Monthly Savings</Text>
          <Text style={[styles.amount, { color: '#FFF' }]}>₹{stats.savings.toLocaleString()}</Text>
          <View style={styles.row}>
            <Text style={[styles.metric, { color: '#FFF' }]}>{stats.savingsRate}%</Text>
            <Text style={[styles.subtext, { color: 'rgba(255,255,255,0.8)' }]}>saved this month</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(stats.savingsRate, 100)}%` }]} />
          </View>
        </Card>

        {/* Other Widgets */}
        <View style={styles.rowWrapper}>
          <View style={styles.halfCardWrapper}>
            <Card style={styles.fullHeight}>
              <Text style={styles.label}>Income</Text>
              <Text style={[styles.value, { color: COLORS.success }]}>₹{stats.income.toLocaleString()}</Text>
            </Card>
          </View>
          <View style={styles.halfCardWrapper}>
            <Card style={styles.fullHeight}>
              <Text style={styles.label}>Expenses</Text>
              <Text style={[styles.value, { color: COLORS.danger }]}>₹{stats.expense.toLocaleString()}</Text>
            </Card>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: SPACING.m },
  header: { fontSize: 32, fontWeight: '700', marginBottom: SPACING.l, color: COLORS.text },
  cardTitle: { fontSize: 16, marginBottom: 5 },
  amount: { fontSize: 36, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 15, gap: 8 },
  metric: { fontSize: 20, fontWeight: '600' },
  subtext: {},
  progressBarBg: { height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },

  rowWrapper: { flexDirection: 'row', gap: SPACING.m },
  halfCardWrapper: { flex: 1 },
  fullHeight: { flex: 1 }, // Ensure card takes full height of wrapper

  label: { fontSize: 14, color: COLORS.textSecondary },
  value: { fontSize: 22, fontWeight: '600', marginTop: 4 },
});
