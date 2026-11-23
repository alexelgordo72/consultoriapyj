import React, { useState, useEffect } from 'react';
import Sidebar from '../Layout/Sidebar';
import Clients from '../Clients/Clients';
import Files from '../Files/Files';
import Reports from '../Reports/Reports';
import Users from '../Users/Users';
import Profile from '../Profile/Profile';
import { fetchClients, fetchClientFiles } from '../../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(1);
  const [clientFilesCount, setClientFilesCount] = useState(0);

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientFiles(selectedClientId)
        .then(f => setClientFilesCount(f.length || 0))
        .catch(() => setClientFilesCount(0));
    }
  }, [selectedClientId]);

  const refreshAll = async () => {
    try {
      const list = await fetchClients();
      setClients(list);
      if (list.length > 0 && !list.some(c => c.id === selectedClientId)) {
        setSelectedClientId(list[0].id);
      }
      const cid = list.some(c => c.id === selectedClientId) ? selectedClientId : list[0]?.id;
      if (cid) {
        const files = await fetchClientFiles(cid);
        setClientFilesCount(files.length || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const selectedClient = clients.find(c => c.id === Number(selectedClientId)) || clients[0];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="dashboard-card">
              <h3>👥 Clientes Activos</h3>
              <div className="number">{clients.length}</div>
              <div className="label">Empresas registradas en PyJ</div>
            </div>
            <div className="dashboard-card">
              <h3>📁 Archivos del Cliente</h3>
              <div className="number">{clientFilesCount}</div>
              <div className="label">{selectedClient?.name || '—'}</div>
            </div>
            <div className="dashboard-card">
              <h3>📄 Entregables Disponibles</h3>
              <div className="number">9 + Excel</div>
              <div className="label">PDFs NIIF + Libro Formulado</div>
            </div>
            <div className="dashboard-card">
              <h3>👤 Consultor</h3>
              <div className="label" style={{ fontSize: '16px', fontWeight: 'bold' }}>{user?.fullName || user?.username}</div>
              <div className="label">Rol: {user?.role}</div>
            </div>
          </div>
        );
      case 'clients':
        return <Clients onClientCreated={(c) => { refreshAll(); setSelectedClientId(c.id); }} />;
      case 'files':
        return <Files selectedClient={selectedClient} onProcessed={refreshAll} />;
      case 'reports':
        return <Reports selectedClient={selectedClient} />;
      case 'users':
        return <Users />;
      case 'profile':
        return <Profile user={user} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar user={user} onLogout={onLogout} onNavigate={setCurrentPage} currentPage={currentPage} selectedClient={selectedClient} />
      <div className="dashboard-main">
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>
              {currentPage === 'dashboard' && '📊 Panel de Control PyJ'}
              {currentPage === 'clients' && '👥 Gestión de Clientes'}
              {currentPage === 'files' && '📁 Carga de Balances de Prueba'}
              {currentPage === 'reports' && '📄 Generación de Informes NIIF'}
              {currentPage === 'users' && '👤 Gestión de Usuarios'}
              {currentPage === 'profile' && '⚙️ Mi Perfil'}
            </h1>
            <p>Cliente activo: <strong>{selectedClient?.name || 'Ninguno'}</strong> ({selectedClient?.nit || ''})</p>
          </div>

          <div style={{ background: 'white', padding: '10px 14px', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <label style={{ fontSize: '12px', display: 'block', color: '#555', marginBottom: '4px' }}>Cambiar Empresa Cliente:</label>
            <select
              value={selectedClient?.id || ''}
              onChange={e => setSelectedClientId(Number(e.target.value))}
              style={{ padding: '6px 10px', borderRadius: '6px', minWidth: '260px', fontWeight: 'bold' }}
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.nit})</option>
              ))}
            </select>
          </div>
        </div>
        {renderPage()}
      </div>
    </div>
  );
};

export default Dashboard;
