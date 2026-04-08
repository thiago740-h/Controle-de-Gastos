import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

// Importando ícones comuns (FontAwesome) para garantir que funcione em qualquer sistema
import { FontAwesome } from '@expo/vector-icons'; 

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Cor roxa que definimos como primária
        tabBarActiveTintColor: '#4E31AA',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 10, // Sombra no Android
          shadowColor: '#000', // Sombra no iOS
          shadowOpacity: 0.1,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      
      <Tabs.Screen
        name="index" // Refere-se ao arquivo index.tsx (Home)
        options={{
          title: 'Meu Extrato',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="list-alt" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="cadastro" // MUITO IMPORTANTE: Mude para o nome do seu arquivo (cadastro.tsx)
        options={{
          title: 'Novo Gasto',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={24} name="plus-circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}