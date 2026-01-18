import React, { useState, useRef, useEffect } from 'react';
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
import { Shield, ArrowLeft, RefreshCw } from 'lucide-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../constants/Theme';

interface OTPVerificationScreenProps {
    navigation: any;
    route: {
        params: {
            phone: string;
        };
    };
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OTPVerificationScreen({ navigation, route }: OTPVerificationScreenProps) {
    const { phone } = route.params;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
    const inputRefs = useRef<TextInput[]>([]);
    const { verifyOTP, sendOTP, isLoading } = useAuthStore();

    useEffect(() => {
        const timer = setInterval(() => {
            setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        if (value.length > 1) {
            // Handle paste
            const pastedOtp = value.slice(0, OTP_LENGTH).split('');
            const newOtp = [...otp];
            pastedOtp.forEach((digit, i) => {
                if (index + i < OTP_LENGTH) {
                    newOtp[index + i] = digit;
                }
            });
            setOtp(newOtp);
            
            const lastIndex = Math.min(index + pastedOtp.length, OTP_LENGTH - 1);
            inputRefs.current[lastIndex]?.focus();
        } else {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);

            // Auto-advance to next input
            if (value && index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
        setError('');
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');
        
        if (otpString.length !== OTP_LENGTH) {
            setError('Please enter the complete OTP');
            return;
        }

        const result = await verifyOTP(phone, otpString);

        if (!result.success) {
            setError(result.error || 'Invalid OTP. Please try again.');
            setOtp(Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        }
        // Navigation is handled by App.tsx based on auth state
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;
        
        setError('');
        const result = await sendOTP(phone);
        
        if (result.success) {
            setResendTimer(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(''));
        } else {
            setError(result.error || 'Failed to resend OTP');
        }
    };

    const isOtpComplete = otp.every((digit) => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, '#0a0a0f']}
                style={StyleSheet.absoluteFill}
            />
            
            {/* Back Button */}
            <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <ArrowLeft color={COLORS.text} size={24} />
            </TouchableOpacity>

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
                            <Shield color="#fff" size={32} />
                        </LinearGradient>
                    </View>
                    <Text style={styles.title}>Verify OTP</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit code sent to{'\n'}
                        <Text style={styles.phoneText}>{phone}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                                if (ref) inputRefs.current[index] = ref;
                            }}
                            style={[
                                styles.otpInput,
                                digit && styles.otpInputFilled,
                                error && styles.otpInputError,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={index === 0 ? OTP_LENGTH : 1}
                            selectTextOnFocus
                            autoFocus={index === 0}
                        />
                    ))}
                </View>

                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}

                {/* Verify Button */}
                <TouchableOpacity
                    style={[styles.button, (!isOtpComplete || isLoading) && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={!isOtpComplete || isLoading}
                >
                    <LinearGradient
                        colors={isOtpComplete ? [COLORS.primary, '#FF8B6B'] : ['#333', '#444']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.buttonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Verify & Continue</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>

                {/* Resend OTP */}
                <TouchableOpacity 
                    style={styles.resendContainer}
                    onPress={handleResendOTP}
                    disabled={resendTimer > 0}
                >
                    <RefreshCw 
                        color={resendTimer > 0 ? COLORS.textMuted : COLORS.primary} 
                        size={16} 
                    />
                    <Text style={[
                        styles.resendText,
                        resendTimer > 0 && styles.resendTextDisabled
                    ]}>
                        {resendTimer > 0 
                            ? `Resend OTP in ${resendTimer}s` 
                            : 'Resend OTP'}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
        padding: 8,
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
        lineHeight: 24,
    },
    phoneText: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
    },
    otpInput: {
        width: 48,
        height: 56,
        borderRadius: 12,
        backgroundColor: COLORS.card,
        borderWidth: 1,
        borderColor: COLORS.border,
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.text,
        textAlign: 'center',
    },
    otpInputFilled: {
        borderColor: COLORS.primary,
        backgroundColor: 'rgba(255, 107, 74, 0.1)',
    },
    otpInputError: {
        borderColor: '#FF6B6B',
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
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 8,
    },
    resendText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '500',
    },
    resendTextDisabled: {
        color: COLORS.textMuted,
    },
});
