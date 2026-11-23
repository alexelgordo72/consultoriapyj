const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.xlsx') && f.includes('ARECONSA'));
const latestFile = files.sort().pop();

const workbook = XLSX.readFile(path.join(uploadDir, latestFile));
const sheet = workbook.Sheets['BG25'];
const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

console.log('📊 BG25 - TODAS LAS FILAS CON DATOS:\n');
jsonData.forEach((row, i) => {
  if (!row || row.length === 0) return;
  const text = row.filter(c => c !== null && c !== undefined).join(' | ');
  if (text.length > 3) {
    console.log(`Fila ${i}: ${text.substring(0, 150)}`);
  }
});
