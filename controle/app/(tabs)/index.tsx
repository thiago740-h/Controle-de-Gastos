import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router'; 
import { getTransactions } from '../../src/services/transactionService';

export default function HomeScreen() {
  const [transactions, setTransactions] = useState([]);

  // Atualiza a lista toda vez que o usuário volta para esta aba
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadData() {
        try {
          const data = await getTransactions();
          if (isActive) {
            // Ordena para que o gasto mais recente apareça primeiro
            setTransactions(data.reverse());
          }
        } catch (error) {
          console.error("Erro ao carregar transações:", error);
        }
      }

      loadData();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Finanças</Text>
        <Text style={styles.subtitle}>Histórico de gastos</Text>
      </View>
      
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.infoContainer}>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amount}>
                R$ {Number(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum gasto registrado ainda.</Text>
            <Text style={styles.emptySubtext}>Toque em 'Novo Gasto' para começar.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#FFF',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#4E31AA' 
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContent: { 
    padding: 20,
    paddingBottom: 100 
  },
  card: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderRadius: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    // Sombra suave
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  infoContainer: {
    flex: 1,
  },
  description: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#2D3436' 
  },
  date: { 
    fontSize: 12, 
    color: '#A0A0A0', 
    marginTop: 6 
  },
  amountContainer: {
    marginLeft: 10,
  },
  amount: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#E74C3C' // Vermelho para despesa
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: { 
    fontSize: 18, 
    color: '#B2BEC3', 
    fontWeight: '600' 
  },
  emptySubtext: {
    fontSize: 14,
    color: '#DFE6E9',
    marginTop: 8,
  }
});