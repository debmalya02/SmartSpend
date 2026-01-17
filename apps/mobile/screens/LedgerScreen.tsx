import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import {
  ScanLine,
  Trash2,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Zap,
  Film,
  TrendingUp,
  Receipt,
} from "lucide-react-native";
import { useExpenseStore } from "../stores/useExpenseStore";
import { VibeInput } from "../components/VibeInput";
import ScanReceiptModal from "../components/ScanReceiptModal";
import { VoiceInputButton } from "../components/VoiceInputButton";
import {
  COLORS,
  GRADIENTS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} from "../constants/Theme";

const { width, height } = Dimensions.get("window");

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: any } = {
    Food: Coffee,
    Shopping: ShoppingBag,
    Transport: Car,
    Housing: Home,
    Utilities: Zap,
    Entertainment: Film,
    Income: TrendingUp,
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
    Alert.alert("Delete Transaction", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction(id),
      },
    ]);
  };

  const renderTransaction = ({ item }: { item: any }) => {
    const CategoryIcon = getCategoryIcon(item.category?.name || "Shopping");
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
              <CategoryIcon
                color={isIncome ? COLORS.success : COLORS.primary}
                size={20}
              />
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <Text style={styles.merchant} numberOfLines={1}>
                {item.merchant || "Unknown Merchant"}
              </Text>
              <View style={styles.metaRow}>
                <Text style={styles.categoryText}>
                  {item.category?.name || "Uncategorized"}
                </Text>
                <View style={styles.dot} />
                <Text style={styles.date}>
                  {new Date(item.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
            </View>

            {/* Amount & Actions */}
            <View style={styles.rightSection}>
              <Text
                style={[
                  styles.amount,
                  isIncome ? styles.incomeAmount : styles.expenseAmount,
                ]}
              >
                {isIncome ? "+" : "-"}₹{Math.abs(item.amount).toLocaleString()}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item.id)}
                style={styles.deleteButton}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
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
            <Text style={styles.title}>Ledger</Text>
            <Text style={styles.subtitle}>Your transactions</Text>
          </View>
          <View style={styles.headerIcon}>
            <Receipt color={COLORS.primary} size={22} />
          </View>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <VibeInput />
          </View>
          <VoiceInputButton />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => setShowScan(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scanButtonGradient}
            >
              <ScanLine color={COLORS.white} size={22} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScanReceiptModal
          visible={showScan}
          onClose={() => setShowScan(false)}
        />

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
                <ShoppingBag color={COLORS.textMuted} size={40} />
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
    paddingBottom: SPACING.s,
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

  // Input Section
  inputSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    gap: SPACING.m,
  },
  inputWrapper: {
    flex: 1,
  },
  scanButton: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
  },
  scanButtonGradient: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.l,
    paddingBottom: 120,
  },

  // Card
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
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.m,
  },
  detailsContainer: {
    flex: 1,
  },
  merchant: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: 6,
  },
  date: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  rightSection: {
    alignItems: "flex-end",
    marginLeft: SPACING.s,
  },
  amount: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  incomeAmount: {
    color: COLORS.success,
  },
  expenseAmount: {
    color: COLORS.text,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "rgba(255, 71, 87, 0.1)",
  },

  // Empty State
  emptyState: {
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
});
