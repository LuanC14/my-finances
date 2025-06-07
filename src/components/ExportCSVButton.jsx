import React from 'react';
import Papa from 'papaparse';

// Botão para exportar dados como CSV
export function ExportCSVButton({ data, filename }) {
  const handleExport = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'dados.csv');
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={handleExport} style={{ margin: '10px 0' }}>
      Exportar CSV
    </button>
  );
}

// Input para importar CSV e enviar os dados lidos para um callback
export function ImportCSV({ onDataLoaded }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onDataLoaded(results.data);
      },
      error: (err) => {
        alert('Erro ao ler CSV: ' + err.message);
      },
    });
  };

  return (
    <input
      type="file"
      accept=".csv"
      onChange={handleFileChange}
      style={{ margin: '10px 0' }}
    />
  );
}
