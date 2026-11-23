import React from 'react';

const FormatManager = () => {
    const formats = [
        { id: 'balance', name: 'Estado de Situación Financiera', icon: '📊' },
        { id: 'income', name: 'Estado de Resultados Integral', icon: '📈' },
        { id: 'cashflow', name: 'Estado de Flujos de Efectivo', icon: '💰' },
        { id: 'equity', name: 'Estado de Cambios en el Patrimonio', icon: '📊' },
        { id: 'indicators', name: 'Indicadores Financieros', icon: '📉' }
    ];

    const downloadFormat = async (formatId) => {
        try {
            const response = await fetch('http://10.147.17.6:4000/api/reports/pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: 1,
                    period: '2025-12-31',
                    reportType: formatId
                })
            });
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${formatId}-2025.pdf`;
            a.click();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <div className="format-grid">
            {formats.map(format => (
                <div key={format.id} className="format-card">
                    <div className="format-icon">{format.icon}</div>
                    <div className="format-info">
                        <h4>{format.name}</h4>
                    </div>
                    <button onClick={() => downloadFormat(format.id)} style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
                        📥 Descargar
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FormatManager;
