const XLSX = require('xlsx');
const { classifyAccount } = require('../niifEngine');

class LoggroParser {
  parseNumber(val) {
    if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
    if (val === null || val === undefined || val === '') return 0;
    const cleaned = String(val).replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  extractSheetRows(sheet, periodDate, sourceRole = 'empresa', shareFactor = 1) {
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!matrix || matrix.length === 0) return [];

    let headerIdx = -1;
    let colMap = { code: 0, name: 1, prev: 2, deb: 3, cred: 4, net: 5, final: 6, nit: -1, thirdName: -1 };

    for (let i = 0; i < Math.min(matrix.length, 20); i++) {
      const row = matrix[i].map(c => String(c || '').trim().toLowerCase());
      const cIdx = row.findIndex(c => c === 'cuenta' || c === 'codigo' || c === 'código');
      const fIdx = row.findIndex(c => c.includes('saldo final') || c === 'final' || c === 'saldo');
      const nIdx = row.findIndex(c => c === 'neto' || c.includes('movimiento'));
      if (cIdx !== -1 && (fIdx !== -1 || nIdx !== -1)) {
        headerIdx = i;
        colMap.code = cIdx;
        colMap.name = row.findIndex(c => c.includes('nombre') && !c.includes('contacto') && !c.includes('tercero'));
        if (colMap.name === -1) colMap.name = cIdx + 1;
        colMap.prev = row.findIndex(c => c.includes('anterior') || c.includes('inicial'));
        colMap.deb = row.findIndex(c => c.includes('débito') || c.includes('debito'));
        colMap.cred = row.findIndex(c => c.includes('crédito') || c.includes('credito'));
        colMap.net = nIdx;
        colMap.final = fIdx !== -1 ? fIdx : (nIdx + 1);
        colMap.nit = row.findIndex(c => c === 'contacto' || c === 'nit' || c === 'tercero' || c === 'identificacion' || c === 'identificación');
        colMap.thirdName = row.findIndex(c => c.includes('nombre contacto') || c.includes('nombre tercero') || c.includes('razon social') || c.includes('razón social'));
        break;
      }
    }

    if (headerIdx === -1) return [];

    const records = [];
    for (let i = headerIdx + 1; i < matrix.length; i++) {
      const r = matrix[i];
      if (!r || r.length === 0) continue;

      const rawCode = String(r[colMap.code] ?? '').trim();
      if (!/^\d{1,12}$/.test(rawCode)) continue;

      const accountName = String(r[colMap.name] ?? '').trim() || `Cuenta ${rawCode}`;
      const openingBalance = colMap.prev !== -1 ? this.parseNumber(r[colMap.prev]) * shareFactor : 0;
      const debits = colMap.deb !== -1 ? this.parseNumber(r[colMap.deb]) * shareFactor : 0;
      const credits = colMap.cred !== -1 ? this.parseNumber(r[colMap.cred]) * shareFactor : 0;
      const net = colMap.net !== -1 ? this.parseNumber(r[colMap.net]) * shareFactor : (debits - credits);
      const rawFinal = r[colMap.final];
      const closingBalance = (rawFinal !== undefined && rawFinal !== '')
        ? this.parseNumber(rawFinal) * shareFactor
        : (openingBalance + net);

      const thirdPartyNit = colMap.nit !== -1 ? String(r[colMap.nit] ?? '').trim() : '';
      const thirdPartyName = colMap.thirdName !== -1 ? String(r[colMap.thirdName] ?? '').trim() : '';

      const meta = classifyAccount(rawCode, accountName);

      records.push({
        accountCode: rawCode,
        accountName: accountName.slice(0, 250),
        accountLevel: rawCode.length <= 1 ? 1 : rawCode.length <= 2 ? 2 : rawCode.length <= 4 ? 3 : rawCode.length <= 6 ? 4 : 5,
        accountType: meta.group,
        periodDate,
        sourceRole,
        openingBalance,
        debits,
        credits,
        net,
        closingBalance,
        thirdPartyNit: thirdPartyNit || null,
        thirdPartyName: thirdPartyName ? thirdPartyName.slice(0, 250) : null
      });
    }

    return records;
  }

  async parse(filePath, options = {}) {
    const {
      periodYear = 2025,
      sourceRole = 'empresa',
      sharePercentage = 100
    } = options;

    const workbook = XLSX.readFile(filePath);
    const sheetNames = workbook.SheetNames;
    const shareFactor = sourceRole === 'consorcio' && sharePercentage > 0 && sharePercentage <= 100
      ? (sharePercentage / 100)
      : 1;

    let allRecords = [];
    const detectedPeriods = new Set();

    const datosSheets = sheetNames.filter(name => /^datos\s*\d{4}$/i.test(name.trim()));

    if (datosSheets.length > 0) {
      for (const sName of datosSheets) {
        const yearMatch = sName.match(/(\d{4})/);
        const yr = yearMatch ? parseInt(yearMatch[1], 10) : periodYear;
        const pDate = `${yr}-12-31`;
        const rows = this.extractSheetRows(workbook.Sheets[sName], pDate, sourceRole, shareFactor);
        if (rows.length > 0) {
          allRecords = allRecords.concat(rows);
          detectedPeriods.add(pDate);
        }
      }

      if (sheetNames.includes('Hoja1')) {
        const pDate = `${periodYear}-12-31`;
        const tpRows = this.extractSheetRows(workbook.Sheets['Hoja1'], pDate, sourceRole, shareFactor)
          .filter(r => r.thirdPartyNit && Math.abs(r.closingBalance) > 0);
        allRecords = allRecords.concat(tpRows);
      }
    } else {
      const pDate = `${periodYear}-12-31`;
      for (const sName of sheetNames) {
        const rows = this.extractSheetRows(workbook.Sheets[sName], pDate, sourceRole, shareFactor);
        if (rows.length > 0) {
          allRecords = allRecords.concat(rows);
          detectedPeriods.add(pDate);
          break;
        }
      }
    }

    if (allRecords.length === 0) {
      throw new Error('No se encontraron columnas válidas de Balance de Prueba (Cuenta, Nombre, Saldo Final) en el archivo Excel.');
    }

    return {
      records: allRecords,
      totalRecords: allRecords.length,
      periods: Array.from(detectedPeriods).sort()
    };
  }
}

module.exports = { LoggroParser };
