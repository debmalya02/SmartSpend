import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react-native";
import { useExpenseStore } from "../stores/useExpenseStore";
import { useAuthStore } from "../stores/useAuthStore";
import {
  COLORS,
  GRADIENTS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from "../constants/Theme";

const { width, height } = Dimensions.get("window");

// Get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function DashboardScreen() {
  const { dashboardStats, fetchDashboardStats } = useExpenseStore();
  const { userProfile } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  // Use actual user name from auth store
  const userName = userProfile?.name || "User";

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

  const greeting = getGreeting();
  const netBalance = stats.income - stats.expense;

  return (
    <View style={styles.container}>
      {/* Smooth ambient glow - diagonal gradient from top-right */}
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
            <View style={styles.sparkleContainer}>
              <Sparkles color={COLORS.primary} size={24} />
            </View>
          </View>

          {/* Main Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={["rgba(255, 107, 74, 0.08)", "rgba(255, 107, 74, 0.02)"]}
              style={styles.balanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Total Savings</Text>
                <View style={styles.savingsRateBadge}>
                  <TrendingUp color={COLORS.success} size={14} />
                  <Text style={styles.savingsRateText}>
                    {stats.savingsRate}%
                  </Text>
                </View>
              </View>

              <Text style={styles.balanceAmount}>
                <Text style={styles.currencySymbol}>₹</Text>
                {stats.savings.toLocaleString()}
              </Text>

              <Text style={styles.balanceSubtext}>this month</Text>

              {/* Progress indicator */}
              <View style={styles.progressWrapper}>
                <View style={styles.progressTrack}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                      styles.progressBar,
                      { width: `${Math.min(stats.savingsRate, 100)}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressLabels}>
                  <Text style={styles.progressLabel}>0%</Text>
                  <Text style={styles.progressLabel}>Target</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Accent line */}
            <LinearGradient
              colors={[COLORS.primary, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentLine}
            />
          </View>

          {/* Quick Stats Row */}
          <View style={styles.quickStats}>
            {/* Income */}
            <View style={styles.quickStatCard}>
              <BlurView intensity={20} tint="dark" style={styles.quickStatBlur}>
                <View style={styles.quickStatContent}>
                  <View style={styles.quickStatHeader}>
                    <View style={[styles.quickStatIcon, styles.incomeIcon]}>
                      <ArrowDownRight color={COLORS.success} size={16} />
                    </View>
                    <Text style={styles.quickStatLabel}>Income</Text>
                  </View>
                  <Text style={[styles.quickStatValue, styles.incomeValue]}>
                    ₹{stats.income.toLocaleString()}
                  </Text>
                </View>
              </BlurView>
            </View>

            {/* Expenses */}
            <View style={styles.quickStatCard}>
              <BlurView intensity={20} tint="dark" style={styles.quickStatBlur}>
                <View style={styles.quickStatContent}>
                  <View style={styles.quickStatHeader}>
                    <View style={[styles.quickStatIcon, styles.expenseIcon]}>
                      <ArrowUpRight color={COLORS.danger} size={16} />
                    </View>
                    <Text style={styles.quickStatLabel}>Expenses</Text>
                  </View>
                  <Text style={[styles.quickStatValue, styles.expenseValue]}>
                    ₹{stats.expense.toLocaleString()}
                  </Text>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Net Balance Card */}
          <View style={styles.netBalanceCard}>
            <BlurView intensity={25} tint="dark" style={styles.netBalanceBlur}>
              <View style={styles.netBalanceContent}>
                <View style={styles.netBalanceLeft}>
                  <View style={styles.netBalanceIconContainer}>
                    <Wallet color={COLORS.primary} size={22} />
                  </View>
                  <View>
                    <Text style={styles.netBalanceLabel}>Net Balance</Text>
                    <Text style={styles.netBalanceHint}>Income - Expenses</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.netBalanceValue,
                    netBalance >= 0
                      ? styles.positiveBalance
                      : styles.negativeBalance,
                  ]}
                >
                  {netBalance >= 0 ? "+" : ""}₹
                  {Math.abs(netBalance).toLocaleString()}
                </Text>
              </View>

              {/* Mini bar */}
              <View style={styles.miniBarContainer}>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarIncome,
                      {
                        width:
                          stats.income > 0
                            ? `${
                                (stats.income /
                                  (stats.income + stats.expense)) *
                                100
                              }%`
                            : "50%",
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.miniBarExpense,
                      {
                        width:
                          stats.expense > 0
                            ? `${
                                (stats.expense /
                                  (stats.income + stats.expense)) *
                                100
                              }%`
                            : "50%",
                      },
                    ]}
                  />
                </View>
                <View style={styles.miniBarLabels}>
                  <View style={styles.miniBarLabelItem}>
                    <View style={[styles.miniBarDot, styles.incomeDot]} />
                    <Text style={styles.miniBarLabelText}>Income</Text>
                  </View>
                  <View style={styles.miniBarLabelItem}>
                    <View style={[styles.miniBarDot, styles.expenseDot]} />
                    <Text style={styles.miniBarLabelText}>Expenses</Text>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  scrollContent: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 4,
  },
  userName: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  sparkleContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 74, 0.2)",
  },

  // Balance Card
  balanceCard: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: "rgba(255, 107, 74, 0.15)",
  },
  balanceGradient: {
    padding: SPACING.l,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  savingsRateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 214, 143, 0.1)",
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  savingsRateText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.success,
  },
  balanceAmount: {
    fontSize: 52,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -2,
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  balanceSubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.l,
  },
  progressWrapper: {
    marginTop: SPACING.s,
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SPACING.xs,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  accentLine: {
    height: 2,
  },

  // Quick Stats
  quickStats: {
    flexDirection: "row",
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  quickStatCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  quickStatBlur: {
    overflow: "hidden",
  },
  quickStatContent: {
    padding: SPACING.m,
  },
  quickStatHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  incomeIcon: {
    backgroundColor: "rgba(0, 214, 143, 0.12)",
  },
  expenseIcon: {
    backgroundColor: "rgba(255, 71, 87, 0.12)",
  },
  quickStatLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  incomeValue: {
    color: COLORS.success,
  },
  expenseValue: {
    color: COLORS.text,
  },

  // Net Balance Card
  netBalanceCard: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  netBalanceBlur: {
    overflow: "hidden",
  },
  netBalanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.m,
    paddingBottom: SPACING.s,
  },
  netBalanceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.m,
  },
  netBalanceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 107, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  netBalanceLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  netBalanceHint: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  netBalanceValue: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  positiveBalance: {
    color: COLORS.success,
  },
  negativeBalance: {
    color: COLORS.danger,
  },

  // Mini Bar
  miniBarContainer: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.m,
  },
  miniBarTrack: {
    flexDirection: "row",
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: SPACING.s,
  },
  miniBarIncome: {
    backgroundColor: COLORS.success,
  },
  miniBarExpense: {
    backgroundColor: COLORS.danger,
  },
  miniBarLabels: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.l,
  },
  miniBarLabelItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniBarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  incomeDot: {
    backgroundColor: COLORS.success,
  },
  expenseDot: {
    backgroundColor: COLORS.danger,
  },
  miniBarLabelText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  bottomSpacer: {
    height: 120,
  },
});
