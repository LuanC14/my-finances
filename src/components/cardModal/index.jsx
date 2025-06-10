import { FaPlus, FaSave, FaSyncAlt, FaTimes, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";

export default function BaseModal({
  title,
  headers,
  entries,
  onChange,
  onAdd,
  onDelete,
  onSave,
  onRefresh,
  onClose,
  renderRow,
}) {
  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>{title}</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((h, idx) => (
                <th key={idx}>{h}</th>
              ))}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, idx) => (
              <tr key={idx}>
                {renderRow(entry, idx, onChange)}
                <td>
                  <button
                    onClick={() => onDelete(idx)}
                    className={styles.cardModalDeleteButton}
                    title="Remover entrada"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className={styles.cardModalButton} onClick={onAdd}>
          <FaPlus />
        </button>

        <button onClick={onSave} className={styles.cardModalButton}>
          <FaSave />
        </button>

        <button onClick={onRefresh} className={styles.cardModalButton}>
          <FaSyncAlt />
        </button>

        <button onClick={onClose} className={styles.buttonsBalance}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
