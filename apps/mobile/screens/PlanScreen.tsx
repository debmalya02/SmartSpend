import React, { useState, useEffect } from "react";
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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  Plus,
  X,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  Repeat,
} from "lucide-react-native";
import { useExpenseStore } from "../stores/useExpenseStore";
import {
  COLORS,
  GRADIENTS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from "../constants/Theme";

const { width, height } = Dimensions.get("window");

export default function PlanScreen() {
  const { recurringPlans, fetchPlans, createPlan } = useExpenseStore();
  const [activeTab, setActiveTab] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
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
      type: activeTab,
    });
    await fetchPlans();
    setLoading(false);
    setModalVisible(false);
    setName("");
    setAmount("");
  };

  const filteredPlans = recurringPlans.filter((p) => p.type === activeTab);

  const renderPlanCard = ({ item }: { item: any }) => {
    const isIncome = item.type === "INCOME";

    return (
      <View style={styles.card}>
        <BlurView intensity={20} tint="dark" style={styles.cardBlur}>
          <View style={styles.cardContent}>
            {/* Icon */}
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: isIncome
                    ? "rgba(0, 214, 143, 0.12)"
                    : "rgba(255, 107, 74, 0.12)",
                },
              ]}
            >
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
                <View style={styles.badge}>
                  <Clock color={COLORS.textMuted} size={11} />
                  <Text style={styles.badgeText}>{item.frequency}</Text>
                </View>
                <View style={styles.badge}>
                  <Calendar color={COLORS.textMuted} size={11} />
                  <Text style={styles.badgeText}>
                    {new Date(item.nextDueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
              </View>
            </View>

            {/* Amount */}
            <Text
              style={[
                styles.planAmount,
                { color: isIncome ? COLORS.success : COLORS.text },
              ]}
            >
              {isIncome ? "+" : ""}₹{Number(item.amount).toLocaleString()}
            </Text>
          </View>
        </BlurView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Smooth ambient glow */}
      <LinearGradient
        colors={[
          "rgba(255, 107, 74, 0.18)",
          "rgba(255, 115, 85, 0.1)",
          "rgba(255, 130, 100, 0.04)",
          "transparent",
        ]}
        locations={[0, 0.15, 0.35, 0.6]}
        style={styles.ambientGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Plans</Text>
            <Text style={styles.subtitle}>Recurring transactions</Text>
          </View>
          <View style={styles.headerIcon}>
            <Repeat color={COLORS.primary} size={22} />
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "INCOME" && styles.tabActive]}
            onPress={() => setActiveTab("INCOME")}
            activeOpacity={0.7}
          >
            {activeTab === "INCOME" ? (
              <LinearGradient
                colors={[COLORS.success, "#00FFB3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            ) : null}
            <TrendingUp
              color={activeTab === "INCOME" ? COLORS.white : COLORS.textMuted}
              size={18}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "INCOME" && styles.tabTextActive,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "EXPENSE" && styles.tabActive]}
            onPress={() => setActiveTab("EXPENSE")}
            activeOpacity={0.7}
          >
            {activeTab === "EXPENSE" ? (
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            ) : null}
            <TrendingDown
              color={activeTab === "EXPENSE" ? COLORS.white : COLORS.textMuted}
              size={18}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "EXPENSE" && styles.tabTextActive,
              ]}
            >
              Expenses
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={filteredPlans}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={renderPlanCard}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIconContainer}>
                <Calendar color={COLORS.textMuted} size={40} />
              </View>
              <Text style={styles.emptyTitle}>
                No {activeTab.toLowerCase()} plans yet
              </Text>
              <Text style={styles.emptySubtitle}>
                Add recurring{" "}
                {activeTab === "INCOME" ? "income sources" : "expenses"} to
                track them
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
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus color={COLORS.white} size={26} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Modal Form */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <View style={styles.modalContainer}>
            {/* Smooth ambient glow for modal */}
            <LinearGradient
              colors={[
                "rgba(255, 107, 74, 0.15)",
                "rgba(255, 115, 85, 0.08)",
                "rgba(255, 130, 100, 0.03)",
                "transparent",
              ]}
              locations={[0, 0.15, 0.35, 0.6]}
              style={styles.modalAmbientGlow}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0.5 }}
            />

            <SafeAreaView style={styles.modalSafeArea}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.modalKeyboard}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>
                      New {activeTab === "INCOME" ? "Income" : "Expense"}
                    </Text>
                    <Text style={styles.modalSubtitle}>
                      Add a recurring{" "}
                      {activeTab === "INCOME" ? "income source" : "expense"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <X color={COLORS.textSecondary} size={22} />
                  </TouchableOpacity>
                </View>

                {/* Form */}
                <View style={styles.form}>
                  {/* Name Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>NAME</Text>
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
                    <Text style={styles.label}>AMOUNT</Text>
                    <View style={styles.inputContainer}>
                      <Text style={styles.currencySymbol}>₹</Text>
                      <TextInput
                        style={[styles.input, styles.amountInput]}
                        placeholder="0"
                        placeholderTextColor={COLORS.textMuted}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                      />
                    </View>
                  </View>

                  {/* Frequency Pills */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>FREQUENCY</Text>
                    <View style={styles.pillContainer}>
                      {["weekly", "monthly", "yearly"].map((f) => (
                        <TouchableOpacity
                          key={f}
                          style={[
                            styles.pill,
                            frequency === f && styles.pillActive,
                          ]}
                          onPress={() => setFrequency(f)}
                          activeOpacity={0.7}
                        >
                          {frequency === f && (
                            <LinearGradient
                              colors={[COLORS.primary, COLORS.secondary]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={StyleSheet.absoluteFillObject}
                            />
                          )}
                          <Text
                            style={[
                              styles.pillText,
                              frequency === f && styles.pillTextActive,
                            ]}
                          >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                  style={styles.createButtonOuter}
                  onPress={handleCreate}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.createButton}
                  >
                    <Text style={styles.buttonText}>
                      {loading ? "Creating..." : "Create Plan"}
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
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.m,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 74, 0.2)",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: SPACING.l,
    marginBottom: SPACING.l,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m - 4,
    borderRadius: BORDER_RADIUS.m,
    gap: SPACING.s,
    overflow: "hidden",
  },
  tabActive: {},
  tabText: {
    fontSize: 15,
    fontWeight: "600",
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
  card: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    marginBottom: SPACING.s,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  cardBlur: {
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  detailsContainer: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: "capitalize",
  },
  planAmount: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  // Empty State
  empty: {
    alignItems: "center",
    paddingTop: SPACING.xxl * 2,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.s,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    paddingHorizontal: SPACING.xl,
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 110,
    right: SPACING.l,
    borderRadius: 28,
    overflow: "hidden",
  },
  fabGradient: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalAmbientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalKeyboard: {
    flex: 1,
    padding: SPACING.l,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xl,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },

  // Form
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: SPACING.s,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.m,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.m,
  },
  amountInput: {
    fontSize: 20,
    fontWeight: "600",
  },
  pillContainer: {
    flexDirection: "row",
    gap: SPACING.s,
  },
  pill: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  pillActive: {
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.white,
  },

  // Create Button
  createButtonOuter: {
    marginTop: SPACING.xl,
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
  },
  createButton: {
    paddingVertical: SPACING.l,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});
