import { useEffect, useState } from "react";
import styles from "./Home.module.css";
import SalaryModal from "../modals/SalaryModal";
import ExpensesModal from "../modals/ExpensesModal";
import CloseMonthModal from "../modals/CloseMonthModal";
import { SettingsModal } from "../modals/SettingsModal";

const SALARY_STORAGE_KEY = import.meta.env.VITE_SALARY_STORAGE_KEY;
const EXPENSES_STORAGE_KEY = import.meta.env.VITE_EXPENSES_STORAGE_KEY;

export default function Home() {
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showCloseMonthModal, setShowCloseMonthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [initialBalance, setInitialBalance] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);

  const loadFinancialData = () => {
    const storedSalaryData = localStorage.getItem(SALARY_STORAGE_KEY);

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
    setShowSalaryModal(false);
    setShowExpensesModal(false);
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

      {showSalaryModal && <SalaryModal onDataSaved={handleDataSaved} />}

      {showExpensesModal && (
        <ExpensesModal
          onDataSaved={handleDataSaved}
        />
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
