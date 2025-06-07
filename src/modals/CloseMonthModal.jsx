import styles from './Modal.module.css';

export default function CloseMonthModal({ onClose }) {
  const handleReset = () => {
    alert('Saldo inicial e gastos zerados para novo ciclo!');
    onClose();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>Encerrar Mês</h2>
        <p>Essa ação irá zerar os saldos e gastos para um novo ciclo.</p>
        <button className={styles.resetButton} onClick={handleReset}>
          Zerar Mês
        </button>
        <button onClick={onClose} className={styles.closeButton}>
          Fechar
        </button>
      </div>
    </div>
  );
}