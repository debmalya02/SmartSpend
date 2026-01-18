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
import { Phone, ArrowRight } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../constants/Theme';

interface PhoneInputScreenProps {
    navigation: any;
}

export default function PhoneInputScreen({ navigation }: PhoneInputScreenProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const { sendOTP, isLoading } = useAuthStore();

    const formatPhoneNumber = (text: string) => {
        // Remove non-numeric characters
        const cleaned = text.replace(/\D/g, '');
        return cleaned.slice(0, 10);
    };

    const handleSendOTP = async () => {
        setError('');
        
        if (phoneNumber.length !== 10) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }

        const fullPhone = `+91${phoneNumber}`;
        const result = await sendOTP(fullPhone);

        if (result.success) {
            navigation.navigate('OTPVerification', { phone: fullPhone });
        } else {
            setError(result.error || 'Failed to send OTP. Please try again.');
        }
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
                            <Phone color="#fff" size={32} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>Welcome to SmartSpend</Text>
                    <Text style={styles.subtitle}>
                        Enter your phone number to get started
                    </Text>
                </View>

                {/* Phone Input */}
                <View style={styles.inputContainer}>
                    <View style={styles.countryCode}>
                        <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone number"
                        placeholderTextColor={COLORS.textMuted}
                        value={phoneNumber}
                        onChangeText={(text) => setPhoneNumber(formatPhoneNumber(text))}
                        keyboardType="phone-pad"
                        maxLength={10}
                        autoFocus
                    />
                </View>

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {/* Send OTP Button */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleSendOTP}
                    disabled={isLoading || phoneNumber.length !== 10}
                >
                    <LinearGradient
                        colors={phoneNumber.length === 10 ? [COLORS.primary, '#FF8B6B'] : ['#333', '#444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>Send OTP</Text>
                                <ArrowRight color="#fff" size={20} />
                            </>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Footer */}
                <Text style={styles.footerText}>
                    We'll send you a one-time password to verify your number
                </Text>
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
        flexDirection: 'row',
        backgroundColor: COLORS.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
        overflow: 'hidden',
    },
    countryCode: {
        paddingHorizontal: 16,
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 107, 74, 0.1)',
        borderRightWidth: 1,
        borderRightColor: COLORS.border,
    },
    countryCodeText: {
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '600',
    },
    input: {
        flex: 1,
        padding: 18,
        fontSize: 18,
        color: COLORS.text,
        letterSpacing: 2,
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
    footerText: {
        color: COLORS.textMuted,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 24,
    },
});
