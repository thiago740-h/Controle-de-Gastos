import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';

// 1. BUSCAR TODAS AS TRANSAÇÕES
export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    // Forçamos que cada item vindo do banco tenha um ID em string
    return Array.isArray(parsed) ? parsed.map(t => ({ ...t, id: String(t.id) })) : [];
  } catch (e) {
    console.error("Erro ao buscar dados", e);
    return [];
  }
};

// 2. SALVAR UMA NOVA TRANSAÇÃO
export const saveTransaction = async (value) => {
  try {
    const existingData = await getTransactions(); 
    
    // Normalização total do dado antes de salvar
    const newItem = {
      ...value,
      id: String(value.id).trim(), // ID sempre String e sem espaços
      amount: Number(value.amount) || 0, // Garante que é número
      type: String(value.type).toLowerCase() // Garante minúsculo para o filtro
    };
    
    const db = [...existingData, newItem];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error("Erro ao salvar", e);
    return false;
  }
};

// 3. CALCULAR BALANÇO
export const getBalance = async () => {
  try {
    const transactions = await getTransactions();
    
    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    
    const expense = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    return {
      income,
      expense,
      total: income - expense
    };
  } catch (e) {
    return { income: 0, expense: 0, total: 0 };
  }
};

// 4. APAGAR UMA ÚNICA TRANSAÇÃO (Ajuste Crítico)
export const deleteTransaction = async (id) => {
  try {
    const transactions = await getTransactions();
    const idParaApagar = String(id).trim();

    // Filtro usando comparação estrita após normalização
    const filtered = transactions.filter(t => String(t.id).trim() !== idParaApagar);
    
    // IMPORTANTE: Se o tamanho for igual, significa que ele não achou o ID
    if (filtered.length === transactions.length) {
      console.warn("Aviso: ID não encontrado no banco para deletar:", idParaApagar);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error("Erro ao apagar item", e);
    return false;
  }
};

// 5. LIMPAR TUDO
export const clearAllData = async () => {
  try {
    // Melhor usar removeItem para não apagar configurações de outros plugins do Expo
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error("Erro ao limpar dados", e);
    return false;
  }
};