const pool = require('../services/database');
const { buildFinancialStatements } = require('../services/niifEngine');
const PDFGenerator = require('../services/pdfGenerator');
const ExcelGenerator = require('../services/excelGenerator');

async function computeClientStatements(clientId, yearCurrent) {
  const yrCurr = parseInt(yearCurrent, 10) || 2025;
  const yrPrev = yrCurr - 1;

  const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1', [clientId]);
  if (clientRes.rows.length === 0) {
    throw new Error('Cliente no encontrado');
  }
  const client = clientRes.rows[0];

  const currRes = await pool.query(
    `SELECT account_code, source_role, closing_balance, third_party_nit, third_party_name
     FROM accounting_balances
     WHERE client_id = $1 AND period_date = $2`,
    [clientId, `${yrCurr}-12-31`]
  );

  const prevRes = await pool.query(
    `SELECT account_code, source_role, closing_balance, third_party_nit, third_party_name
     FROM accounting_balances
     WHERE client_id = $1 AND period_date = $2`,
    [clientId, `${yrPrev}-12-31`]
  );

  return buildFinancialStatements({
    client,
    rowsCurrent: currRes.rows,
    rowsPrev: prevRes.rows,
    yearCurrent: yrCurr,
    yearPrev: yrPrev
  });
}

const generateReport = async (req, res) => {
  try {
    const clientId = parseInt(req.body.clientId || req.body.tenantId || 1, 10);
    const year = req.body.year || (req.body.period ? String(req.body.period).slice(0, 4) : 2025);

    const statements = await computeClientStatements(clientId, year);
    res.json({
      success: true,
      client: statements.client,
      yearCurrent: statements.yearCurrent,
      yearPrev: statements.yearPrev,
      esf: statements.esf,
      eri: statements.eri,
      efc: statements.efc,
      ecp: statements.ecp,
      indicators: statements.indicators
    });
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: error.message });
  }
};

const generatePDF = async (req, res) => {
  try {
    const clientId = parseInt(req.body.clientId || req.body.tenantId || 1, 10);
    const year = req.body.year || (req.body.period ? String(req.body.period).slice(0, 4) : 2025);
    const reportType = req.body.reportType || 'balance';

    const statements = await computeClientStatements(clientId, year);
    const generator = new PDFGenerator();
    const safeClient = (statements.client.name || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const pdfPath = `/tmp/${reportType}-${safeClient}-${year}-${Date.now()}.pdf`;

    switch (reportType) {
      case 'balance':
      case 'esf':
        await generator.generateBalanceSheet(statements, pdfPath);
        break;
      case 'income':
      case 'eri':
        await generator.generateIncomeStatement(statements, pdfPath);
        break;
      case 'cashflow':
      case 'efc':
        await generator.generateCashFlow(statements, pdfPath);
        break;
      case 'equity':
      case 'ecp':
        await generator.generateEquityStatement(statements, pdfPath);
        break;
      case 'indicators':
      case 'indicadores':
        await generator.generateIndicators(statements, pdfPath);
        break;
      case 'notes':
      case 'notas':
        await generator.generateNotes(statements, pdfPath);
        break;
      case 'certification':
      case 'certificacion':
        await generator.generateCertification(statements, pdfPath);
        break;
      case 'audit':
      case 'dictamen':
        await generator.generateAuditReport(statements, pdfPath);
        break;
      case 'management':
      case 'gestion':
        await generator.generateManagementReport(statements, pdfPath);
        break;
      default:
        return res.status(400).json({ error: `Tipo de informe no válido: ${reportType}` });
    }

    res.download(pdfPath, `${reportType.toUpperCase()}_${safeClient}_${year}.pdf`);
  } catch (error) {
    console.error('Error generando PDF:', error);
    res.status(500).json({ error: error.message });
  }
};

const generateExcel = async (req, res) => {
  try {
    const clientId = parseInt(req.body.clientId || 1, 10);
    const year = req.body.year || 2025;

    const statements = await computeClientStatements(clientId, year);
    const generator = new ExcelGenerator();
    const safeClient = (statements.client.name || 'Cliente').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const xlsxPath = `/tmp/NIIF_${safeClient}_${year}_${Date.now()}.xlsx`;

    await generator.generateConsolidatedWorkbook(statements, xlsxPath);
    res.download(xlsxPath, `NIIF_Consolidado_${safeClient}_${year}.xlsx`);
  } catch (error) {
    console.error('Error generando Excel:', error);
    res.status(500).json({ error: error.message });
  }
};

const hasData = async (req, res) => {
  try {
    const { clientId, period } = req.params;
    const result = await pool.query(
      'SELECT COUNT(*) as total FROM accounting_balances WHERE client_id = $1 AND period_date = $2',
      [clientId, period]
    );
    res.json({ hasData: parseInt(result.rows[0].total, 10) > 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getYears = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await pool.query(
      'SELECT DISTINCT EXTRACT(YEAR FROM period_date)::int AS yr FROM accounting_balances WHERE client_id = $1 ORDER BY yr DESC',
      [clientId]
    );
    const years = result.rows.map(r => r.yr);
    res.json({ years: years.length > 0 ? years : [2025, 2024] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { generateReport, generatePDF, generateExcel, hasData, getYears };
