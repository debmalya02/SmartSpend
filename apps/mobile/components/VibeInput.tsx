import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { Sparkles, Send } from 'lucide-react-native';
import { useExpenseStore } from '../stores/useExpenseStore';

export const VibeInput = () => {
  const [text, setText] = useState('');
  const { addExpenseViaAI, loading } = useExpenseStore();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    await addExpenseViaAI(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Sparkles color="#A855F7" size={20} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Lunch at cafe 150..."
          placeholderTextColor="#9CA3AF"
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          secureTextEntry={false}
          autoCorrect={false} 
        />
        <TouchableOpacity 
          onPress={handleSubmit} 
          disabled={loading || !text.trim()}
          style={styles.sendButton}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#A855F7" />
          ) : (
            <Send color={text.trim() ? "#A855F7" : "#D1D5DB"} size={20} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  sendButton: {
    padding: 4,
  },
});
