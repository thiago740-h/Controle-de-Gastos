import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@finance_data';

export const saveTransaction = async (value) => {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    const db = existingData ? JSON.parse(existingData) : [];
    db.push(value);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Erro ao salvar", e);
  }
};

export const getTransactions = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};