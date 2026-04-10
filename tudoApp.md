# 📊 MyFinance - Gestão Financeira Pessoal

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/expo-000020?style=for-the-badge&logo=expo&logoColor=white)

O **MyFinance** é um aplicativo móvel desenvolvido para ajudar no controle de gastos e receitas. Com uma interface limpa e intuitiva, o usuário pode monitorar seu saldo em tempo real, visualizar a distribuição de suas finanças através de gráficos e manter um histórico detalhado de suas transações.

---

## 🚀 Funcionalidades

- **Controle de Saldo:** Cálculo automático entre entradas (salários) e saídas (gastos).
- **Gráfico Dinâmico:** Visualização em gráfico de pizza da proporção entre o saldo disponível e o que já foi gasto.
- **Categorização:** Diferenciação visual entre receitas (verde) e despesas (vermelho).
- **Persistência de Dados:** Uso de armazenamento local para que os dados não sejam perdidos ao fechar o app.
- **Gestão de Histórico:** Opção de excluir registros individuais ou limpar todo o banco de dados.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
- **Navegação:** [Expo Router](https://docs.expo.dev/router/introduction/) (Tab Navigation)
- **Banco de Dados Local:** [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Gráficos:** [React Native Chart Kit](https://www.npmjs.com/package/react-native-chart-kit)
- **Ícones:** [FontAwesome](https://fontawesome.com/) via `@expo/vector-icons`

---

## ⚙️ Arquitetura e Performance

### 📂 Camada de Serviço (`transactionService.js`)
A lógica de negócio foi centralizada para garantir que as telas apenas exibam a informação:
* **Filtro de ID Rigoroso:** Implementamos uma limpeza de strings e conversão de tipos para garantir que a exclusão de itens seja 100% precisa.
* **Cálculo de Totais:** O serviço utiliza o método `.reduce()` para somar receitas e despesas de forma performática.
* **Segurança de Tipagem:** Todos os IDs são convertidos para `String` e tratados com `.trim()`, evitando falhas de comparação no banco local.

### 📱 Funcionamento da HomeScreen
A tela principal utiliza estratégias avançadas para uma experiência de usuário (UX) superior:

* **Sincronização com `useFocusEffect`:** Garante que os dados sejam revalidados do banco toda vez que a tela ganha foco, mantendo o gráfico sempre atualizado.
* **Exclusão Otimista (Optimistic UI):** Ao deletar um registro, o item é removido do estado visual instantaneamente. Isso elimina o "delay" de resposta do dispositivo, dando a sensação de um app ultra rápido.
* **Tratamento de Dados para Gráficos:** Implementamos travas de renderização (como valores mínimos de `0.01` para saldos zerados) para evitar erros matemáticos na biblioteca de gráficos.

---

## 📦 Instalação e Uso
1. **Clonar o projeto:**
   ```bash
   git clone [https://github.com/thiago740-h/Controle-de-Gastos](https://github.com/thiago740-h/Controle-de-Gastos)