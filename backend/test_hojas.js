const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, 'uploads');
const files = fs.readdirSync(uploadDir).filter(f => f.endsWith('.xlsx') && f.includes('ARECONSA'));

if (files.length === 0) {
  console.log('❌ No hay archivos ARECONSA en uploads/');
  console.log('Archivos disponibles:');
  fs.readdirSync(uploadDir).forEach(f => console.log('  -', f));
  process.exit(1);
}

const latestFile = files.sort().pop();
console.log('📄 Archivo:', latestFile);
console.log('📂 Ruta completa:', path.join(uploadDir, latestFile));
console.log('');

const workbook = XLSX.readFile(path.join(uploadDir, latestFile));
console.log('📊 Total de hojas:', workbook.SheetNames.length);
console.log('📋 Hojas encontradas:');
workbook.SheetNames.forEach((name, i) => {
  const sheet = workbook.Sheets[name];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  console.log(`   ${i + 1}. "${name}" → ${data.length} filas`);
});

console.log('');
console.log('🔍 Analizando hojas clave:');
['BG25', 'BG2024', 'DATOS 2025', 'DATOS 2024'].forEach(name => {
  if (workbook.SheetNames.includes(name)) {
    const sheet = workbook.Sheets[name];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    console.log(`   ✅ "${name}" existe → ${data.length} filas`);
    if (data.length > 0) {
      console.log(`      Encabezados: ${JSON.stringify(data[0]).substring(0, 200)}`);
    }
  } else {
    console.log(`   ❌ "${name}" NO existe`);
  }
});
