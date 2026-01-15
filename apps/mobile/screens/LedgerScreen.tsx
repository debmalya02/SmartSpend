import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ScanLine, Trash2, ShoppingBag, Coffee, Car, Home, Zap, Film, TrendingUp } from 'lucide-react-native';
import { useExpenseStore } from '../stores/useExpenseStore';
import { VibeInput } from '../components/VibeInput';
import ScanReceiptModal from '../components/ScanReceiptModal';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/Theme';

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: any } = {
    'Food': Coffee,
    'Shopping': ShoppingBag,
    'Transport': Car,
    'Housing': Home,
    'Utilities': Zap,
    'Entertainment': Film,
    'Income': TrendingUp,
  };
  return iconMap[category] || ShoppingBag;
};

export default function LedgerScreen() {
  const { expenses, fetchExpenses, deleteTransaction } = useExpenseStore();
  const [showScan, setShowScan] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => deleteTransaction(id) 
        }
      ]
    );
  };

  const renderTransaction = ({ item, index }: { item: any; index: number }) => {
    const CategoryIcon = getCategoryIcon(item.category?.name || 'Shopping');
    const isIncome = item.type === 'INCOME';
    
    return (
      <Animated.View style={styles.cardOuter}>
        <BlurView intensity={30} tint="dark" style={styles.cardBlur}>
          <LinearGradient
            colors={GRADIENTS.glass as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardContent}>
              {/* Icon */}
              <View style={[
                styles.iconContainer,
                { backgroundColor: isIncome ? 'rgba(0, 214, 143, 0.15)' : 'rgba(255, 107, 74, 0.15)' }
              ]}>
                <CategoryIcon 
                  color={isIncome ? COLORS.success : COLORS.primary} 
                  size={20} 
                />
              </View>
              
              {/* Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.merchant} numberOfLines={1}>
                  {item.merchant || 'Unknown Merchant'}
                </Text>
                <View style={styles.metaRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {item.category?.name || 'Uncategorized'}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {new Date(item.date).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </Text>
                </View>
                {item.description && (
                  <Text style={styles.description} numberOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </View>
              
              {/* Amount & Actions */}
              <View style={styles.rightSection}>
                <Text style={[
                  styles.amount, 
                  isIncome ? styles.incomeAmount : styles.expenseAmount
                ]}>
                  {isIncome ? '+' : '-'}{item.currency} {Math.abs(item.amount).toLocaleString()}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleDelete(item.id)} 
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Trash2 size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Ambient Background - Seamless multi-stop gradient */}
      <LinearGradient
        colors={[
          'rgba(255, 107, 74, 0.12)',
          'rgba(255, 107, 74, 0.06)',
          'rgba(255, 107, 74, 0.02)',
          'rgba(255, 107, 74, 0.005)',
          'rgba(10, 10, 15, 0)',
        ]}
        locations={[0, 0.3, 0.55, 0.8, 1]}
        style={styles.ambientGlow}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ledger</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <VibeInput />
          </View>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => setShowScan(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanButtonGradient}
            >
              <ScanLine color={COLORS.white} size={24} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScanReceiptModal visible={showScan} onClose={() => setShowScan(false)} />

        {/* Transactions List */}
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={renderTransaction}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <ShoppingBag color={COLORS.textMuted} size={48} />
              </View>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first expense using the input above
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 450,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.s,
  },
  title: {
    ...TYPOGRAPHY.hero,
    color: COLORS.text,
  },
  
  // Input Section
  inputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    gap: SPACING.m,
  },
  inputWrapper: {
    flex: 1,
  },
  scanButton: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.float,
  },
  scanButtonGradient: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // List
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 120,
  },
  
  // Card
  cardOuter: {
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  cardBlur: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.l,
  },
  card: {
    padding: SPACING.m,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  detailsContainer: {
    flex: 1,
  },
  merchant: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  categoryBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.s,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.s,
  },
  categoryText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
  date: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  description: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 4,
  },
  rightSection: {
    alignItems: 'flex-end',
    marginLeft: SPACING.s,
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  incomeAmount: {
    color: COLORS.success,
  },
  expenseAmount: {
    color: COLORS.text,
  },
  deleteButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.s,
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: SPACING.xxl * 2,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});
