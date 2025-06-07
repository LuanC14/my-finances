import { useEffect, useState } from "react";
import styles from "./Modal.module.css";

const SALARY_STORAGE_KEY = 'myFinances_salaryData';

export default function SalaryModal({ onClose, onDataSaved  }) {
  const [entries, setEntries] = useState([{ tipo: "Salário", valor: "" }]);
  const [dataPreviouslyExisted, setDataPreviouslyExisted] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...entries];
    updated[index][field] = value;
    setEntries(updated);
  };

  const addEntry = () => {
    setEntries([...entries, { tipo: "", valor: "" }]);
  };

  const handleSave = async () => {
    const cleanedEntries = entries.filter(entry =>
      entry.tipo.trim() !== '' &&
      !isNaN(parseFloat(entry.valor)) &&
      parseFloat(entry.valor) > 0
    ).map(entry => ({
      tipo: entry.tipo.trim(),
      valor: parseFloat(entry.valor)
    }));

    if (cleanedEntries.length === 0) {
      alert("Por favor, preencha pelo menos uma entrada de salário/receita válida antes de salvar.");
      return;
    }

    const method = dataPreviouslyExisted ? 'PUT' : 'POST';
    const apiUrl = '/api/salary';

    console.log(`Tentando ${method} para a API com os dados:`, cleanedEntries);
    alert(`Simulando ${method} para ${apiUrl} com os dados: ${JSON.stringify(cleanedEntries)}`);

    localStorage.setItem(SALARY_STORAGE_KEY, JSON.stringify(cleanedEntries));
    console.log("Dados salvos no localStorage:", cleanedEntries);

    if (onDataSaved) {
      onDataSaved();
    }
  }

  useEffect(() => {
    const storedData = localStorage.getItem(SALARY_STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          setEntries(parsedData);
          setDataPreviouslyExisted(true);
        }
      } catch (error) {
        console.error("Erro ao fazer parse dos dados de salário do localStorage:", error);
        localStorage.removeItem(SALARY_STORAGE_KEY);
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

        <button className={styles.addButton} onClick={addEntry}>
          + Adicionar Entrada
        </button>

        <button onClick={handleSave} className={styles.saveButton}>
          Salvar
        </button>

        <button onClick={onClose} className={styles.closeButton}>
          Cancelar
        </button>
      </div>
    </div>
  );
}
