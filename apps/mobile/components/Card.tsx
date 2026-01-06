import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS, SPACING } from '../constants/Theme';

interface CardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'primary' | 'success' | 'danger' | 'dark' | 'default';
    gradient?: boolean; // Option to toggle gradient off if needed
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    variant = 'default',
    gradient = false
}) => {
    const gradientColors = GRADIENTS[variant] || GRADIENTS.card;

    // If specific variant is requested (other than default) or gradient prop is true, use LinearGradient
    // 'default' variant usually maps to a solid white card unless we really want a subtle white gradient.
    // Let's make 'primary', 'success', 'danger', 'dark' always use gradients.
    // 'default' can be solid or subtle gradient. Let's stick to solid for default to keep it clean, 
    // but allow override via `gradient` prop.

    const shouldUseGradient = gradient || variant !== 'default';

    if (shouldUseGradient) {
        return (
            <LinearGradient
                colors={gradientColors as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.card, style]}
            >
                {children}
            </LinearGradient>
        );
    }

    return (
        <View style={[styles.card, styles.solidCard, style]}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        padding: SPACING.m,
        borderRadius: BORDER_RADIUS.l,
        marginBottom: SPACING.m,
        ...SHADOWS.medium,
    },
    solidCard: {
        backgroundColor: COLORS.card,
    },
});
