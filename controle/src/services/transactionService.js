import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';
const BUDGET_KEY = '@finance_budgets';

// 1. BUSCAR TRANSAÇÕES
// Garante normalização de ID, valor e categoria para não quebrar os cálculos
export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    
    return Array.isArray(parsed) ? parsed.map(t => ({ 
      ...t, 
      id: String(t.id).trim(),
      amount: Number(t.amount) || 0,
      // Se não houver categoria, definimos como 'Outros'
      category: t.category || 'Outros',
      type: String(t.type).toLowerCase()
    })) : [];
  } catch (e) {
    return [];
  }
};

// 2. SALVAR TRANSAÇÃO
// Agora inclui suporte para capturar a data automaticamente se não for enviada
export const saveTransaction = async (value) => {
  try {
    const existingData = await getTransactions(); 
    const newItem = {
      ...value,
      id: String(Date.now() + Math.random()).trim(), // ID único mais seguro
      amount: Number(value.amount) || 0,
      type: String(value.type).toLowerCase(),
      category: value.category || 'Outros',
      date: value.date || new Date().toLocaleDateString('pt-BR')
    };
    const db = [...existingData, newItem];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    return false;
  }
};

// 3. BUSCAR GASTOS POR CATEGORIA (Para as barras de progresso)
export const getBalanceByCategory = async () => {
  try {
    const transactions = await getTransactions();
    const totals = {};

    transactions.forEach(t => {
      if (t.type === 'despesa') {
        const cat = t.category;
        totals[cat] = (totals[cat] || 0) + t.amount;
      }
    });
    return totals;
  } catch (e) {
    return {};
  }
};

// 4. BALANÇO GERAL (Renda Total e Despesa Total)
// Essencial para o cálculo dinâmico: totals.income aqui soma Salário + Freelas
export const getBalance = async () => {
  try {
    const transactions = await getTransactions();
    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + t.amount, 0);

    return { 
      income, 
      expense, 
      total: income - expense 
    };
  } catch (e) {
    return { income: 0, expense: 0, total: 0 };
  }
};

// 5. DELETAR REGISTRO (Corrigido para ser mais resiliente)
export const deleteTransaction = async (id) => {
  try {
    const transactions = await getTransactions();
    const idParaRemover = String(id).trim();
    
    const filtered = transactions.filter(t => String(t.id).trim() !== idParaRemover);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Pequeno delay opcional para garantir a escrita no storage em Androids lentos
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    return true;
  } catch (e) {
    console.error("Erro ao deletar no Service:", e);
    return false;
  }
};

// 6. LIMPAR TUDO
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEY, BUDGET_KEY]);
    return true;
  } catch (e) {
    return false;
  }
};

// Funções de Budget manual mantidas para compatibilidade futura
export const saveBudget = async (category, amount) => {
  try {
    const data = await AsyncStorage.getItem(BUDGET_KEY);
    let budgets = data ? JSON.parse(data) : {};
    budgets[category] = Number(amount);
    await AsyncStorage.setItem(BUDGET_KEY, JSON.stringify(budgets));
    return true;
  } catch (e) { return false; }
};

export const getBudgets = async () => {
  try {
    const data = await AsyncStorage.getItem(BUDGET_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) { return {}; }
};