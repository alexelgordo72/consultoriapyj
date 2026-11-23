import React, { useState, useEffect } from 'react';
import { fetchClients, createClient } from '../../services/api';

const Clients = ({ onClientCreated }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', nit: '', email: '', phone: '', address: '', city: 'Yumbo - Valle del Cauca',
    incorporation_info: '', corporate_purpose: '', company_size: 'Pyme - NIIF Grupo 2',
    legal_representative: '', accountant_name: '', accountant_tp: '',
    auditor_name: '', auditor_tp: '', consortium_name: '', consortium_share: 0
  });

  useEffect(() => { loadClients(); }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const created = await createClient(form);
      setShowForm(false);
      setForm({
        name: '', nit: '', email: '', phone: '', address: '', city: 'Yumbo - Valle del Cauca',
        incorporation_info: '', corporate_purpose: '', company_size: 'Pyme - NIIF Grupo 2',
        legal_representative: '', accountant_name: '', accountant_tp: '',
        auditor_name: '', auditor_tp: '', consortium_name: '', consortium_share: 0
      });
      await loadClients();
      if (onClientCreated) onClientCreated(created);
    } catch (err) {
      alert('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Cargando clientes...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ margin: 0, color: '#555' }}>Empresas configuradas para procesamiento NIIF y emisión de informes:</p>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✖ Cerrar Formulario' : '➕ Nuevo Cliente'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginTop: 0 }}>Registrar Nueva Empresa Cliente</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div>
              <label>Razón Social *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej. CONSTRUCTORA ABC SAS" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>NIT *</label>
              <input required value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} placeholder="Ej. 900.123.456 - 7" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Correo Electrónico</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Dirección y Ciudad</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Dirección sede principal" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Representante Legal</label>
              <input value={form.legal_representative} onChange={e => setForm({ ...form, legal_representative: e.target.value })} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Contador Público</label>
              <input value={form.accountant_name} onChange={e => setForm({ ...form, accountant_name: e.target.value })} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>T.P. Contador</label>
              <input value={form.accountant_tp} onChange={e => setForm({ ...form, accountant_tp: e.target.value })} placeholder="Ej. T.P. 274927-T" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Revisor Fiscal (Opcional)</label>
              <input value={form.auditor_name} onChange={e => setForm({ ...form, auditor_name: e.target.value })} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>T.P. Revisor Fiscal</label>
              <input value={form.auditor_tp} onChange={e => setForm({ ...form, auditor_tp: e.target.value })} placeholder="Ej. T.P. 192582-T" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Consorcio Asociado (Opcional)</label>
              <input value={form.consortium_name} onChange={e => setForm({ ...form, consortium_name: e.target.value })} placeholder="Nombre consorcio" style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>% Participación Consorcio</label>
              <input type="number" min="0" max="100" step="0.01" value={form.consortium_share} onChange={e => setForm({ ...form, consortium_share: e.target.value })} style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <label>Objeto Social Principal (para Notas NIIF)</label>
            <textarea rows="2" value={form.corporate_purpose} onChange={e => setForm({ ...form, corporate_purpose: e.target.value })} style={{ width: '100%', padding: '8px' }} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving} style={{ marginTop: '12px' }}>
            {saving ? 'Guardando...' : '💾 Guardar Cliente'}
          </button>
        </form>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Razón Social</th>
              <th>NIT</th>
              <th>Representante Legal</th>
              <th>Contador</th>
              <th>Archivos</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(c => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td><strong>{c.name}</strong></td>
                <td>{c.nit}</td>
                <td>{c.legal_representative || '—'}</td>
                <td>{c.accountant_name || '—'}</td>
                <td>{c.files_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
