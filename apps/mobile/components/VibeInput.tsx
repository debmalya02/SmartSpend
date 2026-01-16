import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Send } from "lucide-react-native";
import { useExpenseStore } from "../stores/useExpenseStore";
import { COLORS, BORDER_RADIUS, SPACING } from "../constants/Theme";

export const VibeInput = () => {
  const [text, setText] = useState("");
  const { addExpenseViaAI, loading } = useExpenseStore();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addExpenseViaAI(text);
    setText("");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputOuter, isFocused && styles.inputFocused]}>
        <BlurView intensity={20} tint="dark" style={styles.blurView}>
          <View style={styles.inputWrapper}>
            <View style={styles.iconWrapper}>
              <Sparkles color={COLORS.primary} size={18} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Lunch at cafe ₹150..."
              placeholderTextColor={COLORS.textMuted}
              value={text}
              onChangeText={setText}
              onSubmitEditing={handleSubmit}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading || !text.trim()}
              activeOpacity={0.7}
            >
              {loading ? (
                <View style={styles.sendButtonInactive}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : text.trim() ? (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.sendButton}
                >
                  <Send color={COLORS.white} size={16} />
                </LinearGradient>
              ) : (
                <View style={styles.sendButtonInactive}>
                  <Send color={COLORS.textMuted} size={16} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  inputOuter: {
    borderRadius: BORDER_RADIUS.l,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  inputFocused: {
    borderColor: "rgba(255, 107, 74, 0.4)",
  },
  blurView: {
    overflow: "hidden",
    borderRadius: BORDER_RADIUS.l,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(255, 107, 74, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.s,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: "500",
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.s,
  },
  sendButtonInactive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: SPACING.s,
  },
});
