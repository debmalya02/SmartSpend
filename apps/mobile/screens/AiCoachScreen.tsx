import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Bot, Send, Sparkles, User } from 'lucide-react-native';
import { useExpenseStore } from '../stores/useExpenseStore';
import { COLORS, GRADIENTS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../constants/Theme';

export default function AiCoachScreen() {
  const { askAffordability } = useExpenseStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<{role: 'user' | 'system', text: string}[]>([
    { role: 'system', text: 'Hey there! I\'m your AI Financial Coach. Ask me anything about your spending habits, or check if you can afford that new gadget! 💰' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const response = await askAffordability(userText);
    
    setMessages(prev => [...prev, { 
      role: 'system', 
      text: `${response.verdict}\n\n${response.advice}` 
    }]);
    setLoading(false);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = (message: {role: 'user' | 'system', text: string}, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <Animated.View 
        key={index} 
        style={[styles.messageContainer, isUser ? styles.userContainer : styles.systemContainer]}
      >
        {!isUser && (
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              style={styles.avatar}
            >
              <Bot color={COLORS.white} size={18} />
            </LinearGradient>
          </View>
        )}
        
        <View style={[styles.bubbleOuter, isUser && styles.userBubbleOuter]}>
          {isUser ? (
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.userBubble}
            >
              <Text style={styles.userText}>{message.text}</Text>
            </LinearGradient>
          ) : (
            <BlurView intensity={30} tint="dark" style={styles.bubbleBlur}>
              <LinearGradient
                colors={GRADIENTS.glass as [string, string]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.systemBubble}
              >
                <Text style={styles.systemText}>{message.text}</Text>
              </LinearGradient>
            </BlurView>
          )}
        </View>

        {isUser && (
          <View style={styles.avatarContainer}>
            <View style={styles.userAvatar}>
              <User color={COLORS.textSecondary} size={18} />
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Ambient Background - Seamless multi-stop gradient */}
      <LinearGradient
        colors={[
          'rgba(255, 107, 74, 0.12)',
          'rgba(255, 107, 74, 0.06)',
          'rgba(255, 107, 74, 0.02)',
          'rgba(255, 107, 74, 0.005)',
          'rgba(10, 10, 15, 0)',
        ]}
        locations={[0, 0.3, 0.55, 0.8, 1]}
        style={styles.ambientGlow}
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <LinearGradient
              colors={GRADIENTS.primary as [string, string]}
              style={styles.headerIcon}
            >
              <Sparkles color={COLORS.white} size={20} />
            </LinearGradient>
            <View>
              <Text style={styles.title}>AI Coach</Text>
              <Text style={styles.subtitle}>Your personal finance advisor</Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}
          
          {loading && (
            <View style={[styles.messageContainer, styles.systemContainer]}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={GRADIENTS.primary as [string, string]}
                  style={styles.avatar}
                >
                  <Bot color={COLORS.white} size={18} />
                </LinearGradient>
              </View>
              <View style={styles.bubbleOuter}>
                <BlurView intensity={30} tint="dark" style={styles.bubbleBlur}>
                  <LinearGradient
                    colors={GRADIENTS.glass as [string, string]}
                    style={[styles.systemBubble, styles.loadingBubble]}
                  >
                    <ActivityIndicator color={COLORS.primary} size="small" />
                    <Text style={styles.loadingText}>Analyzing...</Text>
                  </LinearGradient>
                </BlurView>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <View style={styles.inputAreaOuter}>
            <BlurView intensity={60} tint="dark" style={styles.inputBlur}>
              <LinearGradient
                colors={['rgba(26, 26, 36, 0.95)', 'rgba(18, 18, 26, 0.98)']}
                style={styles.inputArea}
              >
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Can I afford the new iPhone?" 
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
                    style={[
                      styles.sendButton,
                      input.trim() && styles.sendButtonActive
                    ]}
                    activeOpacity={0.7}
                  >
                    <Send color={input.trim() ? COLORS.white : COLORS.textMuted} size={20} />
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
  },
  safeArea: {
    flex: 1,
  },
  
  // Header
  header: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: SPACING.l,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.m,
    ...SHADOWS.glow,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
  },
  subtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  
  // Chat
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: SPACING.l,
    paddingBottom: 120, // Extra space for input area
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  systemContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    marginHorizontal: SPACING.s,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubbleOuter: {
    maxWidth: '75%',
    borderRadius: BORDER_RADIUS.l,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  userBubbleOuter: {
    borderColor: 'transparent',
  },
  bubbleBlur: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.l,
  },
  userBubble: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.l,
  },
  systemBubble: {
    padding: SPACING.m,
  },
  userText: {
    ...TYPOGRAPHY.body,
    color: COLORS.white,
    lineHeight: 22,
  },
  systemText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    lineHeight: 22,
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginLeft: SPACING.s,
  },
  
  // Input
  inputAreaOuter: {
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
    overflow: 'hidden',
  },
  inputBlur: {
    overflow: 'hidden',
  },
  inputArea: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.m,
    paddingBottom: 100, // Account for tab bar height (90px) + extra padding
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    maxHeight: 100,
    paddingVertical: SPACING.s,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.s,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.glow,
  },
});
