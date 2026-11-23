import React, { useState, useEffect } from 'react';
import { fetchClientFiles, uploadBalanceFile, deleteClientFile } from '../../services/api';

const Files = ({ selectedClient, onProcessed }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [periodYear, setPeriodYear] = useState('2025');
  const [sourceRole, setSourceRole] = useState('empresa');
  const [sharePercentage, setSharePercentage] = useState('100');

  useEffect(() => {
    if (selectedClient?.id) loadFiles();
  }, [selectedClient]);

  const loadFiles = async () => {
    try {
      const data = await fetchClientFiles(selectedClient.id);
      setFiles(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedClient?.id) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('clientId', selectedClient.id);
    formData.append('periodYear', periodYear);
    formData.append('sourceRole', sourceRole);
    formData.append('sharePercentage', sourceRole === 'consorcio' ? sharePercentage : '100');

    try {
      const res = await uploadBalanceFile(formData);
      alert(`✅ Procesado correctamente.\nPeriodos cargados: ${res.periods.join(', ')}\nCuentas PUC: ${res.savedAccounts} | Registros: ${res.savedBalances}`);
      setSelectedFile(null);
      await loadFiles();
      if (onProcessed) onProcessed();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este archivo y sus saldos asociados?')) return;
    try {
      await deleteClientFile(id);
      await loadFiles();
      if (onProcessed) onProcessed();
    } catch (e) {
      alert('❌ ' + e.message);
    }
  };

  return (
    <div>
      <div className="upload-section" style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Año de Corte</label>
          <select value={periodYear} onChange={e => setPeriodYear(e.target.value)} style={{ padding: '8px', borderRadius: '6px' }}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Origen del Balance</label>
          <select value={sourceRole} onChange={e => setSourceRole(e.target.value)} style={{ padding: '8px', borderRadius: '6px' }}>
            <option value="empresa">Empresa Principal (Loggro / Libro NIIF)</option>
            <option value="consorcio">Consorcio / Unión Temporal</option><option value="terceros">Auxiliar por Terceros (Cartera / Proveedores)</option>
          </select>
        </div>

        {sourceRole === 'consorcio' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>% Participación</label>
            <input type="number" min="1" max="100" value={sharePercentage} onChange={e => setSharePercentage(e.target.value)} style={{ width: '90px', padding: '8px', borderRadius: '6px' }} />
          </div>
        )}

        <div style={{ flex: 1, minWidth: '220px' }}>
          <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Archivo Excel de Loggro (.xlsx / .xls)</label>
          <input type="file" accept=".xlsx,.xls" onChange={e => setSelectedFile(e.target.files[0])} />
        </div>

        <button className="btn-primary" onClick={handleUpload} disabled={!selectedFile || uploading}>
          {uploading ? 'Procesando PUC...' : '📤 Subir y Procesar'}
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Archivo</th>
              <th>Año</th>
              <th>Origen</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {files.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', color: '#777' }}>No hay balances cargados aún para {selectedClient?.name}.</td></tr>
            ) : files.map(f => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>{f.file_name}</td>
                <td>{f.period_year || 'Multi'}</td>
                <td>{f.source_role === 'consorcio' ? 'Consorcio' : 'Empresa'}</td>
                <td><span style={{ color: '#28a745', fontWeight: 'bold' }}>{f.status}</span></td>
                <td>{new Date(f.upload_date).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleDelete(f.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Files;
