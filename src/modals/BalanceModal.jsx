import { useEffect, useState } from "react";
import styles from "./Modal.module.css";
import { useAuth } from "../context/AuthContext";
import _ from "lodash";
import { FaSave, FaTimes, FaSyncAlt, FaPlus } from "react-icons/fa";
import { handleGetBalance, handlePost } from "../api/api";

const BALANCE_STORAGE_KEY = import.meta.env.VITE_BALANCE_STORAGE_KEY;
const LAST_UPDATE_BALANCE_KEY = import.meta.env.VITE_LAST_UPDATE_BALANCE_KEY;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_SALARY_BIN_RESOURCE = import.meta.env.VITE_API_SALARY_BIN_RESOURCE;
const API_KEY = import.meta.env.VITE_API_KEY;

export default function BalanceModal({ onDataSaved }) {
  const [entries, setEntries] = useState([{ tipo: "Salário", valor: "" }]);
  const { validKey } = useAuth();

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { tipo: "", valor: "" }]);
  };

  const handleSave = async () => {
    const previousEntries = JSON.parse(
      localStorage.getItem(BALANCE_STORAGE_KEY)
    );

    if (_.isEqual(entries, previousEntries)) {
      console.log("Nenhuma alteração encontrada");
      onDataSaved();
      return;
    }

    if (!validKey) {
      alert("Você não está autenticado");
      return;
    }

    const cleanedEntries = entries
      .filter(
        (entry) =>
          entry.tipo.trim() !== "" &&
          !isNaN(parseFloat(entry.valor)) &&
          parseFloat(entry.valor) > 0
      )
      .map((entry) => ({
        tipo: entry.tipo.trim(),
        valor: parseFloat(entry.valor),
      }));

    if (cleanedEntries.length === 0) {
      alert(
        "Por favor, preencha pelo menos uma entrada de salário/receita válida antes de salvar."
      );
      return;
    }
    const url = `${API_BASE_URL}/${API_SALARY_BIN_RESOURCE}`;

    const body = { balance: cleanedEntries };

    const result = await handlePost(
      url,
      API_KEY,
      validKey,
      body,
      LAST_UPDATE_BALANCE_KEY
    );

    if (result.ok) {
      localStorage.setItem(
        LAST_UPDATE_BALANCE_KEY,
        JSON.stringify(result.timestamp)
      );

      localStorage.setItem(BALANCE_STORAGE_KEY, JSON.stringify(cleanedEntries));

      onDataSaved();
    } else {
      alert("Ocorreu um erro ao processar os dados. Verifique o console.");
    }
  };

  async function handleRefresh() {
    const url = `${API_BASE_URL}/${API_SALARY_BIN_RESOURCE}`;

    const result = await handleGetBalance(url, API_KEY);

    if (result.ok) {
      localStorage.setItem(
        LAST_UPDATE_BALANCE_KEY,
        JSON.stringify(result.body.timestamp)
      );

      localStorage.setItem(
        BALANCE_STORAGE_KEY,
        JSON.stringify(result.body.balances)
      );
      setEntries(entries);
    } else {
      alert("Erro ao atualizar");
    }
  }

  useEffect(() => {
    const storedData = localStorage.getItem(BALANCE_STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setEntries(parsedData);
        }
      } catch (error) {
        console.error(
          "Erro ao fazer parse dos dados de salário do localStorage:",
          error
        );
        localStorage.removeItem(BALANCE_STORAGE_KEY);
      }
    }
  }, []);

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Registrar Saldo Inicial</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Valor (R$)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={idx}>
                <td>
                  <input
                    type="text"
                    value={entry.tipo}
                    onChange={(e) => handleChange(idx, "tipo", e.target.value)}
                    placeholder="Ex: Salário"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={entry.valor}
                    onChange={(e) => handleChange(idx, "valor", e.target.value)}
                    placeholder="Ex: 5000"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className={styles.buttonsBalance} onClick={addEntry}>
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
