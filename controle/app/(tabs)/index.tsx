import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { getTransactions, getBalance } from '../../src/services/transactionService';

export default function HomeScreen() {
  const [totals, setTotals] = useState({ income: 0, expense: 0, total: 0 });

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        const res = await getBalance();
        setTotals(res);
      }
      loadData();
    }, [])
  );

  const chartData = [
    {
      name: 'Disponível',
      amount: totals.total > 0 ? totals.total : 0,
      color: '#4CAF50',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Gastos',
      amount: totals.expense,
      color: '#F44336',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Resumo Financeiro</Text>

      {/* Cartões de Saldo */}
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
        <Text style={styles.totalValue}>R$ {totals.total.toFixed(2)}</Text>
      </View>

      {/* Gráfico */}
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
          absolute // Mostra os valores reais no gráfico
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#4E31AA', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, width: '48%', elevation: 3 },
  balanceCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, alignItems: 'center', elevation: 3 },
  label: { fontSize: 12, color: '#666', textTransform: 'uppercase' },
  incomeValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50' },
  expenseValue: { fontSize: 18, fontWeight: 'bold', color: '#F44336' },
  totalValue: { fontSize: 26, fontWeight: 'bold', color: '#4E31AA' },
  chartContainer: { backgroundColor: '#FFF', borderRadius: 15, padding: 10, elevation: 3, marginBottom: 50 }
});