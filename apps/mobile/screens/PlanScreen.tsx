import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Switch, Alert, FlatList, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExpenseStore } from '../stores/useExpenseStore';
import { Plus, X } from 'lucide-react-native';

export default function PlanScreen() {
  const { recurringPlans, fetchPlans, createPlan } = useExpenseStore();
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreate = async () => {
    if (!name || !amount) {
        Alert.alert("Missing Fields", "Please enter a name and amount.");
        return;
    }
    
    setLoading(true);
    await createPlan({ 
        name, 
        amount: Number(amount), 
        frequency, 
        type: activeTab 
    });
    await fetchPlans(); // Refresh list
    setLoading(false);
    setModalVisible(false);
    setName('');
    setAmount('');
  };

  const filteredPlans = recurringPlans.filter(p => p.type === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Plans</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'INCOME' && styles.tabActive]} 
          onPress={() => setActiveTab('INCOME')}
        >
          <Text style={[styles.tabText, activeTab === 'INCOME' && styles.tabTextActive]}>Income</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'EXPENSE' && styles.tabActive]} 
          onPress={() => setActiveTab('EXPENSE')}
        >
          <Text style={[styles.tabText, activeTab === 'EXPENSE' && styles.tabTextActive]}>Liabilities</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList 
        data={filteredPlans}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.planName}>{item.name}</Text>
              <Text style={styles.planFreq}>{item.frequency} • Next: {new Date(item.nextDueDate).toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.planAmount, { color: item.type === 'INCOME' ? '#34C759' : '#000' }]}>
              {item.type === 'INCOME' ? '+' : ''} {Number(item.amount).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} plans yet.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus color="white" size={32} />
      </TouchableOpacity>

      {/* Modal Form */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New {activeTab === 'INCOME' ? 'Income' : 'Liability'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X color="#000" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="e.g. Netflix, Salary" value={name} onChangeText={setName} />

            <Text style={styles.label}>Amount</Text>
            <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={amount} onChangeText={setAmount} />

            <Text style={styles.label}>Frequency</Text>
            <View style={styles.pillContainer}>
              {['weekly', 'monthly', 'yearly'].map(f => (
                <TouchableOpacity key={f} style={[styles.pill, frequency === f && styles.pillActive]} onPress={() => setFrequency(f)}>
                  <Text style={[styles.pillText, frequency === f && styles.pillTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
              <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Create Plan'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7', paddingHorizontal: 20 },
  header: { fontSize: 32, fontWeight: '700', marginVertical: 20 },
  tabContainer: { flexDirection: 'row', backgroundColor: '#e5e5ea', borderRadius: 12, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 },
  tabText: { fontWeight: '600', color: '#8e8e93' },
  tabTextActive: { color: '#000' },
  list: { paddingBottom: 100 },
  card: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  planFreq: { fontSize: 14, color: '#888' },
  planAmount: { fontSize: 18, fontWeight: '700' },
  empty: { marginTop: 50, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007AFF', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  
  // Modal Styles
  modalContent: { flex: 1, padding: 20, backgroundColor: '#f5f5f7' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 24, fontWeight: '700' },
  form: { backgroundColor: 'white', padding: 20, borderRadius: 20 },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 12, fontSize: 16 },
  pillContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#f0f0f0' },
  pillActive: { backgroundColor: '#007AFF' },
  pillText: { color: '#666' },
  pillTextActive: { color: 'white' },
  createButton: { backgroundColor: '#007AFF', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 30 },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 16 },
});
