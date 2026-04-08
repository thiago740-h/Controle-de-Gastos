import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';

// Função para buscar todas as transações
export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Erro ao buscar dados", e);
    return [];
  }
};

// Função para salvar uma nova transação
export const saveTransaction = async (value) => {
  try {
    const existingData = await getTransactions(); // Usa a função acima
    const db = [...existingData, value];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Erro ao salvar", e);
  }
};

// Função para calcular o balanço (Salário vs Gastos)
export const getBalance = async () => {
  try {
    const transactions = await getTransactions();
    
    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + Number(t.amount), 0);
    
    const expense = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + Number(t.amount), 0);

    return {
      income,
      expense,
      total: income - expense
    };
  } catch (e) {
    return { income: 0, expense: 0, total: 0 };
  }
};