import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS, SPACING } from '../constants/Theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'primary' | 'success' | 'danger' | 'glass' | 'dark' | 'default';
    glow?: boolean;
    intensity?: 'light' | 'medium' | 'strong';
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default',
    glow = false,
    intensity = 'medium',
}) => {
    const getGlowStyle = () => {
        if (!glow) return {};
        
        switch (variant) {
            case 'primary':
                return {
                    shadowColor: COLORS.primary,
                    shadowOpacity: 0.4,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 0 },
                };
            case 'success':
                return {
                    shadowColor: COLORS.success,
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 0 },
                };
            case 'danger':
                return {
                    shadowColor: COLORS.danger,
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    shadowOffset: { width: 0, height: 0 },
                };
            default:
                return SHADOWS.glow;
        }
    };

    // Primary gradient card with warm glow
    if (variant === 'primary') {
        return (
            <LinearGradient
                colors={GRADIENTS.primary as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, styles.gradientCard, getGlowStyle(), style]}
            >
                <View style={styles.innerGlow} />
                {children}
            </LinearGradient>
        );
    }

    // Success gradient card
    if (variant === 'success') {
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
    if (variant === 'danger') {
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
    if (variant === 'dark') {
        return (
            <View style={[styles.card, styles.darkCard, getGlowStyle(), style]}>
                <LinearGradient
                    colors={GRADIENTS.dark as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFillObject}
                />
                {children}
            </View>
        );
    }

    // Glass morphism card (default)
    const blurIntensity = intensity === 'light' ? 20 : intensity === 'strong' ? 60 : 40;
    
    return (
        <View style={[styles.card, styles.glassOuter, getGlowStyle(), style]}>
            <BlurView intensity={blurIntensity} tint="dark" style={styles.blurContainer}>
                <LinearGradient
                    colors={variant === 'glass' ? GRADIENTS.glassWarm as [string, string] : GRADIENTS.glass as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.glassGradient}
                >
                    {children}
                </LinearGradient>
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
}> = ({ children, style, intensity = 40, borderRadius = BORDER_RADIUS.l }) => {
    return (
        <View style={[styles.glassOuter, { borderRadius }, style]}>
            <BlurView intensity={intensity} tint="dark" style={[styles.blurContainer, { borderRadius }]}>
                <LinearGradient
                    colors={GRADIENTS.glass as [string, string]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.glassGradient, { borderRadius }]}
                >
                    {children}
                </LinearGradient>
            </BlurView>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: BORDER_RADIUS.l,
        marginBottom: SPACING.m,
        overflow: 'hidden',
    },
    gradientCard: {
        padding: SPACING.m,
        ...SHADOWS.card,
    },
    darkCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.m,
        ...SHADOWS.card,
        overflow: 'hidden',
    },
    glassOuter: {
        borderRadius: BORDER_RADIUS.l,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.glassBorder,
        ...SHADOWS.card,
    },
    blurContainer: {
        overflow: 'hidden',
        borderRadius: BORDER_RADIUS.l,
    },
    glassGradient: {
        padding: SPACING.m,
    },
    innerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: BORDER_RADIUS.l,
        borderTopRightRadius: BORDER_RADIUS.l,
    },
});
