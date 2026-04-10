import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';

export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Normalização: garante que ID seja string e amount seja número
    return Array.isArray(parsed) ? parsed.map(t => ({ 
      ...t, 
      id: String(t.id).trim(),
      amount: Number(t.amount) || 0 
    })) : [];
  } catch (e) {
    return [];
  }
};

export const saveTransaction = async (value) => {
  try {
    const existingData = await getTransactions(); 
    const newItem = {
      ...value,
      id: String(value.id || Date.now()).trim(), 
      amount: Number(value.amount) || 0,
      type: String(value.type).toLowerCase()
    };
    const db = [...existingData, newItem];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    return false;
  }
};

export const getBalance = async () => {
  try {
    const transactions = await getTransactions();
    const income = transactions
      .filter(t => t.type === 'receita')
      .reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => acc + t.amount, 0);

    return { income, expense, total: income - expense };
  } catch (e) {
    return { income: 0, expense: 0, total: 0 };
  }
};

// --- FUNÇÃO DELETAR COM COMPARAÇÃO NÃO-ESTRITA ---
export const deleteTransaction = async (id) => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return true;

    const transactions = JSON.parse(data);
    const idParaApagar = String(id).trim();

    // Usamos != (em vez de !==) para evitar problemas se um for número e outro string
    // E removemos espaços extras de ambos os lados
    const filtered = transactions.filter(t => String(t.id).trim() != idParaApagar);

    // Salva e ESPERA a confirmação do sistema
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // Pequeno delay para garantir que o storage do celular processou
    await new Promise(resolve => setTimeout(resolve, 50)); 
    
    return true;
  } catch (e) {
    console.error("Erro ao apagar:", e);
    return false;
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    return false;
  }
};