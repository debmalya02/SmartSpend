import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Send } from 'lucide-react-native';
import { useExpenseStore } from '../stores/useExpenseStore';
import { COLORS, GRADIENTS, BORDER_RADIUS, SHADOWS, SPACING } from '../constants/Theme';

export const VibeInput = () => {
  const [text, setText] = useState('');
  const { addExpenseViaAI, loading } = useExpenseStore();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addExpenseViaAI(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputOuter, isFocused && styles.inputFocused]}>
        <BlurView intensity={40} tint="dark" style={styles.blurView}>
          <LinearGradient
            colors={isFocused ? GRADIENTS.glassWarm as [string, string] : GRADIENTS.glass as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inputWrapper}
          >
            <View style={styles.iconWrapper}>
              <Sparkles color={COLORS.primary} size={20} />
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
              style={[
                styles.sendButton,
                text.trim() && styles.sendButtonActive
              ]}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Send 
                  color={text.trim() ? COLORS.white : COLORS.textMuted} 
                  size={18} 
                />
              )}
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputOuter: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...SHADOWS.card,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  blurView: {
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s + 2,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 107, 74, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.s,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.s,
  },
  sendButtonActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});
