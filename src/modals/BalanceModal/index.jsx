import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import _ from "lodash";
import { handleGetBalance, handlePost } from "../../api/api";
import BaseModal from "../../components/cardModal";

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

  const deleteEntry = (index) => {
    const updated = [...entries];
    updated.splice(index, 1);

    if (updated.length === 0) {
      setEntries([{ tipo: "", valor: "" }]);
    } else {
      setEntries(updated);
    }
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
    <BaseModal
      title="Registrar Saldo Inicial"
      headers={["Tipo", "Valor (R$)"]}
      entries={entries}
      onChange={handleChange}
      onAdd={addEntry}
      onDelete={deleteEntry}
      onSave={handleSave}
      onRefresh={handleRefresh}
      onClose={onDataSaved}
      renderRow={(entry, idx, onChange) => (
        <>
          <td>
            <input
              type="text"
              value={entry.tipo}
              onChange={(e) => onChange(idx, "tipo", e.target.value)}
              placeholder="Ex: Salário"
            />
          </td>
          <td>
            <input
              type="number"
              value={entry.valor}
              onChange={(e) => onChange(idx, "valor", e.target.value)}
              placeholder="Ex: 5000"
            />
          </td>
        </>
      )}
    />
  );
}
