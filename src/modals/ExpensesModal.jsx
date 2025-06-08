import { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { useAuth } from "../context/AuthContext";
import _ from "lodash";
import { FaSave, FaTimes, FaSyncAlt, FaPlus } from "react-icons/fa";

const EXPENSES_STORAGE_KEY = import.meta.env.VITE_EXPENSES_STORAGE_KEY;
const LAST_UPDATE_EXPENSES_KEY = import.meta.env.VITE_LAST_UPDATE_EXPENSES_KEY;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_EXPENSES_BIN_RESOURCE = import.meta.env
  .VITE_API_EXPENSES_BIN_RESOURCE;
const API_KEY = import.meta.env.VITE_API_KEY;

export default function ExpensesModal({ onDataSaved }) {
  const [expenses, setExpenses] = useState([
    { descricao: "", categoria: "", valor: "" },
  ]);

  const { validKey } = useAuth();

  const handleChange = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const addExpense = () => {
    setExpenses([...expenses, { descricao: "", categoria: "", valor: "" }]);
  };

  async function handleRequest(cleanedExpenses) {
    const url = `${API_BASE_URL}/${API_EXPENSES_BIN_RESOURCE}`;
    const lastUpdateLocalRaw = localStorage.getItem(LAST_UPDATE_EXPENSES_KEY);

    try {
      const lastUpdateLocal = lastUpdateLocalRaw
        ? parseInt(JSON.parse(lastUpdateLocalRaw))
        : null;

      const response = await fetch(url, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: status ${response.status}`);
      }

      const data = await response.json();

      const lastUpdateDataRaw = data?.record?.last_update;
      const lastUpdateData = lastUpdateDataRaw
        ? parseInt(lastUpdateDataRaw)
        : null;

      if (
        lastUpdateData &&
        lastUpdateLocal &&
        lastUpdateData !== lastUpdateLocal
      ) {
        alert("É necessário sincronizar os dados.");
        return;
      }

      const currentTime = Date.now();

      const updatedData = {
        id: validKey,
        last_update: currentTime,
        expenses: cleanedExpenses,
      };

      const putResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify(updatedData),
      });

      if (!putResponse.ok) {
        throw new Error(
          `Erro ao salvar os dados: status ${putResponse.status}`
        );
      }

      localStorage.setItem(
        LAST_UPDATE_EXPENSES_KEY,
        JSON.stringify(currentTime)
      );

      localStorage.setItem(
        EXPENSES_STORAGE_KEY,
        JSON.stringify(cleanedExpenses)
      );

      alert("Dados inseridos com sucesso.");
    } catch (error) {
      console.error("Erro ao processar handleRequest:", error);
      alert("Ocorreu um erro ao processar os dados. Verifique o console.");
    }
  }

  const handleSave = async () => {
    const previousExpenses = JSON.parse(
      localStorage.getItem(EXPENSES_STORAGE_KEY)
    );

    if (_.isEqual(expenses, previousExpenses)) {
      console.log("Nenhuma alteração encontrada");
      onDataSaved();
      return;
    }
    if (!validKey) {
      alert("Você não está autenticado");
      return;
    }
    const cleanedExpenses = expenses
      .filter(
        (expense) =>
          expense.descricao.trim() !== "" && !isNaN(parseFloat(expense.valor))
      )
      .map((expense) => ({
        descricao: expense.descricao.trim(),
        categoria: expense.categoria.trim(),
        valor: parseFloat(expense.valor),
      }));

    if (cleanedExpenses.length === 0) {
      alert(
        "Por favor, preencha pelo menos uma entrada de salário/receita válida antes de salvar."
      );
      return;
    }

    await handleRequest(cleanedExpenses);
    onDataSaved();
  };

  async function handleRefresh() {
    const url = `${API_BASE_URL}/${API_EXPENSES_BIN_RESOURCE}`;

    const response = await fetch(url, {
      headers: {
        "X-Master-Key": API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: status ${response.status}`);
    }

    const data = await response.json();

    const lastUpdateDataRaw = data?.record?.last_update;

    const lastUpdateData = lastUpdateDataRaw
      ? parseInt(lastUpdateDataRaw)
      : null;

    localStorage.setItem(
      LAST_UPDATE_EXPENSES_KEY,
      JSON.stringify(lastUpdateData)
    );

    const expenses = data?.record?.expenses;

    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    setExpenses(expenses);
  }

  useEffect(() => {
    const storedData = localStorage.getItem(EXPENSES_STORAGE_KEY);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setExpenses(parsedData);
        }
      } catch (error) {
        console.error(
          "Erro ao fazer parse dos dados de salário do localStorage:",
          error
        );
        localStorage.removeItem(EXPENSES_STORAGE_KEY);
      }
    }
  }, []);

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Registrar Gastos do Mês</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="text"
                    value={item.descricao}
                    onChange={(e) =>
                      handleChange(idx, "descricao", e.target.value)
                    }
                    placeholder="Ex: Conta de luz"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.categoria}
                    onChange={(e) =>
                      handleChange(idx, "categoria", e.target.value)
                    }
                    placeholder="Ex: Utilities"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={item.valor}
                    onChange={(e) => handleChange(idx, "valor", e.target.value)}
                    placeholder="Ex: 150"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className={styles.buttonsBalance} onClick={addExpense}>
          <FaPlus />
        </button>

        <button onClick={handleSave} className={styles.buttonsBalance}>
          <FaSave />
        </button>

        <button onClick={handleRefresh} className={styles.buttonsBalance}>
          <FaSyncAlt />
        </button>

        <button onClick={onDataSaved} className={styles.buttonsBalance}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
