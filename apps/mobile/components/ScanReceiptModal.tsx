
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert, TextInput, ScrollView, Animated, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Image as ImageIcon, X, Check, Upload, Loader2, Calendar, DollarSign, Tag, Store } from 'lucide-react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, GRADIENTS } from '../constants/Theme';
import { useExpenseStore } from '../stores/useExpenseStore';
import { uploadToSupabase } from '../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface ScanReceiptModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function ScanReceiptModal({ visible, onClose }: ScanReceiptModalProps) {
    const [image, setImage] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'scanning' | 'review'>('idle');
    const [scannedData, setScannedData] = useState<any>(null);
    const { scanReceipt, addTransaction } = useExpenseStore();

    const pulseAnim = useRef(new Animated.Value(0.6)).current;

    useEffect(() => {
        if (status === 'scanning' || status === 'uploading') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [status]);

    const pickImage = async (useCamera: boolean) => {
        try {
            let result;
            if (useCamera) {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert("Permission required", "Camera access is needed.");
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.5,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 0.5,
                });
            }

            if (!result.canceled) {
                handleProcessImage(result.assets[0].uri);
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to pick image");
        }
    };

    const handleProcessImage = async (uri: string) => {
        setImage(uri);
        setStatus('uploading');

        try {
            const publicUrl = await uploadToSupabase(uri);

            setStatus('scanning');
            const data = await scanReceipt(publicUrl);

            setScannedData({ ...data, receiptUrl: publicUrl });
            setStatus('review');
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to process receipt. Please try again.");
            setStatus('idle');
            setImage(null);
        }
    };

    const handleConfirm = async () => {
        try {
            await addTransaction(scannedData);
            Alert.alert("Success", "Transaction added successfully!");
            handleClose();
        } catch (e) {
            Alert.alert("Error", "Failed to save transaction");
        }
    };

    const handleClose = () => {
        setImage(null);
        setStatus('idle');
        setScannedData(null);
        onClose();
    };

    const renderContent = () => {
        if (status === 'idle') {
            return (
                <View style={styles.actionContainer}>
                    <Text style={styles.title}>Scan Receipt</Text>
                    <Text style={styles.subtitle}>Take a photo or upload to automatically extracting details.</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
                            <LinearGradient colors={GRADIENTS.primary as [string, string]} style={styles.gradientButton}>
                                <Camera color="white" size={32} />
                                <Text style={styles.buttonText}>Camera</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(false)}>
                            <View style={styles.secondaryButton}>
                                <ImageIcon color={COLORS.primary} size={32} />
                                <Text style={[styles.buttonText, { color: COLORS.primary }]}>Gallery</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (status === 'uploading' || status === 'scanning') {
            return (
                <View style={styles.loadingContainer}>
                    <Animated.View style={{ opacity: pulseAnim }}>
                        <Image source={{ uri: image! }} style={styles.previewImageSmall} />
                    </Animated.View>
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
                    <Text style={styles.loadingText}>
                        {status === 'uploading' ? 'Uploading...' : 'AI is reading receipt...'}
                    </Text>
                </View>
            );
        }

        if (status === 'review' && scannedData) {
            return (
                <ScrollView style={styles.formContainer}>
                    <Text style={styles.title}>Confirm Entry</Text>
                    <Image source={{ uri: image! }} style={styles.previewImageParams} />

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Merchant</Text>
                        <View style={styles.inputWrapper}>
                            <Store size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.input}
                                value={scannedData.merchant}
                                onChangeText={(t) => setScannedData({ ...scannedData, merchant: t })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Amount</Text>
                        <View style={styles.inputWrapper}>
                            <DollarSign size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.input}
                                value={String(scannedData.amount)}
                                keyboardType="numeric"
                                onChangeText={(t) => setScannedData({ ...scannedData, amount: parseFloat(t) || 0 })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date</Text>
                        <View style={styles.inputWrapper}>
                            <Calendar size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.input}
                                value={scannedData.date}
                                onChangeText={(t) => setScannedData({ ...scannedData, date: t })}
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.inputWrapper}>
                            <Tag size={20} color={COLORS.textSecondary} />
                            <TextInput
                                style={styles.input}
                                value={scannedData.category}
                                onChangeText={(t) => setScannedData({ ...scannedData, category: t })}
                            />
                        </View>
                    </View>

                    <TouchableOpacity onPress={handleConfirm}>
                        <LinearGradient colors={GRADIENTS.success as [string, string]} style={styles.confirmButton}>
                            <Check color="white" size={24} style={{ marginRight: 8 }} />
                            <Text style={styles.confirmText}>Save Transaction</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                </ScrollView>
            );
        }
        return null;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <X color={COLORS.textSecondary} size={24} />
                    </TouchableOpacity>
                    {renderContent()}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderTopLeftRadius: BORDER_RADIUS.l,
        borderTopRightRadius: BORDER_RADIUS.l,
        minHeight: '60%',
        maxHeight: '90%',
        padding: SPACING.l,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: SPACING.s,
        padding: SPACING.s,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SPACING.s,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING.xl,
    },
    actionContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    actionButton: {
        flex: 1,
        marginHorizontal: SPACING.s,
        height: 120,
    },
    gradientButton: {
        flex: 1,
        borderRadius: BORDER_RADIUS.m,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    secondaryButton: {
        flex: 1,
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.m,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.primary,
    },
    buttonText: {
        marginTop: SPACING.s,
        fontWeight: '600',
        fontSize: 16,
        color: 'white',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: SPACING.xl,
    },
    previewImageSmall: {
        width: 200,
        height: 300,
        borderRadius: BORDER_RADIUS.m,
        resizeMode: 'contain',
        backgroundColor: '#eee',
    },
    loadingText: {
        marginTop: SPACING.m,
        fontSize: 18,
        color: COLORS.primary,
        fontWeight: '600',
    },
    formContainer: {
        flex: 1,
    },
    previewImageParams: {
        width: '100%',
        height: 150,
        borderRadius: BORDER_RADIUS.m,
        resizeMode: 'cover',
        marginBottom: SPACING.m,
    },
    inputGroup: {
        marginBottom: SPACING.m,
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: SPACING.s,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: BORDER_RADIUS.s,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.s,
        height: 50,
    },
    input: {
        flex: 1,
        marginLeft: SPACING.s,
        fontSize: 16,
        color: COLORS.text,
    },
    confirmButton: {
        flexDirection: 'row',
        height: 56,
        borderRadius: BORDER_RADIUS.m,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING.m,
        marginBottom: SPACING.xl,
        ...SHADOWS.medium,
    },
    confirmText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
