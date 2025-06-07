import { useState } from "react"; 
import styles from "./Modal.module.css";

export function SettingsModal({ onClose }) {
  const [jsonFileHandle, setJsonFileHandle] = useState(null); 

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Gerenciar JSON</h2>
        <p className={styles.modalDescription}>
          {jsonFileHandle ? "Um arquivo Json está conectado." : "Nenhum arquivo Json conectado."}
        </p>
        <button className={styles.button} onClick={()=> alert("JSON criado")}>
          Atualizar dados
        </button>

        {jsonFileHandle && (
          <button className={styles.buttonDanger} onClick={() => alert("Json removido")}>
            Remover JSON atual
          </button>
        )}
        <button onClick={onClose} className={styles.closeButton}>
          Fechar
        </button>
      </div>
    </div>
  );
}