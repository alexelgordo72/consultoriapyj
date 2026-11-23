import React from 'react';

const Sidebar = ({ user, onLogout, onNavigate, currentPage, selectedClient }) => {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'clients', icon: '👥', label: 'Clientes' },
    { id: 'files', icon: '📁', label: 'Cargar Balances' },
    { id: 'reports', icon: '📄', label: 'Informes NIIF (9)' },
    { id: 'users', icon: '👤', label: 'Usuarios', adminOnly: true },
    { id: 'profile', icon: '⚙️', label: 'Perfil' }
  ];

  const filteredItems = menuItems.filter(item => !(item.adminOnly && user?.role !== 'admin'));

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>📊 PyJ Consultoría</h2>
        <p style={{ fontSize: '12px', opacity: 0.9 }}>{selectedClient?.name || 'Seleccione Cliente'}</p>
      </div>
      <nav className="sidebar-nav">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`sidebar-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <span className="user-name">{user?.fullName || user?.username}</span>
          <span className="user-role">{user?.role}</span>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
