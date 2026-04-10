import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Pressable, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { FontAwesome } from '@expo/vector-icons'; 
import { getTransactions, getBalance, deleteTransaction, clearAllData } from '../../src/services/transactionService';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, total: 0 });

  const loadData = async () => {
    try {
      const trans = await getTransactions();
      const bal = await getBalance();
      setTransactions([...trans].reverse()); 
      setTotals(bal);
    } catch (error) {
      console.error("Erro ao carregar:", error);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  // --- FUNÇÃO DE TESTE: APAGA DIRETO SEM ALERT ---
  const apagarRegistro = async (id) => {
    const stringId = String(id).trim();
    console.log("Tentando apagar ID:", stringId);

    try {
      // 1. Tenta apagar no banco de dados
      const removido = await deleteTransaction(stringId);
      
      if (removido) {
        // 2. Remove da tela visualmente
        setTransactions(prev => prev.filter(t => String(t.id).trim() !== stringId));
        
        // 3. Atualiza o gráfico e totais
        const newBal = await getBalance();
        setTotals(newBal);
        console.log("Apagado com sucesso!");
      }
    } catch (e) {
      console.error("Erro no clique:", e);
    }
  };

  const handleReset = () => {
    Alert.alert("Limpar", "Apagar tudo?", [
      { text: "Cancelar" },
      { text: "Limpar", onPress: async () => {
          await clearAllData();
          loadData();
      }}
    ]);
  };

  const chartData = [
    { name: 'Saldo', amount: totals.total > 0 ? totals.total : 0.01, color: '#4CAF50', legendFontColor: '#7F7F7F', legendFontSize: 12 },
    { name: 'Gastos', amount: totals.expense > 0 ? totals.expense : 0, color: '#F44336', legendFontColor: '#7F7F7F', legendFontSize: 12 },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Resumo Financeiro</Text>
        <Pressable onPress={handleReset} style={styles.resetBtn}>
          <FontAwesome name="refresh" size={20} color="#4E31AA" />
        </Pressable>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { borderLeftColor: '#4CAF50', borderLeftWidth: 5 }]}>
          <Text style={styles.label}>Renda</Text>
          <Text style={styles.incomeValue}>R$ {totals.income.toFixed(2)}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#F44336', borderLeftWidth: 5 }]}>
          <Text style={styles.label}>Gastos</Text>
          <Text style={styles.expenseValue}>R$ {totals.expense.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.label}>Saldo Atual</Text>
        <Text style={[styles.totalValue, { color: totals.total >= 0 ? '#4E31AA' : '#F44336' }]}>
          R$ {totals.total.toFixed(2)}
        </Text>
      </View>

      {(totals.income > 0 || totals.expense > 0) && (
        <View style={styles.chartContainer}>
          <PieChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={200}
            chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
            accessor={"amount"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>
      )}

      <Text style={styles.subtitle}>Últimos Registros</Text>
      
      {transactions.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemDate}>{item.date}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.itemAmount, { color: item.type === 'receita' ? '#4CAF50' : '#F44336' }]}>
              R$ {item.amount.toFixed(2)}
            </Text>

            <Pressable 
              onPress={() => apagarRegistro(item.id)}
              hitSlop={30}
              style={({ pressed }) => [
                { 
                  opacity: pressed ? 0.3 : 1, 
                  padding: 15, // Aumentado para facilitar o toque
                  marginLeft: 10,
                  backgroundColor: '#FFF5F5', // Fundo leve para teste visual
                  borderRadius: 10
                }
              ]}
            >
              <FontAwesome name="trash" size={22} color="#F44336" />
            </Pressable>
          </View>
        </View>
      ))}

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4E31AA' },
  resetBtn: { padding: 10 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 25, marginBottom: 15, color: '#333' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, width: '48%' },
  balanceCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 2 },
  label: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  incomeValue: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },
  expenseValue: { fontSize: 16, fontWeight: 'bold', color: '#F44336' },
  totalValue: { fontSize: 28, fontWeight: 'bold' },
  chartContainer: { backgroundColor: '#FFF', borderRadius: 15, marginTop: 20, alignItems: 'center', padding: 10 },
  itemCard: { 
    backgroundColor: '#FFF', padding: 15, borderRadius: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 10, elevation: 1
  },
  itemDescription: { fontSize: 16, fontWeight: '600' },
  itemDate: { fontSize: 12, color: '#A0A0A0' },
  itemAmount: { fontSize: 15, fontWeight: 'bold' }
});