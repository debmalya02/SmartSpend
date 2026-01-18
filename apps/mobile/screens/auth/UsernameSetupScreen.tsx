import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../constants/Theme';

export default function UsernameSetupScreen() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { setUsername, isLoading } = useAuthStore();

    const handleContinue = async () => {
        setError('');
        
        if (name.trim().length < 2) {
            setError('Please enter a valid name (at least 2 characters)');
            return;
        }

        const result = await setUsername(name.trim());

        if (!result.success) {
            setError(result.error || 'Failed to save name. Please try again.');
        }
        // Navigation is handled by App.tsx based on needsOnboarding state
    };

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, '#0a0a0f']}
                style={StyleSheet.absoluteFill}
            />

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <LinearGradient
                            colors={[COLORS.primary, '#FF8B6B']}
                            style={styles.iconGradient}
                        >
                            <User color="#fff" size={32} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>What's your name?</Text>
                    <Text style={styles.subtitle}>
                        Let us personalize your experience
                    </Text>
                </View>

                {/* Name Input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        placeholderTextColor={COLORS.textMuted}
                        value={name}
                        onChangeText={setName}
                        autoFocus
                        autoCapitalize="words"
                        returnKeyType="done"
                        onSubmitEditing={handleContinue}
                    />
                </View>

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {/* Continue Button */}
                <TouchableOpacity
                    style={[styles.button, (isLoading || !name.trim()) && styles.buttonDisabled]}
                    onPress={handleContinue}
                    disabled={isLoading || !name.trim()}
                >
                    <LinearGradient
                        colors={name.trim() ? [COLORS.primary, '#FF8B6B'] : ['#333', '#444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Sparkles color="#fff" size={20} />
                                <Text style={styles.buttonText}>Let's Go!</Text>
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Welcome message */}
                <View style={styles.welcomeContainer}>
                    <Text style={styles.welcomeText}>
                        🎉 Your account is ready!{'\n'}
                        Just one more step to get started.
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconGradient: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    inputContainer: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    input: {
        padding: 18,
        fontSize: 18,
        color: COLORS.text,
        textAlign: 'center',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 14,
        marginBottom: 16,
        textAlign: 'center',
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 8,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    welcomeContainer: {
        marginTop: 32,
        padding: 16,
        backgroundColor: 'rgba(255, 107, 74, 0.1)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 74, 0.2)',
    },
    welcomeText: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
});
