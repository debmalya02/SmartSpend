import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  FlatList, 
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Plus, X, Calendar, TrendingUp, TrendingDown, Clock, ChevronRight } from 'lucide-react-native';
import { useExpenseStore } from '../stores/useExpenseStore';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/Theme';

export default function PlanScreen() {
  const { recurringPlans, fetchPlans, createPlan } = useExpenseStore();
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async () => {
    if (!name || !amount) {
      Alert.alert("Missing Fields", "Please enter a name and amount.");
      return;
    }
    
    setLoading(true);
    await createPlan({ 
      name, 
      amount: Number(amount), 
      frequency, 
      type: activeTab 
    });
    await fetchPlans();
    setLoading(false);
    setModalVisible(false);
    setName('');
    setAmount('');
  };

  const filteredPlans = recurringPlans.filter(p => p.type === activeTab);

  const renderPlanCard = ({ item }: { item: any }) => {
    const isIncome = item.type === 'INCOME';
    
    return (
      <View style={styles.cardOuter}>
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
                {isIncome ? (
                  <TrendingUp color={COLORS.success} size={20} />
                ) : (
                  <TrendingDown color={COLORS.primary} size={20} />
                )}
              </View>
              
              {/* Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.planName}>{item.name}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.frequencyBadge}>
                    <Clock color={COLORS.textMuted} size={12} />
                    <Text style={styles.frequencyText}>{item.frequency}</Text>
                  </View>
                  <View style={styles.dateBadge}>
                    <Calendar color={COLORS.textMuted} size={12} />
                    <Text style={styles.dateText}>
                      {new Date(item.nextDueDate).toLocaleDateString('en-IN', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              
              {/* Amount */}
              <View style={styles.rightSection}>
                <Text style={[
                  styles.planAmount, 
                  { color: isIncome ? COLORS.success : COLORS.text }
                ]}>
                  {isIncome ? '+' : ''}₹{Number(item.amount).toLocaleString()}
                </Text>
                <ChevronRight color={COLORS.textMuted} size={18} />
              </View>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
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
          <Text style={styles.title}>Plans</Text>
          <Text style={styles.subtitle}>Manage recurring transactions</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabOuter}>
          <BlurView intensity={40} tint="dark" style={styles.tabBlur}>
            <LinearGradient
              colors={GRADIENTS.glass as [string, string]}
              style={styles.tabContainer}
            >
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'INCOME' && styles.tabActive]} 
                onPress={() => setActiveTab('INCOME')}
                activeOpacity={0.7}
              >
                {activeTab === 'INCOME' && (
                  <LinearGradient
                    colors={GRADIENTS.success as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <TrendingUp 
                  color={activeTab === 'INCOME' ? COLORS.white : COLORS.textMuted} 
                  size={18} 
                />
                <Text style={[
                  styles.tabText, 
                  activeTab === 'INCOME' && styles.tabTextActive
                ]}>
                  Income
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'EXPENSE' && styles.tabActive]} 
                onPress={() => setActiveTab('EXPENSE')}
                activeOpacity={0.7}
              >
                {activeTab === 'EXPENSE' && (
                  <LinearGradient
                    colors={GRADIENTS.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
                <TrendingDown 
                  color={activeTab === 'EXPENSE' ? COLORS.white : COLORS.textMuted} 
                  size={18} 
                />
                <Text style={[
                  styles.tabText, 
                  activeTab === 'EXPENSE' && styles.tabTextActive
                ]}>
                  Liabilities
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </BlurView>
        </View>

        {/* List */}
        <FlatList 
          data={filteredPlans}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderPlanCard}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Calendar color={COLORS.textMuted} size={48} />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab.toLowerCase()} plans yet</Text>
              <Text style={styles.emptySubtitle}>
                Add recurring {activeTab === 'INCOME' ? 'income sources' : 'expenses'} to track them
              </Text>
            </View>
          }
        />

        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={GRADIENTS.primary as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus color={COLORS.white} size={28} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Modal Form */}
        <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={[
                'rgba(255, 107, 74, 0.12)',
                'rgba(255, 107, 74, 0.04)',
                'rgba(10, 10, 15, 0)',
              ]}
              locations={[0, 0.5, 1]}
              style={styles.modalAmbient}
            />
            
            <SafeAreaView style={styles.modalSafeArea}>
              <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalKeyboard}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      New {activeTab === 'INCOME' ? 'Income' : 'Liability'}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Add a recurring {activeTab === 'INCOME' ? 'income source' : 'expense'}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <X color={COLORS.textSecondary} size={24} />
                  </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.formOuter}>
                  <BlurView intensity={30} tint="dark" style={styles.formBlur}>
                    <LinearGradient
                      colors={GRADIENTS.glass as [string, string]}
                      style={styles.form}
                    >
                      {/* Name Input */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <View style={styles.inputContainer}>
                          <TextInput 
                            style={styles.input} 
                            placeholder="e.g. Netflix, Salary" 
                            placeholderTextColor={COLORS.textMuted}
                            value={name} 
                            onChangeText={setName} 
                          />
                        </View>
                      </View>

                      {/* Amount Input */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.inputContainer}>
                          <Text style={styles.currencySymbol}>₹</Text>
                          <TextInput 
                            style={[styles.input, styles.amountInput]} 
                            placeholder="0.00" 
                            placeholderTextColor={COLORS.textMuted}
                            keyboardType="numeric" 
                            value={amount} 
                            onChangeText={setAmount} 
                          />
                        </View>
                      </View>

                      {/* Frequency Pills */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Frequency</Text>
                        <View style={styles.pillContainer}>
                          {['weekly', 'monthly', 'yearly'].map(f => (
                            <TouchableOpacity 
                              key={f} 
                              style={[styles.pill, frequency === f && styles.pillActive]} 
                              onPress={() => setFrequency(f)}
                              activeOpacity={0.7}
                            >
                              {frequency === f && (
                                <LinearGradient
                                  colors={GRADIENTS.primary as [string, string]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 1 }}
                                  style={StyleSheet.absoluteFillObject}
                                />
                              )}
                              <Text style={[
                                styles.pillText, 
                                frequency === f && styles.pillTextActive
                              ]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </LinearGradient>
                  </BlurView>
                </View>

                {/* Create Button */}
                <TouchableOpacity 
                  style={styles.createButtonOuter} 
                  onPress={handleCreate}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={GRADIENTS.primary as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createButton}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? 'Creating...' : 'Create Plan'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </View>
        </Modal>
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
  
  // Header
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
  },
  title: {
    ...TYPOGRAPHY.hero,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  
  // Tabs
  tabOuter: {
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  tabBlur: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.l,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: SPACING.xs,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.m - 2,
    borderRadius: BORDER_RADIUS.m,
    gap: SPACING.s,
    overflow: 'hidden',
  },
  tabActive: {},
  tabText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  
  // List
  list: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 140,
  },
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
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
  },
  detailsContainer: {
    flex: 1,
  },
  planName: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  frequencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.s,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.s,
    gap: 4,
  },
  frequencyText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
    textTransform: 'capitalize',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.small,
    color: COLORS.textMuted,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
  },
  planAmount: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  
  // Empty State
  empty: {
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
  
  // FAB
  fab: {
    position: 'absolute',
    bottom: 110,
    right: SPACING.l,
    borderRadius: 32,
    overflow: 'hidden',
    ...SHADOWS.float,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalAmbient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 280,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalKeyboard: {
    flex: 1,
    padding: SPACING.l,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Form
  formOuter: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  formBlur: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.xl,
  },
  form: {
    padding: SPACING.l,
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.s,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.m,
  },
  currencySymbol: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    paddingVertical: SPACING.m,
  },
  amountInput: {
    ...TYPOGRAPHY.h3,
    fontWeight: '600',
  },
  pillContainer: {
    flexDirection: 'row',
    gap: SPACING.s,
  },
  pill: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  pillActive: {
    borderColor: COLORS.primary,
  },
  pillText: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.white,
  },
  
  // Create Button
  createButtonOuter: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    ...SHADOWS.float,
  },
  createButton: {
    paddingVertical: SPACING.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.white,
  },
});
