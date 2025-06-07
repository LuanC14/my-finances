import {  useEffect, useState } from "react";
import styles from "./Home.module.css";
import SalaryModal from "../modals/SalaryModal";
import ExpensesModal from "../modals/ExpensesModal";
import CloseMonthModal from "../modals/CloseMonthModal";
import { SettingsModal } from "../modals/SettingsModal";

const SALARY_STORAGE_KEY = 'myFinances_salaryData';
const EXPENSES_STORAGE_KEY = 'myFinances_ExpensesData';

export default function Home() {
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Estados para os valores que serão exibidos, agora gerenciados pela Home
  const [initialBalance, setInitialBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0); // Será atualizado para despesas
  const [currentBalance, setCurrentBalance] = useState(0);

  // Função para carregar e calcular os saldos
  const loadFinancialData = () => {
    // Carregar Saldo Inicial (SalaryModel)
    const storedSalaryData = localStorage.getItem(SALARY_STORAGE_KEY);

    let totalSalary = 0;

    if (storedSalaryData) {
      try {
        const parsedSalaryData = JSON.parse(storedSalaryData);
        if (Array.isArray(parsedSalaryData)) {
          totalSalary = parsedSalaryData.reduce((sum, entry) => sum + (parseFloat(entry.valor) || 0), 0);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de salário do localStorage na Home:", error);
      }
    }
    setInitialBalance(totalSalary);

    // Carregar Gastos do Mês (ExpensesModel - preparação futura)
    const storedExpensesData = localStorage.getItem(EXPENSES_STORAGE_KEY);
    let totalExpenses = 0;
    if (storedExpensesData) {
      try {
        const parsedExpensesData = JSON.parse(storedExpensesData);
        if (Array.isArray(parsedExpensesData)) {
          totalExpenses = parsedExpensesData.reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);
        }
      } catch (error) {
        console.error("Erro ao carregar dados de despesas do localStorage na Home:", error);
      }
    }
    setMonthlyExpenses(totalExpenses);

    // Calcular Saldo Atual
    setCurrentBalance(totalSalary - totalExpenses);
  };

  // Carregar dados na montagem do componente
  useEffect(() => {
    loadFinancialData();
  }, []); // Executa apenas uma vez na montagem

  // Callback para ser chamado quando o SalaryModal ou ExpensesModal salvar dados
  const handleDataSaved = () => {
    loadFinancialData(); // Recarrega os dados do localStorage e atualiza os estados
    setShowSalaryModal(false); // Garante que o modal de salário feche
    setShowExpensesModal(false); // Garante que o modal de despesa feche
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Minhas Finanças</h1>
      <button
        className={styles.settingsButton}
        onClick={() => setShowSettingsModal(true)}
      >
        ⚙️
      </button>

      <div className={styles.cardGrid}>
        <div className={styles.card} onClick={() => setShowSalaryModal(true)}>
          <p>Saldo Inicial</p>
          <strong>R$ {initialBalance.toFixed(2)}</strong>
        </div>

        <div className={styles.card} onClick={() => setShowExpensesModal(true)}>
          <p>Gastos do Mês</p>
          <strong>R$ {monthlyExpenses.toFixed(2)}</strong>
        </div>

        <div
          className={styles.card}
          onClick={() => setShowCloseMonthModal(true)}
        >
          <p>Saldo Atual</p>
          <strong>R$ {currentBalance.toFixed(2)}</strong>
        </div>
      </div>
      {showSalaryModal && (
        <SalaryModal onClose={handleDataSaved} onDataSaved={handleDataSaved} />
      )}
      {showExpensesModal && (
        <ExpensesModal onClose={handleDataSaved} onDataSaved={handleDataSaved} />
      )}
      {showCloseMonthModal && (
        <CloseMonthModal onClose={() => setShowCloseMonthModal(false)} />
      )}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}
