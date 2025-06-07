import { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { useAuth } from "../context/AuthContext";

const EXPENSES_STORAGE_KEY = import.meta.env.VITE_EXPENSES_STORAGE_KEY;

export default function ExpensesModal({ onClose }) {
  const [expenses, setExpenses] = useState([
    { descricao: "", categoria: "", valor: "" },
  ]);

  const { validKey } = useAuth();

  const [dataPreviouslyExisted, setDataPreviouslyExisted] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...expenses];
    updated[index][field] = value;
    setExpenses(updated);
  };

  const addExpense = () => {
    setExpenses([...expenses, { descricao: "", categoria: "", valor: "" }]);
  };

  function handleRequest(cleanedExpenses) {
    const method = dataPreviouslyExisted ? "PUT" : "POST";
    const apiUrl = "/api/salary";

    console.log(`Tentando ${method} para a API com os dados:`, cleanedExpenses);
    alert(
      `Simulando ${method} para ${apiUrl} com os dados: ${JSON.stringify(
        cleanedExpenses
      )}`
    );

    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(cleanedExpenses));
    console.log("Dados salvos no localStorage:", cleanedExpenses);
  }

  const handleSave = async () => {
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

    handleRequest(cleanedExpenses);
    onClose();
  };

  useEffect(() => {
    const storedData = localStorage.getItem(EXPENSES_STORAGE_KEY);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);

        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setExpenses(parsedData);
          setDataPreviouslyExisted(true);
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

        <button className={styles.addButton} onClick={addExpense}>
          + Adicionar Gasto
        </button>

        <button onClick={handleSave} className={styles.saveButton}>
          Salvar
        </button>

        <button onClick={onClose} className={styles.closeButton}>
          Fechar
        </button>
      </div>
    </div>
  );
}
