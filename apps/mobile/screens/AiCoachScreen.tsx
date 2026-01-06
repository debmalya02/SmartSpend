import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bot, Send } from 'lucide-react-native';

import { useExpenseStore } from '../stores/useExpenseStore';

export default function AiCoachScreen() {
  const { askAffordability } = useExpenseStore();
  const [messages, setMessages] = useState<{role: 'user' | 'system', text: string}[]>([
    { role: 'system', text: 'Hi! I am your AI Financial Coach. Ask me if you can afford that new gadget!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    const response = await askAffordability(userText);
    
    setMessages(prev => [...prev, { 
      role: 'system', 
      text: `${response.verdict}\n\n${response.advice}` 
    }]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>AI Coach</Text>
      <ScrollView style={styles.chatContainer}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.systemBubble]}>
            <Text style={m.role === 'user' ? styles.userText : styles.systemText}>{m.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.bubble, styles.systemBubble, { width: 60, alignItems: 'center' }]}>
            <ActivityIndicator color="#007AFF" size="small" />
          </View>
        )}
      </ScrollView>
      <View style={styles.inputArea}>
        <TextInput 
          style={styles.input} 
          placeholder="Can I afford the new iPhone?" 
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Send color="#fff" size={20} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: { fontSize: 32, fontWeight: '700', padding: 20 },
  chatContainer: { flex: 1, paddingHorizontal: 20 },
  bubble: { padding: 12, borderRadius: 16, marginBottom: 10, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  systemBubble: { backgroundColor: '#fff', alignSelf: 'flex-start' },
  userText: { color: '#fff' },
  systemText: { color: '#000' },
  inputArea: { flexDirection: 'row', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 24, marginRight: 10 },
  sendButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 50 },
});
