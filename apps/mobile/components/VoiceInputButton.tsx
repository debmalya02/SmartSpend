import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Mic, MicOff, X, Check, Loader, CheckCircle, AlertCircle } from "lucide-react-native";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useExpenseStore } from "../stores/useExpenseStore";
import { COLORS, BORDER_RADIUS, SPACING } from "../constants/Theme";

interface VoiceInputButtonProps {
  onSuccess?: (count: number) => void;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onSuccess,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'error' | 'info'; title: string; message: string }>(
    { visible: false, type: 'success', title: '', message: '' }
  );
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const isCancellingRef = useRef(false);
  const { addMultipleExpensesViaVoice, fetchExpenses } = useExpenseStore();

  // Pulse animation for recording indicator
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  // Toast animation helper
  const showToast = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setToast({ visible: true, type, title, message });
    toastAnim.setValue(0);
    Animated.spring(toastAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();

    // Auto-hide after 3 seconds
    setTimeout(() => {
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setToast({ visible: false, type: 'success', title: '', message: '' });
      });
    }, 3000);
  };

  // Speech recognition event listeners
  useSpeechRecognitionEvent("start", () => {
    console.log("Speech recognition started");
    setIsRecording(true);
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("Speech recognition ended");
    setIsRecording(false);
  });

  useSpeechRecognitionEvent("result", (event: any) => {
    console.log("Speech recognition result:", JSON.stringify(event));
    try {
      // Based on logs: event.results is an array of { transcript, confidence, segments }
      if (event.results && event.results.length > 0) {
        // Get the last result's transcript (most complete)
        const lastResult = event.results[event.results.length - 1];
        if (lastResult && lastResult.transcript) {
          setTranscript(lastResult.transcript);
        }
      }
    } catch (err) {
      console.error("Error parsing speech result:", err);
    }
  });

  useSpeechRecognitionEvent("error", (event: any) => {
    const errorCode = event.error || event;
    console.log("Speech recognition error:", errorCode);
    setIsRecording(false);
    
    // Silently ignore 'no-speech' error when cancelling or if modal is closing
    if (errorCode === "no-speech" || isCancellingRef.current) {
      isCancellingRef.current = false;
      return;
    }
    
    Alert.alert("Error", `Speech recognition failed: ${errorCode}`);
  });

  const requestPermissions = async (): Promise<boolean> => {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      Alert.alert(
        "Permission Required",
        "Please grant microphone and speech recognition permissions to use voice input.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setTranscript("");
    setShowModal(true);

    try {
      ExpoSpeechRecognitionModule.start({
        lang: "en-IN",
        interimResults: true,
        maxAlternatives: 1,
        continuous: true,
      });
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      Alert.alert("Error", "Failed to start speech recognition.");
    }
  };

  const stopRecording = () => {
    ExpoSpeechRecognitionModule.stop();
    setIsRecording(false);
  };

  const handleCancel = () => {
    isCancellingRef.current = true;
    stopRecording();
    setShowModal(false);
    setTranscript("");
    setProcessingStatus("");
  };

  const handleSubmit = async () => {
    if (!transcript.trim()) {
      Alert.alert("No Input", "Please speak your expenses first.");
      return;
    }

    // Auto-stop recording if still active
    if (isRecording) {
      stopRecording();
    }

    setIsProcessing(true);
    setProcessingStatus("Analyzing your expenses...");

    try {
      setProcessingStatus("AI is processing...");
      const result = await addMultipleExpensesViaVoice(transcript);
      
      setProcessingStatus("Saving transactions...");
      await fetchExpenses();
      
      setShowModal(false);
      setTranscript("");
      setProcessingStatus("");

      if (result.addedCount > 0) {
        onSuccess?.(result.addedCount);
        showToast(
          'success',
          'Success! 🎉',
          `Added ${result.addedCount} transaction${result.addedCount > 1 ? "s" : ""} to your ledger.`
        );
      } else {
        showToast(
          'info',
          'No Transactions Found',
          'Could not identify any expenses or income. Try again with more details.'
        );
      }
    } catch (error) {
      console.error("Failed to process voice input:", error);
      showToast('error', 'Error', 'Failed to process your voice input. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus("");
    }
  };

  return (
    <>
      {/* Voice Input Button */}
      <TouchableOpacity
        style={styles.voiceButton}
        onPress={startRecording}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={["#8B5CF6", "#A855F7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.voiceButtonGradient}
        >
          <Mic color={COLORS.white} size={22} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Recording Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={40} tint="dark" style={styles.modalBlur}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {isRecording ? "Listening..." : "Voice Input"}
                </Text>
                <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                  <X color={COLORS.textMuted} size={20} />
                </TouchableOpacity>
              </View>

              {/* Recording Indicator */}
              <View style={styles.recordingSection}>
                {isRecording ? (
                  <Animated.View
                    style={[
                      styles.recordingIndicator,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <TouchableOpacity onPress={stopRecording} activeOpacity={0.8}>
                      <LinearGradient
                        colors={["#EF4444", "#DC2626"]}
                        style={styles.recordingButton}
                      >
                        <MicOff color={COLORS.white} size={32} />
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                ) : (
                  <TouchableOpacity onPress={startRecording} activeOpacity={0.8}>
                    <LinearGradient
                      colors={["#8B5CF6", "#A855F7"]}
                      style={styles.recordingButton}
                    >
                      <Mic color={COLORS.white} size={32} />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                <Text style={styles.recordingHint}>
                  {isRecording
                    ? "Tap to stop recording"
                    : "Tap to start recording"}
                </Text>
              </View>

              {/* Transcript Preview */}
              <View style={styles.transcriptSection}>
                <Text style={styles.transcriptLabel}>Transcript:</Text>
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptText}>
                    {transcript || "Speak your expenses..."}
                  </Text>
                </View>
              </View>

              {/* Processing Overlay or Example */}
              {isProcessing ? (
                <View style={styles.processingSection}>
                  <Animated.View
                    style={[
                      styles.processingIndicator,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <LinearGradient
                      colors={[COLORS.success, "#059669"]}
                      style={styles.processingCircle}
                    >
                      <Loader color={COLORS.white} size={28} />
                    </LinearGradient>
                  </Animated.View>
                  <Text style={styles.processingText}>{processingStatus}</Text>
                </View>
              ) : (
                <View style={styles.exampleSection}>
                  <Text style={styles.exampleLabel}>Example:</Text>
                  <Text style={styles.exampleText}>
                    "I spent 150 on coffee, 2000 on groceries, and received 50000 salary"
                  </Text>
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!transcript.trim() || isProcessing) && styles.submitButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={!transcript.trim() || isProcessing}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      transcript.trim() && !isProcessing
                        ? [COLORS.success, "#059669"]
                        : ["#374151", "#4B5563"]
                    }
                    style={styles.submitButtonGradient}
                  >
                    {isProcessing ? (
                      <Loader color={COLORS.white} size={18} />
                    ) : (
                      <>
                        <Check color={COLORS.white} size={18} />
                        <Text style={styles.submitButtonText}>Add Expenses</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </View>
      </Modal>

      {/* Custom Toast */}
      {toast.visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 0],
                  }),
                },
                {
                  scale: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <BlurView intensity={40} tint="dark" style={styles.toastBlur}>
            <LinearGradient
              colors={
                toast.type === 'success'
                  ? ['rgba(0, 214, 143, 0.15)', 'rgba(0, 214, 143, 0.05)']
                  : toast.type === 'error'
                  ? ['rgba(255, 71, 87, 0.15)', 'rgba(255, 71, 87, 0.05)']
                  : ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.05)']
              }
              style={styles.toastGradient}
            >
              <View
                style={[
                  styles.toastIconContainer,
                  {
                    backgroundColor:
                      toast.type === 'success'
                        ? 'rgba(0, 214, 143, 0.2)'
                        : toast.type === 'error'
                        ? 'rgba(255, 71, 87, 0.2)'
                        : 'rgba(139, 92, 246, 0.2)',
                  },
                ]}
              >
                {toast.type === 'success' ? (
                  <CheckCircle color={COLORS.success} size={24} />
                ) : toast.type === 'error' ? (
                  <AlertCircle color={COLORS.danger} size={24} />
                ) : (
                  <AlertCircle color="#8B5CF6" size={24} />
                )}
              </View>
              <View style={styles.toastContent}>
                <Text style={styles.toastTitle}>{toast.title}</Text>
                <Text style={styles.toastMessage}>{toast.message}</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  voiceButton: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
  },
  voiceButtonGradient: {
    width: 52,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBlur: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    width: "90%",
    maxWidth: 400,
  },
  modalContent: {
    padding: SPACING.l,
    backgroundColor: "rgba(17, 24, 39, 0.95)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  recordingSection: {
    alignItems: "center",
    marginBottom: SPACING.l,
  },
  recordingIndicator: {
    marginBottom: SPACING.m,
  },
  recordingButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  recordingHint: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.s,
  },
  transcriptSection: {
    marginBottom: SPACING.m,
  },
  transcriptLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  transcriptBox: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: BORDER_RADIUS.m,
    padding: SPACING.m,
    minHeight: 80,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  transcriptText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  exampleSection: {
    marginBottom: SPACING.l,
    padding: SPACING.m,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  exampleLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#A855F7",
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  exampleText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.m,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.m,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  submitButton: {
    flex: 1.5,
    borderRadius: BORDER_RADIUS.m,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.m,
    gap: SPACING.xs,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.white,
  },
  processingSection: {
    alignItems: "center",
    marginBottom: SPACING.l,
    padding: SPACING.l,
    backgroundColor: "rgba(0, 214, 143, 0.08)",
    borderRadius: BORDER_RADIUS.m,
    borderWidth: 1,
    borderColor: "rgba(0, 214, 143, 0.2)",
  },
  processingIndicator: {
    marginBottom: SPACING.m,
  },
  processingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  processingText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.success,
    textAlign: "center",
  },
  toastContainer: {
    position: "absolute",
    top: 60,
    left: SPACING.l,
    right: SPACING.l,
    zIndex: 9999,
  },
  toastBlur: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(15, 15, 25, 0.95)",
  },
  toastGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.m,
    paddingVertical: SPACING.l,
    gap: SPACING.m,
    backgroundColor: "rgba(20, 20, 30, 0.85)",
  },
  toastIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  toastContent: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});
