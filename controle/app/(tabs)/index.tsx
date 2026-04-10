import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { FontAwesome } from '@expo/vector-icons'; 
import { getTransactions, getBalance, deleteTransaction, clearAllData } from '../../src/services/transactionService';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, total: 0 });

  // Função para carregar dados do AsyncStorage
  const loadData = async () => {
    try {
      const trans = await getTransactions();
      const bal = await getBalance();
      
      // Garantimos que trans seja um array e invertemos para mostrar os novos primeiro
      const dataArray = Array.isArray(trans) ? trans : [];
      setTransactions([...dataArray].reverse()); 
      setTotals(bal);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  // Atualiza a tela sempre que o usuário entra nela
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  // --- FUNÇÃO DE APAGAR REFORÇADA ---
  const handleDelete = (id) => {
    // Forçamos o ID a ser String para garantir a comparação no filtro
    const stringId = String(id).trim();

    Alert.alert("Excluir", "Deseja apagar este registro?", [
      { text: "Cancelar", style: "cancel" },
      { 
        text: "Excluir", 
        style: "destructive", 
        onPress: async () => {
          try {
            // 1. Remove do estado local IMEDIATAMENTE (Interface rápida)
            setTransactions(current => current.filter(t => String(t.id).trim() !== stringId));

            // 2. Apaga no banco de dados (AsyncStorage)
            await deleteTransaction(stringId); 
            
            // 3. Atualiza os totais do gráfico após a exclusão
            const newBal = await getBalance();
            setTotals(newBal);
          } catch (error) {
            Alert.alert("Erro", "Não foi possível apagar o item.");
            loadData(); // Recarrega os dados caso algo dê errado
          }
        } 
      }
    ]);
  };

  // --- FUNÇÃO DE RESET TOTAL ---
  const handleReset = () => {
    Alert.alert("Limpar Tudo", "Isso apagará todos os seus dados permanentemente.", [
      { text: "Cancelar" },
      { 
        text: "Limpar", 
        style: "destructive", 
        onPress: async () => {
          await clearAllData();
          setTransactions([]);
          setTotals({ income: 0, expense: 0, total: 0 });
        } 
      }
    ]);
  };

  const chartData = [
    {
      name: 'Saldo',
      amount: totals.total > 0 ? totals.total : 0.01, // Evita erro visual se saldo for 0
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Gastos',
      amount: totals.expense > 0 ? totals.expense : 0,
      color: '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Resumo Financeiro</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <FontAwesome name="refresh" size={20} color="#4E31AA" />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, { borderLeftColor: '#4CAF50', borderLeftWidth: 5 }]}>
          <Text style={styles.label}>Salário/Renda</Text>
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
        <>
          <Text style={styles.subtitle}>Distribuição</Text>
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
        </>
      )}

      <Text style={styles.subtitle}>Últimos Registros</Text>
      {transactions.length === 0 ? (
        <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
      ) : (
        transactions.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemDate}>{item.date}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={[styles.itemAmount, { color: item.type === 'receita' ? '#4CAF50' : '#F44336' }]}>
                {item.type === 'receita' ? '+' : '-'} R$ {item.amount.toFixed(2)}
              </Text>
              <TouchableOpacity 
                onPress={() => handleDelete(item.id)} 
                style={styles.deleteBtn}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Aumenta área de clique
              >
                <FontAwesome name="trash" size={18} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 40 }} />
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
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 12, width: '48%', elevation: 2 },
  balanceCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, alignItems: 'center', elevation: 4 },
  label: { fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 'bold' },
  incomeValue: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50', marginTop: 5 },
  expenseValue: { fontSize: 16, fontWeight: 'bold', color: '#F44336', marginTop: 5 },
  totalValue: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  chartContainer: { backgroundColor: '#FFF', borderRadius: 15, padding: 10, elevation: 2, alignItems: 'center' },
  emptyText: { textAlign: 'center', color: '#999', marginTop: 20, fontStyle: 'italic' },
  itemCard: { 
    backgroundColor: '#FFF', padding: 15, borderRadius: 12, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    marginBottom: 10, elevation: 1 
  },
  itemInfo: { flex: 1 },
  itemDescription: { fontSize: 16, fontWeight: '600', color: '#2D3436' },
  itemDate: { fontSize: 12, color: '#A0A0A0', marginTop: 4 },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemAmount: { fontSize: 15, fontWeight: 'bold', marginRight: 15 },
  deleteBtn: { padding: 10 }
});