import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';

// 1. BUSCAR TODAS AS TRANSAÇÕES
export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    // Garante que sempre retornamos um Array
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

// 2. SALVAR UMA NOVA TRANSAÇÃO
export const saveTransaction = async (value) => {
  try {
    const existingData = await getTransactions(); 
    const db = [...existingData, value];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Força o sistema a entender que o salvamento acabou
    return Promise.resolve();
  } catch (e) {
    console.error("Erro ao salvar", e);
  }
};

// 3. CALCULAR BALANÇO
export const getBalance = async () => {
  try {
    const transactions = await getTransactions();
    
    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + Number(t.amount || 0), 0);
    
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

// 4. APAGAR UMA ÚNICA TRANSAÇÃO (A versão mais agressiva possível)
export const deleteTransaction = async (id) => {
  try {
    const transactions = await getTransactions();
    
    // Convertemos os dois IDs para String e limpamos espaços vazios (trim)
    // Isso evita que "123 " seja diferente de "123"
    const filtered = transactions.filter(t => {
      return String(t.id).trim() !== String(id).trim();
    });
    
    // Sobrescreve a lista no storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Pequena pausa para garantir que o sistema operacional processou a escrita
    return new Promise((resolve) => setTimeout(resolve, 50));
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
    return false;
  }
};