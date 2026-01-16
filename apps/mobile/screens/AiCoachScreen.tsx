import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Bot, Send, Sparkles, User } from "lucide-react-native";
import { useExpenseStore } from "../stores/useExpenseStore";
import {
  COLORS,
  SPACING,
} from "../constants/Theme";

const { height } = Dimensions.get("window");

export default function AiCoachScreen() {
  const { askAffordability } = useExpenseStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<
    { role: "user" | "system"; text: string }[]
  >([
    {
      role: "system",
      text: "Hey there! I'm your AI Financial Coach. Ask me anything about your spending habits, or check if you can afford that new gadget!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const response = await askAffordability(userText);

    setMessages((prev) => [
      ...prev,
      {
        role: "system",
        text: `${response.verdict}\n\n${response.advice}`,
      },
    ]);
    setLoading(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (
    message: { role: "user" | "system"; text: string },
    index: number
  ) => {
    const isUser = message.role === "user";

    return (
      <View
        key={index}
        style={[
          styles.messageContainer,
          isUser ? styles.userContainer : styles.systemContainer,
        ]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.avatar}
            >
              <Bot color={COLORS.white} size={14} />
            </LinearGradient>
          </View>
        )}

        <View style={[styles.bubble, isUser && styles.userBubble]}>
          {isUser ? (
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userBubbleGradient}
            >
              <Text style={styles.userText}>{message.text}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.systemBubbleContent}>
              <Text style={styles.systemText}>{message.text}</Text>
            </View>
          )}
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.userAvatar}>
              <User color={COLORS.textSecondary} size={14} />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Smooth ambient glow */}
      <LinearGradient
        colors={[
          "rgba(255, 107, 74, 0.18)",
          "rgba(255, 115, 85, 0.1)",
          "rgba(255, 130, 100, 0.04)",
          "transparent",
        ]}
        locations={[0, 0.15, 0.35, 0.6]}
        style={styles.ambientGlow}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0.5 }}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>AI Coach</Text>
            <Text style={styles.subtitle}>Your finance advisor</Text>
          </View>
          <View style={styles.headerIcon}>
            <Sparkles color={COLORS.primary} size={22} />
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {messages.map(renderMessage)}

          {loading && (
            <View style={[styles.messageContainer, styles.systemContainer]}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.avatar}
                >
                  <Bot color={COLORS.white} size={14} />
                </LinearGradient>
              </View>
              <View style={styles.bubble}>
                <View style={[styles.systemBubbleContent, styles.loadingBubble]}>
                  <ActivityIndicator color={COLORS.primary} size="small" />
                  <Text style={styles.loadingText}>Thinking...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area - Clean minimal design */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ask anything..."
              placeholderTextColor={COLORS.textMuted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={loading || !input.trim()}
              activeOpacity={0.7}
            >
              {input.trim() ? (
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
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  ambientGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height,
  },
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.m,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255, 107, 74, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 107, 74, 0.2)",
  },

  // Chat
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.m,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: SPACING.m,
    alignItems: "flex-end",
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  systemContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    marginHorizontal: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 20,
    overflow: "hidden",
  },
  userBubble: {},
  userBubbleGradient: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 10,
    borderRadius: 20,
  },
  systemBubbleContent: {
    paddingHorizontal: SPACING.m,
    paddingVertical: 10,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  userText: {
    fontSize: 15,
    color: COLORS.white,
    lineHeight: 21,
  },
  systemText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 21,
  },
  loadingBubble: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: SPACING.s,
  },

  // Input - Clean minimal design (no gradient box)
  inputWrapper: {
    paddingHorizontal: SPACING.m,
    paddingTop: SPACING.s,
    paddingBottom: 100,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    paddingLeft: SPACING.m,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: 8,
    paddingRight: SPACING.s,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonInactive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
});
