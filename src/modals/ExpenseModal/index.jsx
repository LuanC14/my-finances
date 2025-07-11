import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import _ from "lodash";
import { handleGetExpenses, handlePost } from "../../api/api";
import BaseModal from "../../components/cardModal";

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

  const deleteExpense = (index) => {
    const updated = [...expenses];
    updated.splice(index, 1);

    if (updated.length === 0) {
      setExpenses([{ descricao: "", categoria: "", valor: "" }]);
    } else {
      setExpenses(updated);
    }
  };

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

    const url = `${API_BASE_URL}/${API_EXPENSES_BIN_RESOURCE}`;

    const body = { expenses: cleanedExpenses };

    const result = await handlePost(
      url,
      API_KEY,
      validKey,
      body,
      LAST_UPDATE_EXPENSES_KEY
    );

    if (result.ok) {
      localStorage.setItem(
        LAST_UPDATE_EXPENSES_KEY,
        JSON.stringify(result.timestamp)
      );

      localStorage.setItem(
        EXPENSES_STORAGE_KEY,
        JSON.stringify(cleanedExpenses)
      );

      onDataSaved();
    } else {
      alert("Ocorreu um erro ao processar os dados. Verifique o console.");
    }
  };

  async function handleRefresh() {
    const url = `${API_BASE_URL}/${API_EXPENSES_BIN_RESOURCE}`;

    console.log("Chamando handleGetExpenses");

    const result = await handleGetExpenses(url, API_KEY);

    if (result.ok) {
      localStorage.setItem(
        LAST_UPDATE_EXPENSES_KEY,
        JSON.stringify(result.body.timestamp)
      );

      localStorage.setItem(
        EXPENSES_STORAGE_KEY,
        JSON.stringify(result.body.expenses)
      );

      setExpenses(result.body.expenses);
    } else {
      alert("Erro ao atualizar");
    }
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
    <BaseModal
      title="Registrar Gastos do Mês"
      headers={["Descrição", "Categoria", "Valor (R$)"]}
      entries={expenses}
      onChange={handleChange}
      onAdd={addExpense}
      onDelete={deleteExpense}
      onSave={handleSave}
      onRefresh={handleRefresh}
      onClose={onDataSaved}
      renderRow={(item, idx, onChange) => (
        <>
          <td>
            <input
              type="text"
              value={item.descricao}
              onChange={(e) => onChange(idx, "descricao", e.target.value)}
              placeholder="Ex: Conta de luz"
            />
          </td>
          <td>
            <input
              type="text"
              value={item.categoria}
              onChange={(e) => onChange(idx, "categoria", e.target.value)}
              placeholder="Ex: Utilities"
            />
          </td>
          <td>
            <input
              type="number"
              value={item.valor}
              onChange={(e) => onChange(idx, "valor", e.target.value)}
              placeholder="Ex: 150"
            />
          </td>
        </>
      )}
    />
  );
}
