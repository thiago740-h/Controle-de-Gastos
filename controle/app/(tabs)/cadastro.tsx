import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  SafeAreaView, 
  Keyboard 
} from 'react-native';
import { saveTransaction } from '../../src/services/transactionService';
import { useRouter } from 'expo-router';

export default function CadastroScreen() {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('despesa'); 
  const router = useRouter();

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert("Campos vazios", "Preencha a descrição e o valor.");
      return;
    }

    const newEntry = {
      // Usamos String e Date.now para um ID único e fácil de filtrar
      id: String(Date.now()), 
      description: description.trim(),
      amount: parseFloat(amount.replace(',', '.')),
      type: type, 
      date: new Date().toLocaleDateString('pt-BR'),
    };

    await saveTransaction(newEntry);
    
    // Feedback rápido e navegação
    setDescription('');
    setAmount('');
    Keyboard.dismiss();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>Novo Registro</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Tipo de Registro</Text>
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[styles.typeButton, type === 'receita' && styles.selectedIncome]} 
              onPress={() => setType('receita')}
            >
              <Text style={[styles.typeText, type === 'receita' && styles.selectedText]}>Salário</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeButton, type === 'despesa' && styles.selectedExpense]} 
              onPress={() => setType('despesa')}
            >
              <Text style={[styles.typeText, type === 'despesa' && styles.selectedText]}>Gasto</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Salário Mensal ou Almoço"
            value={description}
            onChangeText={setDescription}
            autoCorrect={false}
          />

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#4E31AA', textAlign: 'center', marginBottom: 30 },
  form: { backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 5 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
  typeContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
  typeButton: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  selectedIncome: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  selectedExpense: { backgroundColor: '#F44336', borderColor: '#F44336' },
  typeText: { fontWeight: 'bold', color: '#666' },
  selectedText: { color: '#FFF' },
  input: { backgroundColor: '#F1F3F5', padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16 },
  button: { backgroundColor: '#4E31AA', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});