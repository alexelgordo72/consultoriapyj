import React, { useState, useEffect } from 'react';
import { fetchClientYears, generateFinancialSummary, downloadReportFile } from '../../services/api';

const DELIVERABLES = [
  { id: 'esf', name: '1. Estado de Situación Financiera (ESF)', desc: 'Balance general comparativo NIIF y consolidado' },
  { id: 'eri', name: '2. Estado de Resultados Integral (ERI)', desc: 'Ingresos, costos, gastos y utilidad neta' },
  { id: 'efc', name: '3. Estado de Flujos de Efectivo (EFC)', desc: 'Método indirecto: operación, inversión y financiación' },
  { id: 'ecp', name: '4. Estado de Cambios en el Patrimonio', desc: 'Variaciones de capital, reservas y ganancias acumuladas' },
  { id: 'indicadores', name: '5. Indicadores Financieros', desc: 'Liquidez, endeudamiento, ROA, ROE y márgenes' },
  { id: 'notas', name: '6. Notas a los Estados Financieros NIIF', desc: 'Revelaciones y desgloses contables Notas 1 a 30' },
  { id: 'certificacion', name: '7. Certificación Estados Financieros', desc: 'Art. 37 Ley 222 de 1995 (Rep. Legal y Contador)' },
  { id: 'dictamen', name: '8. Dictamen del Revisor Fiscal', desc: 'Informe bajo NIA 700 y Código de Comercio' },
  { id: 'gestion', name: '9. Informe de Gestión', desc: 'Art. 47 Ley 222 de 1995 y evolución ejecutiva' }
];

const Reports = ({ selectedClient }) => {
  const [years, setYears] = useState([2025, 2024]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [summary, setSummary] = useState(null);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    if (selectedClient?.id) {
      fetchClientYears(selectedClient.id).then(res => {
        if (res.years?.length) {
          setYears(res.years);
          setSelectedYear(res.years[0]);
        }
      });
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedClient?.id && selectedYear) {
      generateFinancialSummary(selectedClient.id, selectedYear)
        .then(setSummary)
        .catch(err => console.error(err));
    }
  }, [selectedClient, selectedYear]);

  const handleDownloadPDF = async (reportId) => {
    setDownloading(reportId);
    try {
      const safeName = (selectedClient?.name || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
      await downloadReportFile(
        'pdf',
        { clientId: selectedClient.id, year: selectedYear, reportType: reportId },
        `${reportId.toUpperCase()}_${safeName}_${selectedYear}.pdf`
      );
    } catch (e) {
      alert('❌ ' + e.message);
    } finally {
      setDownloading('');
    }
  };

  const handleDownloadExcel = async () => {
    setDownloading('excel');
    try {
      const safeName = (selectedClient?.name || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
      await downloadReportFile(
        'excel',
        { clientId: selectedClient.id, year: selectedYear },
        `NIIF_Consolidado_${safeName}_${selectedYear}.xlsx`
      );
    } catch (e) {
      alert('❌ ' + e.message);
    } finally {
      setDownloading('');
    }
  };

  const fmt = (v) => `$${Math.round(Number(v) || 0).toLocaleString('es-CO')}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px 20px', borderRadius: '12px', marginBottom: '20px' }}>
        <div>
          <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Año de Corte:</label>
          <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ padding: '8px 12px', borderRadius: '6px' }}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <button
          onClick={handleDownloadExcel}
          disabled={downloading === 'excel'}
          style={{ background: '#1F4E78', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {downloading === 'excel' ? 'Generando Excel...' : '📊 Descargar Libro Excel Formulado (.xlsx)'}
        </button>
      </div>

      {summary && summary.esf && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div className="dashboard-card">
            <h3>Activos Totales ({selectedYear})</h3>
            <div className="number" style={{ fontSize: '20px' }}>{fmt(summary.esf.totalActivoCurr)}</div>
            <div className="label">Anterior: {fmt(summary.esf.totalActivoPrev)}</div>
          </div>
          <div className="dashboard-card">
            <h3>Pasivos Totales ({selectedYear})</h3>
            <div className="number" style={{ fontSize: '20px' }}>{fmt(summary.esf.totalPasivoCurr)}</div>
            <div className="label">Anterior: {fmt(summary.esf.totalPasivoPrev)}</div>
          </div>
          <div className="dashboard-card">
            <h3>Patrimonio Total ({selectedYear})</h3>
            <div className="number" style={{ fontSize: '20px' }}>{fmt(summary.esf.totalPatrimonioCurr)}</div>
            <div className="label">Cuadre: {fmt(summary.esf.cuadreDiffCurr)}</div>
          </div>
          <div className="dashboard-card">
            <h3>Ingresos / Utilidad Neta</h3>
            <div className="number" style={{ fontSize: '20px', color: '#28a745' }}>{fmt(summary.eri.utilidadNetaCurr)}</div>
            <div className="label">Ingresos: {fmt(summary.eri.ingresosOrdCurr)}</div>
          </div>
        </div>
      )}

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px' }}>
        <h3 style={{ marginTop: 0 }}>📑 Paquete de 9 Informes Oficiales NIIF (PDF)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {DELIVERABLES.map(item => (
            <div key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ margin: '0 0 6px 0', color: '#1F4E78' }}>{item.name}</h4>
                <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#555' }}>{item.desc}</p>
              </div>
              <button
                onClick={() => handleDownloadPDF(item.id)}
                disabled={downloading === item.id}
                style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {downloading === item.id ? 'Generando PDF...' : '📥 Descargar PDF'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
