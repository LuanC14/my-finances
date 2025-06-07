import styles from "./Modal.module.css";
import { useAuth } from "../context/AuthContext";

const MY_FINANCES_SECURE_KEY = import.meta.env.VITE_MY_FINANCES_SECURE_KEY;
const API_ADDRESS = import.meta.env.VITE_API_ADDRESS;
const API_KEY = import.meta.env.VITE_API_KEY;

export function SettingsModal({ onClose }) {
  const { validKey, setValidKey } = useAuth(null);

  const handleAuth = async () => {
    const accessKey = prompt("Enviar ID de acesso");

    if (!accessKey) return;

    try {
      const res = await fetch(API_ADDRESS, {
        headers: {
          "X-Master-Key": API_KEY,
        },
      });

      if (!res.ok) throw new Error("Erro ao buscar dados");

      const data = await res.json();
      const keys = data?.record?.keys || [];

      if (keys.includes(accessKey)) {
        setValidKey(accessKey);
        localStorage.setItem(
          MY_FINANCES_SECURE_KEY,
          JSON.stringify([accessKey])
        );
      } else {
        setValidKey(null);
      }
    } catch (err) {
      alert(err);
    }
  };

  function handleLogout() {
    setValidKey(null);
    localStorage.removeItem(MY_FINANCES_SECURE_KEY);
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Obter acesso</h2>
        <p className={styles.modalDescription}>
          {validKey ? "Conectado." : "Nenhum usuário conectado."}
        </p>
        {!validKey && (
          <button className={styles.button} onClick={handleAuth}>
            Enviar ID de acesso
          </button>
        )}

        {validKey && (
          <button className={styles.buttonDanger} onClick={handleLogout}>
            Remover chave de acesso
          </button>
        )}
        <button onClick={onClose} className={styles.closeButton}>
          Fechar
        </button>
      </div>
    </div>
  );
}
