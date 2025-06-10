import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import BalanceModal from "../modals/BalanceModal/index";
import ExpensesModal from "../modals/ExpenseModal/index";
import SettingsModal from "../modals/SettingsModal/index";
import { FaTools } from "react-icons/fa";

const BALANCE_STORAGE_KEY = import.meta.env.VITE_BALANCE_STORAGE_KEY;
const EXPENSES_STORAGE_KEY = import.meta.env.VITE_EXPENSES_STORAGE_KEY;

export default function Home() {
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [initialBalance, setInitialBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  const loadFinancialData = () => {
    const storedSalaryData = localStorage.getItem(BALANCE_STORAGE_KEY);

    let totalSalary = 0;

    if (storedSalaryData) {
      try {
        const parsedSalaryData = JSON.parse(storedSalaryData);
        if (Array.isArray(parsedSalaryData)) {
          totalSalary = parsedSalaryData.reduce(
            (sum, entry) => sum + (parseFloat(entry.valor) || 0),
            0
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar dados de salário do localStorage na Home:",
          error
        );
      }
    }
    setInitialBalance(totalSalary);

    const storedExpensesData = localStorage.getItem(EXPENSES_STORAGE_KEY);
    let totalExpenses = 0;
    if (storedExpensesData) {
      try {
        const parsedExpensesData = JSON.parse(storedExpensesData);
        if (Array.isArray(parsedExpensesData)) {
          totalExpenses = parsedExpensesData.reduce(
            (sum, item) => sum + (parseFloat(item.valor) || 0),
            0
          );
        }
      } catch (error) {
        console.error(
          "Erro ao carregar dados de despesas do localStorage na Home:",
          error
        );
      }
    }
    setMonthlyExpenses(totalExpenses);

    setCurrentBalance(totalSalary - totalExpenses);
  };

  useEffect(() => {
    loadFinancialData();
  }, []);

  const handleDataSaved = () => {
    loadFinancialData();
    setShowBalanceModal(false);
    setShowExpensesModal(false);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Finances</h1>
      <button
        className={styles.settingsButton}
        onClick={() => setShowSettingsModal(true)}
      >
        <FaTools />
      </button>

      <div className={styles.cardGrid}>
        <div className={styles.card} onClick={() => setShowBalanceModal(true)}>
          <p>Saldo Inicial</p>
          <strong>R$ {initialBalance.toFixed(2)}</strong>
        </div>

        <div className={styles.card} onClick={() => setShowExpensesModal(true)}>
          <p>Gastos do Mês</p>
          <strong>R$ {monthlyExpenses.toFixed(2)}</strong>
        </div>

        <div className={styles.card}>
          <p>Saldo Atual</p>
          <strong>R$ {currentBalance.toFixed(2)}</strong>
        </div>
      </div>

      {showBalanceModal && <BalanceModal onDataSaved={handleDataSaved} />}

      {showExpensesModal && <ExpensesModal onDataSaved={handleDataSaved} />}

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}
