const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.xlsx') && f.includes('ARECONSA'));
if (files.length === 0) { console.log('❌ No hay archivos'); process.exit(1); }
const latestFile = files.sort().pop();
const workbook = XLSX.readFile(path.join(uploadDir, latestFile));

const hojas = ['ERyGA 2025-2024 Oficial Súper', 'E.F.EFECT. 2025-2024', 'E.C. PATRIM 2025-2024', 'Indicadores'];

hojas.forEach(nombre => {
  if (!workbook.SheetNames.includes(nombre)) {
    console.log(`\n❌ No existe: "${nombre}"`);
    return;
  }
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📋 HOJA: "${nombre}"`);
  console.log('='.repeat(80));
  const sheet = workbook.Sheets[nombre];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  jsonData.forEach((row, i) => {
    if (!row || row.length === 0) return;
    const text = row.filter(c => c !== null && c !== undefined).join(' | ');
    if (text.length > 3) {
      console.log(`Fila ${String(i).padStart(3)}: ${text.substring(0, 180)}`);
    }
  });
});
