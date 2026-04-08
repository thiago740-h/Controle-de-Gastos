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
  const router = useRouter();

  const handleSave = async () => {
    if (!description || !amount) {
      Alert.alert("Campos vazios", "Preencha a descrição e o valor.");
      return;
    }

    const newEntry = {
      id: String(new Date().getTime()),
      description,
      amount: parseFloat(amount.replace(',', '.')),
      date: new Date().toLocaleDateString('pt-BR'),
    };

    await saveTransaction(newEntry);
    Alert.alert("Sucesso", "Gasto salvo!");
    
    setDescription('');
    setAmount('');
    Keyboard.dismiss(); // Fecha o teclado antes de mudar de tela
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* DICA: Se o erro persistir, remova o ScrollView e o KeyboardAvoidingView 
        temporariamente para testar, como fizemos aqui embaixo:
      */}
      <View style={styles.inner}>
        <Text style={styles.title}>Novo Gasto</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Almoço"
            value={description}
            onChangeText={(text) => setDescription(text)} // Função explícita
            autoCorrect={false} // Evita que o corretor cause re-render
          />

          <Text style={styles.label}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="0,00"
            value={amount}
            onChangeText={(text) => setAmount(text)}
            keyboardType="decimal-pad" // Melhor que 'numeric' em alguns casos
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Salvar</Text>
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
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  input: { 
    backgroundColor: '#F1F3F5', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20, 
    fontSize: 16 
  },
  button: { backgroundColor: '#4E31AA', padding: 18, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});