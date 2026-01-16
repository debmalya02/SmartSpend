import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Image as ImageIcon,
  X,
  Check,
  Calendar,
  DollarSign,
  Tag,
  Store,
  Scan,
} from "lucide-react-native";
import { COLORS, SPACING, BORDER_RADIUS } from "../constants/Theme";
import { useExpenseStore } from "../stores/useExpenseStore";
import { uploadToSupabase } from "../lib/supabase";

const { width } = Dimensions.get("window");

interface ScanReceiptModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ScanReceiptModal({
  visible,
  onClose,
}: ScanReceiptModalProps) {
  const [image, setImage] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "scanning" | "review"
  >("idle");
  const [scannedData, setScannedData] = useState<any>(null);
  const { scanReceipt, addTransaction, loading } = useExpenseStore();

  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (status === "scanning" || status === "uploading") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
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
          quality: 0.25,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.25,
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
    setStatus("uploading");

    try {
      const publicUrl = await uploadToSupabase(uri);

      setStatus("scanning");
      const data = await scanReceipt(publicUrl);

      setScannedData({ ...data, receiptUrl: publicUrl });
      setStatus("review");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to process receipt. Please try again.");
      setStatus("idle");
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
    setStatus("idle");
    setScannedData(null);
    onClose();
  };

  const renderContent = () => {
    if (status === "idle") {
      return (
        <View style={styles.actionContainer}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.iconGradient}
            >
              <Scan color={COLORS.white} size={28} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Scan Receipt</Text>
          <Text style={styles.subtitle}>
            Take a photo or upload to extract details automatically
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => pickImage(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientButton}
              >
                <View style={styles.buttonIconBg}>
                  <Camera color={COLORS.white} size={24} />
                </View>
                <Text style={styles.buttonText}>Camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => pickImage(false)}
              activeOpacity={0.8}
            >
              <View style={styles.secondaryButton}>
                <View style={[styles.buttonIconBg, styles.secondaryIconBg]}>
                  <ImageIcon color={COLORS.primary} size={24} />
                </View>
                <Text style={styles.secondaryButtonText}>Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (status === "uploading" || status === "scanning") {
      return (
        <View style={styles.loadingContainer}>
          <View style={styles.scanningWrapper}>
            <Animated.Image
              source={{ uri: image! }}
              style={[styles.previewImageSmall, { opacity: pulseAnim }]}
            />
            <View style={styles.scanLine}>
              <LinearGradient
                colors={["transparent", COLORS.primary, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLineGradient}
              />
            </View>
          </View>
          <View style={styles.loadingInfo}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>
              {status === "uploading"
                ? "Uploading image..."
                : "AI is reading receipt..."}
            </Text>
            <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
          </View>
        </View>
      );
    }

    if (status === "review" && scannedData) {
      return (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.formContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.reviewTitle}>Confirm Entry</Text>
            <Text style={styles.reviewSubtitle}>
              Review and edit the extracted data
            </Text>

            <View style={styles.previewWrapper}>
              <Image source={{ uri: image! }} style={styles.previewImageParams} />
              <View style={styles.previewOverlay}>
                <View style={styles.successBadge}>
                  <Check color={COLORS.white} size={14} />
                  <Text style={styles.successText}>Scanned</Text>
                </View>
              </View>
            </View>

            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>MERCHANT</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Store size={16} color={COLORS.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={scannedData.merchant}
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={(t) =>
                      setScannedData({ ...scannedData, merchant: t })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>AMOUNT</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <DollarSign size={16} color={COLORS.primary} />
                  </View>
                  <Text style={styles.currencyPrefix}>₹</Text>
                  <TextInput
                    style={[styles.input, styles.amountInput]}
                    value={String(scannedData.amount)}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={(t) =>
                      setScannedData({
                        ...scannedData,
                        amount: parseFloat(t) || 0,
                      })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>DATE</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Calendar size={16} color={COLORS.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={scannedData.date}
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={(t) =>
                      setScannedData({ ...scannedData, date: t })
                    }
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.label}>CATEGORY</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputIcon}>
                    <Tag size={16} color={COLORS.primary} />
                  </View>
                  <TextInput
                    style={styles.input}
                    value={scannedData.category}
                    placeholderTextColor={COLORS.textMuted}
                    onChangeText={(t) =>
                      setScannedData({ ...scannedData, category: t })
                    }
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.confirmWrapper}>
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmButton}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Check color="white" size={20} style={{ marginRight: 8 }} />
                    <Text style={styles.confirmText}>Save Transaction</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <BlurView intensity={30} tint="dark" style={styles.blurOverlay} />
        <View style={styles.modalWrapper}>
          <View style={styles.modalContent}>
            {/* Smooth ambient glow */}
            <LinearGradient
              colors={[
                "rgba(255, 107, 74, 0.18)",
                "rgba(255, 115, 85, 0.1)",
                "rgba(255, 130, 100, 0.04)",
                "transparent",
              ]}
              locations={[0, 0.2, 0.4, 0.7]}
              style={styles.ambientGlow}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 0.6 }}
            />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.handleBar} />
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X color={COLORS.textSecondary} size={20} />
              </TouchableOpacity>
            </View>

            {renderContent()}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalWrapper: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    minHeight: "60%",
    maxHeight: "90%",
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.l,
    paddingTop: SPACING.m,
  },
  ambientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },

  // Header
  header: {
    alignItems: "center",
    marginBottom: SPACING.m,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.surfaceLight,
    marginBottom: SPACING.m,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },

  // Action Container (Idle state)
  actionContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingBottom: SPACING.xl,
  },
  iconContainer: {
    marginBottom: SPACING.l,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: SPACING.s,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.l,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: SPACING.m,
  },
  actionButton: {
    flex: 1,
    height: 120,
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  buttonIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.s,
  },
  secondaryIconBg: {
    backgroundColor: "rgba(255, 107, 74, 0.12)",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },

  // Loading State
  loadingContainer: {
    alignItems: "center",
    padding: SPACING.xl,
    flex: 1,
    justifyContent: "center",
  },
  scanningWrapper: {
    position: "relative",
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
  },
  previewImageSmall: {
    width: 160,
    height: 220,
    borderRadius: BORDER_RADIUS.l,
    backgroundColor: COLORS.surface,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    top: "50%",
  },
  scanLineGradient: {
    flex: 1,
    borderRadius: 1,
  },
  loadingInfo: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: SPACING.m,
  },
  loadingSubtext: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },

  // Review State
  formContainer: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.l,
  },
  previewWrapper: {
    position: "relative",
    marginBottom: SPACING.l,
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
  },
  previewImageParams: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.surface,
  },
  previewOverlay: {
    position: "absolute",
    top: SPACING.s,
    right: SPACING.s,
  },
  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.s,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.round,
    gap: 4,
  },
  successText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: "600",
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.l,
    padding: SPACING.l,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  inputGroup: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: SPACING.s,
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.s,
    height: 48,
  },
  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255, 107, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.s,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    height: "100%",
  },
  amountInput: {
    fontSize: 18,
    fontWeight: "600",
  },

  // Confirm Button
  confirmWrapper: {
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
  },
  confirmButton: {
    flexDirection: "row",
    height: 52,
    borderRadius: BORDER_RADIUS.l,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
  },
});
