import React from "react";
import { View, StyleSheet, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { COLORS, GRADIENTS, BORDER_RADIUS, SPACING } from "../constants/Theme";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "success" | "danger" | "glass" | "dark" | "default";
  glow?: boolean;
  intensity?: "light" | "medium" | "strong";
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  glow = false,
  intensity = "medium",
}) => {
  const getGlowStyle = () => {
    if (!glow) return {};

    switch (variant) {
      case "primary":
        return {
          shadowColor: COLORS.primary,
          shadowOpacity: 0.3,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 4 },
        };
      case "success":
        return {
          shadowColor: COLORS.success,
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        };
      case "danger":
        return {
          shadowColor: COLORS.danger,
          shadowOpacity: 0.25,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
        };
      default:
        return {};
    }
  };

  // Primary gradient card
  if (variant === "primary") {
    return (
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, getGlowStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // Success gradient card
  if (variant === "success") {
    return (
      <LinearGradient
        colors={GRADIENTS.success as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, getGlowStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // Danger gradient card
  if (variant === "danger") {
    return (
      <LinearGradient
        colors={GRADIENTS.danger as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, getGlowStyle(), style]}
      >
        {children}
      </LinearGradient>
    );
  }

  // Dark surface card
  if (variant === "dark") {
    return (
      <View style={[styles.card, styles.darkCard, getGlowStyle(), style]}>
        {children}
      </View>
    );
  }

  // Glass morphism card (default)
  const blurIntensity =
    intensity === "light" ? 15 : intensity === "strong" ? 40 : 20;

  return (
    <View style={[styles.card, styles.glassOuter, getGlowStyle(), style]}>
      <BlurView intensity={blurIntensity} tint="dark" style={styles.blurContainer}>
        <View style={styles.glassContent}>{children}</View>
      </BlurView>
    </View>
  );
};

// Specialized Glass Container for navigation and search bars
export const GlassContainer: React.FC<{
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  borderRadius?: number;
}> = ({ children, style, intensity = 20, borderRadius = BORDER_RADIUS.l }) => {
  return (
    <View style={[styles.glassOuter, { borderRadius }, style]}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={[styles.blurContainer, { borderRadius }]}
      >
        <View style={[styles.glassContent, { borderRadius }]}>{children}</View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.l,
    marginBottom: SPACING.m,
    overflow: "hidden",
  },
  gradientCard: {
    padding: SPACING.m,
  },
  darkCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.m,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  glassOuter: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  blurContainer: {
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.l,
  },
  glassContent: {
    padding: SPACING.m,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
});
