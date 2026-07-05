import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
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
  Calendar,
  Activity,
  BarChart3,
  CalendarDays,
} from "lucide-react-native";
import { useExpenseStore } from "../stores/useExpenseStore";
import { useAuthStore } from "../stores/useAuthStore";
import {
  COLORS,
  GRADIENTS,
  SPACING,
  BORDER_RADIUS,
} from "../constants/Theme";

const { height } = Dimensions.get("window");

// Get greeting based on time
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

export default function DashboardScreen() {
  const { dashboardStats, fetchDashboardStats, loading } = useExpenseStore();
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

  const defaultStats = {
    income: 0,
    expense: 0,
    netBalance: 0,
    daily: { today: 0, yesterday: 0, percentageChange: 0 },
    monthlyExtremes: { highest: null, lowest: null },
    weeklyReport: [],
  };

  // Safely merge dashboardStats with defaultStats to avoid undefined properties
  const stats = {
    ...defaultStats,
    ...(dashboardStats || {}),
    daily: { ...defaultStats.daily, ...(dashboardStats?.daily || {}) },
    monthlyExtremes: { ...defaultStats.monthlyExtremes, ...(dashboardStats?.monthlyExtremes || {}) },
  };

  const greeting = getGreeting();

  // Helper to format dates
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  // Find max amount in weekly report for bar chart scaling
  const maxWeeklyAmount = Math.max(...(stats.weeklyReport || []).map(r => r.amount), 1); // fallback to 1 to avoid div by 0

  // Helper for safe formatting
  const formatAmount = (amount: any) => {
    return (Number(amount) || 0).toLocaleString();
  };

  if (loading && !dashboardStats) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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

          {/* Main Net Balance Card */}
          <View style={styles.balanceCard}>
            <LinearGradient
              colors={["rgba(255, 107, 74, 0.08)", "rgba(255, 107, 74, 0.02)"]}
              style={styles.balanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceHeader}>
                <View style={styles.balanceHeaderLeft}>
                  <Wallet color={COLORS.primary} size={20} style={{ marginRight: 8 }} />
                  <Text style={styles.balanceLabel}>Net Balance</Text>
                </View>
                <Text style={styles.balanceSubtext}>This Month</Text>
              </View>

              <Text style={styles.balanceAmount}>
                <Text style={styles.currencySymbol}>₹</Text>
                {formatAmount(stats.netBalance)}
              </Text>
            </LinearGradient>
            
            {/* Accent line */}
            <LinearGradient
              colors={[COLORS.primary, "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.accentLine}
            />
          </View>

          {/* Quick Stats Row: Income & Expense */}
          <View style={styles.row}>
            <View style={styles.halfCard}>
              <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBg, { backgroundColor: "rgba(0, 214, 143, 0.12)" }]}>
                      <ArrowDownRight color={COLORS.success} size={16} />
                    </View>
                    <Text style={styles.cardTitle}>Income</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: COLORS.success }]}>
                    ₹{formatAmount(stats.income)}
                  </Text>
                </View>
              </BlurView>
            </View>

            <View style={styles.halfCard}>
              <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={[styles.iconBg, { backgroundColor: "rgba(255, 71, 87, 0.12)" }]}>
                      <ArrowUpRight color={COLORS.danger} size={16} />
                    </View>
                    <Text style={styles.cardTitle}>Expenses</Text>
                  </View>
                  <Text style={[styles.cardValue, { color: COLORS.text }]}>
                    ₹{formatAmount(stats.expense)}
                  </Text>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Section: Daily Spending */}
          <Text style={styles.sectionTitle}>Daily Insights</Text>
          <View style={styles.analyticsCard}>
            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <View style={styles.analyticsContent}>
                <View style={styles.analyticsHeader}>
                  <View style={styles.analyticsHeaderLeft}>
                    <Activity color={COLORS.primary} size={20} />
                    <Text style={styles.analyticsTitle}>Today's Spend</Text>
                  </View>
                  
                  {/* Dynamic Trend Indicator */}
                  {stats.daily.percentageChange !== 0 && (
                    <View style={[
                      styles.trendBadge, 
                      { backgroundColor: stats.daily.percentageChange > 0 ? "rgba(255, 71, 87, 0.1)" : "rgba(0, 214, 143, 0.1)" }
                    ]}>
                      {stats.daily.percentageChange > 0 ? (
                        <TrendingUp color={COLORS.danger} size={14} />
                      ) : (
                        <TrendingDown color={COLORS.success} size={14} />
                      )}
                      <Text style={[
                        styles.trendText, 
                        { color: stats.daily.percentageChange > 0 ? COLORS.danger : COLORS.success }
                      ]}>
                        {Math.abs(stats.daily.percentageChange)}% vs yday
                      </Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.analyticsValue}>
                  ₹{formatAmount(stats.daily.today)}
                </Text>
              </View>
            </BlurView>
          </View>

          {/* Section: Monthly Extremes */}
          <View style={styles.row}>
            <View style={styles.halfCard}>
              <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitleMuted}>Highest Spend Day</Text>
                  <Text style={styles.cardValueSmall}>
                    ₹{formatAmount(stats.monthlyExtremes?.highest?.amount)}
                  </Text>
                  <View style={styles.dateRow}>
                    <CalendarDays color={COLORS.textMuted} size={12} />
                    <Text style={styles.dateText}>
                      {formatDate(stats.monthlyExtremes.highest?.date || "")}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>

            <View style={styles.halfCard}>
              <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitleMuted}>Lowest Spend Day</Text>
                  <Text style={styles.cardValueSmall}>
                    ₹{formatAmount(stats.monthlyExtremes?.lowest?.amount)}
                  </Text>
                  <View style={styles.dateRow}>
                    <CalendarDays color={COLORS.textMuted} size={12} />
                    <Text style={styles.dateText}>
                      {formatDate(stats.monthlyExtremes.lowest?.date || "")}
                    </Text>
                  </View>
                </View>
              </BlurView>
            </View>
          </View>

          {/* Section: Weekly Trend */}
          <Text style={styles.sectionTitle}>Weekly Trend</Text>
          <View style={styles.chartCard}>
            <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
              <View style={styles.chartContent}>
                <View style={styles.analyticsHeader}>
                  <View style={styles.analyticsHeaderLeft}>
                    <BarChart3 color={COLORS.primary} size={20} />
                    <Text style={styles.analyticsTitle}>Last 7 Days</Text>
                  </View>
                </View>
                
                {/* Simple Bar Chart */}
                <View style={styles.chartContainer}>
                  {(stats.weeklyReport || []).map((item, index) => {
                    const heightPercent = maxWeeklyAmount > 0 ? (item.amount / maxWeeklyAmount) * 100 : 0;
                    // Highlight today
                    const isToday = index === stats.weeklyReport.length - 1;
                    
                    return (
                      <View key={index} style={styles.barWrapper}>
                        {/* Tooltip for amount */}
                        {item.amount > 0 && (
                          <Text style={styles.barTooltip}>
                            {item.amount >= 1000 ? `${(item.amount / 1000).toFixed(1)}k` : item.amount}
                          </Text>
                        )}
                        <View style={styles.barTrack}>
                          <LinearGradient
                            colors={isToday ? [COLORS.primary, COLORS.secondary] : ["rgba(255,255,255,0.2)", "rgba(255,255,255,0.05)"]}
                            style={[styles.barFill, { height: `${Math.max(heightPercent, 2)}%` }]} // min height 2%
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                          />
                        </View>
                        <Text style={[styles.barLabel, isToday && styles.barLabelToday]}>
                          {item.day}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </BlurView>
          </View>

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

  // Main Balance Card
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
    marginBottom: SPACING.s,
  },
  balanceHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  balanceSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: -1.5,
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  accentLine: {
    height: 2,
  },

  // Grid/Rows
  row: {
    flexDirection: "row",
    gap: SPACING.m,
    marginBottom: SPACING.l,
  },
  halfCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  blurContainer: {
    overflow: "hidden",
  },
  cardContent: {
    padding: SPACING.m,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
    marginBottom: SPACING.s,
  },
  iconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  cardTitleMuted: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  cardValueSmall: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // Analytics Cards
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SPACING.m,
    marginTop: SPACING.s,
  },
  analyticsCard: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  analyticsContent: {
    padding: SPACING.l,
  },
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  analyticsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.s,
  },
  analyticsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  analyticsValue: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -1,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Chart
  chartCard: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    marginBottom: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  chartContent: {
    padding: SPACING.l,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    marginTop: SPACING.m,
    paddingTop: 16, // Space for tooltip
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  barTooltip: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 24,
    height: 100, // Fixed track height
    backgroundColor: "rgba(255,255,255,0.02)",
    borderRadius: 6,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: SPACING.s,
    fontWeight: "500",
  },
  barLabelToday: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  bottomSpacer: {
    height: 120,
  },
});
