import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons'; 
import { 
  getTransactions, 
  getBalance, 
  deleteTransaction, 
  clearAllData, 
  getBalanceByCategory 
} from '../../src/services/transactionService';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, total: 0 });
  const [spentByCategory, setSpentByCategory] = useState({});

  const loadData = async () => {
    try {
      const [t, b, s] = await Promise.all([
        getTransactions(),
        getBalance(),
        getBalanceByCategory()
      ]);
      setTransactions([...t].reverse());
      setTotals(b);
      setSpentByCategory(s);
    } catch (e) { console.log("Erro ao carregar:", e); }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const apagarRegistro = async (id) => {
    try {
      const removido = await deleteTransaction(id);
      if (removido) await loadData();
    } catch (e) { console.error(e); }
  };

  const handleReset = () => {
    Alert.alert("Limpar Tudo", "Apagar todos os registros?", [
      { text: "Cancelar" },
      { text: "Limpar", style: 'destructive', onPress: async () => { await clearAllData(); loadData(); }}
    ]);
  };

  // FUNÇÃO QUE CALCULA O LIMITE BASEADO NA RENDA ATUAL (SALÁRIO + FREELANCE)
  const renderDynamicLimit = (label, percent, color) => {
    const limiteCalculado = totals.income * (percent / 100);
    const gasto = spentByCategory[label] || 0;
    const porcentagemUso = totals.income > 0 ? Math.min((gasto / limiteCalculado) * 100, 100) : 0;
    const estourou = gasto > limiteCalculado;

    return (
      <View style={styles.limitItem}>
        <View style={styles.limitInfo}>
          <View>
            <Text style={styles.limitCatName}>{label}</Text>
            <View style={[styles.badge, { backgroundColor: color + '22' }]}>
              <Text style={[styles.badgeText, { color: color }]}>{percent}% da Renda</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.limitNumbers, estourou && { color: '#F44336', fontWeight: 'bold' }]}>
              R$ {gasto.toFixed(0)} / R$ {limiteCalculado.toFixed(0)}
            </Text>
          </View>
        </View>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${porcentagemUso}%`, backgroundColor: estourou ? '#F44336' : color }]} />
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={styles.headerTitle}>Economy House</Text>
            <Text style={styles.headerSubtitle}>Limites Inteligentes</Text>
          </View>
          <Pressable onPress={handleReset} style={styles.resetBtn}>
            <FontAwesome name="refresh" size={18} color="#FFF" />
          </Pressable>
        </View>
      </View>

      <View style={styles.mainCard}>
        <Text style={styles.label}>SALDO DISPONÍVEL</Text>
        <Text style={[styles.mainValue, { color: totals.total >= 0 ? '#1A1A1A' : '#F44336' }]}>
          R$ {totals.total.toFixed(2)}
        </Text>
        <Text style={{ fontSize: 12, color: '#4CAF50', fontWeight: 'bold', marginTop: 5 }}>
          Renda Total: R$ {totals.income.toFixed(2)}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Metas Sugeridas (50-30-20)</Text>
      
      {totals.income === 0 ? (
        <View style={styles.emptyCard}>
          <FontAwesome name="info-circle" size={24} color="#4E31AA" />
          <Text style={styles.emptyText}>Adicione uma receita (salário ou freela) para calcular suas metas automaticamente!</Text>
        </View>
      ) : (
        <View>
          {renderDynamicLimit('Essenciais', 50, '#4E31AA')}
          {renderDynamicLimit('Lazer', 30, '#FF9800')}
          {renderDynamicLimit('Reserva', 20, '#4CAF50')}
        </View>
      )}

      <Text style={styles.sectionTitle}>Histórico</Text>
      {transactions.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemDate}>{item.category} • {item.date}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.itemAmount, { color: item.type === 'receita' ? '#4CAF50' : '#F44336' }]}>
              R$ {item.amount.toFixed(2)}
            </Text>
            <Pressable onPress={() => apagarRegistro(item.id)} style={styles.deleteBtn}>
              <FontAwesome name="trash" size={16} color="#F44336" />
            </Pressable>
          </View>
        </View>
      ))}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F5' },
  header: { backgroundColor: '#4E31AA', padding: 30, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { color: '#D1C4E9', fontSize: 13 },
  resetBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 },
  
  mainCard: { backgroundColor: '#FFF', margin: 20, marginTop: -30, padding: 25, borderRadius: 20, elevation: 8, alignItems: 'center' },
  mainValue: { fontSize: 30, fontWeight: 'bold' },
  label: { fontSize: 11, color: '#888', fontWeight: 'bold', letterSpacing: 1 },

  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginLeft: 20, marginTop: 20, marginBottom: 15, color: '#333' },
  
  limitItem: { backgroundColor: '#FFF', marginHorizontal: 20, marginBottom: 12, padding: 15, borderRadius: 15, elevation: 2 },
  limitInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' },
  limitCatName: { fontWeight: 'bold', color: '#444', fontSize: 15 },
  limitNumbers: { fontSize: 12, color: '#666' },
  
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: 'bold' },

  barBg: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  
  itemCard: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemDescription: { fontSize: 15, fontWeight: '600' },
  itemDate: { fontSize: 11, color: '#999' },
  itemAmount: { fontSize: 14, fontWeight: 'bold' },
  deleteBtn: { marginLeft: 12, padding: 8, backgroundColor: '#FFF5F5', borderRadius: 8 },
  
  emptyCard: { backgroundColor: '#FFF', margin: 20, padding: 30, borderRadius: 15, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#4E31AA' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 10, fontSize: 13, lineHeight: 20 }
});