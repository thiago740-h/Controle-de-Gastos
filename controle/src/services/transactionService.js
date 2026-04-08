import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';

// 1. BUSCAR TODAS AS TRANSAÇÕES
export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Erro ao buscar dados", e);
    return [];
  }
};

// 2. SALVAR UMA NOVA TRANSAÇÃO
export const saveTransaction = async (value) => {
  try {
    const existingData = await getTransactions(); 
    const db = [...existingData, value];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Erro ao salvar", e);
  }
};

// 3. CALCULAR BALANÇO PARA O GRÁFICO
export const getBalance = async () => {
  try {
    const transactions = await getTransactions();
    
    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0); // Proteção contra valores nulos
    
    const expense = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);

    return {
      income,
      expense,
      total: income - expense
    };
  } catch (e) {
    return { income: 0, expense: 0, total: 0 };
  }
};

// 4. APAGAR UMA ÚNICA TRANSAÇÃO (Ajustado para ser mais rigoroso)
export const deleteTransaction = async (id) => {
  try {
    const transactions = await getTransactions();
    
    // Usamos String(id) para garantir que a comparação funcione 
    // mesmo que um ID seja número e o outro texto
    const filtered = transactions.filter(t => String(t.id) !== String(id));
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true; // Retorna true para confirmar que limpou no banco
  } catch (e) {
    console.error("Erro ao apagar item", e);
    return false;
  }
};

// 5. LIMPAR TUDO
export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Erro ao limpar dados", e);
    return false;
  }
};