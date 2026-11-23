const PDFDocument = require('pdfkit');
const fs = require('fs');

class PDFGenerator {
  constructor() {
    this.left = 45;
    this.right = 550;
    this.width = 505;
  }

  fmt(val) {
    const n = Number(val) || 0;
    if (Math.abs(n) < 0.5) return '$0';
    const sign = n < 0 ? '-' : '';
    return `${sign}$${Math.round(Math.abs(n)).toLocaleString('es-CO')}`;
  }

  pct(val) {
    return `${(Number(val) || 0).toFixed(2)}%`;
  }

  createDoc() {
    return new PDFDocument({ size: 'A4', margin: 45, bufferPages: true });
  }

  addHeader(doc, client, title, yearCurrent, yearPrev) {
    doc.font('Helvetica-Bold').fontSize(12)
      .text((client.name || 'EMPRESA CONSULTADA').toUpperCase(), this.left, 42, { align: 'center', width: this.width });
    doc.font('Helvetica').fontSize(9.5)
      .text(`NIT. ${client.nit || 'N/A'}`, { align: 'center', width: this.width });
    doc.moveDown(0.25);
    doc.font('Helvetica-Bold').fontSize(11)
      .text(title.toUpperCase(), { align: 'center', width: this.width });
    doc.font('Helvetica').fontSize(9)
      .text(`AL 31 DE DICIEMBRE DE ${yearCurrent} Y AL 31 DE DICIEMBRE DE ${yearPrev}`, { align: 'center', width: this.width });
    doc.fontSize(8).fillColor('#555555')
      .text('Cifras expresadas en pesos colombianos - COP$', { align: 'center', width: this.width });
    doc.fillColor('#000000').moveDown(0.6);
    doc.moveTo(this.left, doc.y).lineTo(this.right, doc.y).strokeColor('#1F4E78').lineWidth(1).stroke();
    doc.moveDown(0.5);
  }

  addSignatures(doc, client) {
    if (doc.y > 680) doc.addPage();
    doc.moveDown(1.8);
    const y = doc.y;
    const colW = 160;

    doc.moveTo(this.left, y).lineTo(this.left + colW - 10, y).strokeColor('#333333').lineWidth(0.7).stroke();
    doc.moveTo(this.left + colW, y).lineTo(this.left + colW * 2 - 10, y).stroke();
    if (client.auditor_name) {
      doc.moveTo(this.left + colW * 2, y).lineTo(this.left + colW * 3 - 5, y).stroke();
    }

    doc.font('Helvetica-Bold').fontSize(8);
    doc.text(client.legal_representative || 'REPRESENTANTE LEGAL', this.left, y + 4, { width: colW - 10 });
    doc.text(client.accountant_name || 'CONTADOR PÚBLICO', this.left + colW, y + 4, { width: colW - 10 });
    if (client.auditor_name) {
      doc.text(client.auditor_name, this.left + colW * 2, y + 4, { width: colW - 5 });
    }

    doc.font('Helvetica').fontSize(7.5).fillColor('#444444');
    doc.text('Representante Legal', this.left, y + 15, { width: colW - 10 });
    doc.text(`Contador Público ${client.accountant_tp || ''}`, this.left + colW, y + 15, { width: colW - 10 });
    if (client.auditor_name) {
      doc.text(`Revisor Fiscal ${client.auditor_tp || ''}`, this.left + colW * 2, y + 15, { width: colW - 5 });
    }
    doc.fillColor('#000000');
  }

  addFooters(doc) {
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.font('Helvetica').fontSize(7).fillColor('#666666')
        .text('Las notas adjuntas forman parte integral de los Estados Financieros bajo NIIF.', this.left, 785, { align: 'center', width: this.width })
        .text(`Página ${i + 1} de ${range.count}`, this.left, 796, { align: 'center', width: this.width });
    }
    doc.fillColor('#000000');
  }

  drawTableRow(doc, cols, widths, opts = {}) {
    if (doc.y > 745) doc.addPage();
    const y = doc.y;
    const h = opts.height || 15;

    if (opts.bg) {
      doc.save();
      doc.rect(this.left, y - 2, this.width, h).fill(opts.bg);
      doc.restore();
    }

    doc.font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(opts.size || 8);
    let x = this.left;
    cols.forEach((txt, idx) => {
      const align = idx === 0 ? 'left' : (idx === 1 && opts.hasNote ? 'center' : 'right');
      doc.text(String(txt ?? ''), x + 2, y, { width: widths[idx] - 4, align });
      x += widths[idx];
    });
    doc.y = y + h;
  }

  writePdf(doc, outputPath) {
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);
      this.addFooters(doc);
      doc.end();
      stream.on('finish', () => resolve(outputPath));
      stream.on('error', reject);
    });
  }

  // 1. ESF - Estado de Situación Financiera
  generateBalanceSheet(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, esf } = st;
    this.addHeader(doc, client, 'ESTADO DE SITUACIÓN FINANCIERA', yearCurrent, yearPrev);

    const w = [215, 35, 85, 85, 85];
    this.drawTableRow(doc, ['CONCEPTO', 'Nota', 'Empresa', `Consolidado ${yearCurrent}`, `Consolidado ${yearPrev}`], w, { bold: true, bg: '#E8EEF5', hasNote: true, height: 18 });

    const rows = [
      { c: ['ACTIVOS CORRIENTES', '', '', '', ''], bold: true },
      { c: ['Efectivo y equivalentes al efectivo', '4', this.fmt(esf.efectivoEmp), this.fmt(esf.efectivoCurr), this.fmt(esf.efectivoPrev)] },
      { c: ['Deudores comerciales y otras cuentas por cobrar', '5', this.fmt(esf.deudoresCpEmp), this.fmt(esf.deudoresCpCurr), this.fmt(esf.deudoresCpPrev)] },
      { c: ['Anticipo por impuestos corrientes', '6', this.fmt(esf.anticipoImpCurr), this.fmt(esf.anticipoImpCurr), this.fmt(esf.anticipoImpPrev)] },
      { c: ['Inventarios', '7', this.fmt(esf.inventariosCurr), this.fmt(esf.inventariosCurr), this.fmt(esf.inventariosPrev)] },
      { c: ['TOTAL ACTIVOS CORRIENTES', '', this.fmt(esf.activoCorrienteCurr), this.fmt(esf.activoCorrienteCurr), this.fmt(esf.activoCorrientePrev)], bold: true, bg: '#F4F6F9' },
      { c: ['ACTIVOS NO CORRIENTES', '', '', '', ''], bold: true },
      { c: ['Propiedades, planta y equipo (Neto)', '8', this.fmt(esf.ppeNetoCurr), this.fmt(esf.ppeNetoCurr), this.fmt(esf.ppeNetoPrev)] },
      { c: ['Deudores comerciales y otras CxC largo plazo', '9', this.fmt(esf.deudoresLpCurr), this.fmt(esf.deudoresLpCurr), this.fmt(esf.deudoresLpPrev)] },
      { c: ['Activos intangibles y pagos anticipados', '10', this.fmt(esf.intangiblesCurr + esf.pagosAnticipadosCurr), this.fmt(esf.intangiblesCurr + esf.pagosAnticipadosCurr), this.fmt(esf.intangiblesPrev + esf.pagosAnticipadosPrev)] },
      { c: ['TOTAL ACTIVOS NO CORRIENTES', '', this.fmt(esf.activoNoCorrienteCurr), this.fmt(esf.activoNoCorrienteCurr), this.fmt(esf.activoNoCorrientePrev)], bold: true, bg: '#F4F6F9' },
      { c: ['ACTIVOS TOTALES', '', this.fmt(esf.totalActivoCurr), this.fmt(esf.totalActivoCurr), this.fmt(esf.totalActivoPrev)], bold: true, bg: '#D9E1F2', height: 18 },
      { c: ['PASIVOS CORRIENTES', '', '', '', ''], bold: true },
      { c: ['Obligaciones financieras a corto plazo', '11', this.fmt(esf.obligFinCpCurr), this.fmt(esf.obligFinCpCurr), this.fmt(esf.obligFinCpPrev)] },
      { c: ['Acreedores comerciales y otras CxP corto plazo', '12', this.fmt(esf.acreedoresCpCurr + esf.provisionesCpCurr), this.fmt(esf.acreedoresCpCurr + esf.provisionesCpCurr), this.fmt(esf.acreedoresCpPrev + esf.provisionesCpPrev)] },
      { c: ['Impuestos corrientes por pagar', '13', this.fmt(esf.impuestosCpCurr), this.fmt(esf.impuestosCpCurr), this.fmt(esf.impuestosCpPrev)] },
      { c: ['Obligaciones laborales corto plazo', '14', this.fmt(esf.laboralesCpCurr), this.fmt(esf.laboralesCpCurr), this.fmt(esf.laboralesCpPrev)] },
      { c: ['TOTAL PASIVOS CORRIENTES', '', this.fmt(esf.pasivoCorrienteCurr), this.fmt(esf.pasivoCorrienteCurr), this.fmt(esf.pasivoCorrientePrev)], bold: true, bg: '#F4F6F9' },
      { c: ['PASIVOS NO CORRIENTES', '', '', '', ''], bold: true },
      { c: ['Obligaciones financieras a largo plazo', '15', this.fmt(esf.obligFinLpCurr), this.fmt(esf.obligFinLpCurr), this.fmt(esf.obligFinLpPrev)] },
      { c: ['Acreedores comerciales y otras CxP largo plazo', '16', this.fmt(esf.acreedoresLpCurr), this.fmt(esf.acreedoresLpCurr), this.fmt(esf.acreedoresLpPrev)] },
      { c: ['TOTAL PASIVOS NO CORRIENTES', '', this.fmt(esf.pasivoNoCorrienteCurr), this.fmt(esf.pasivoNoCorrienteCurr), this.fmt(esf.pasivoNoCorrientePrev)], bold: true, bg: '#F4F6F9' },
      { c: ['PASIVOS TOTALES', '', this.fmt(esf.totalPasivoCurr), this.fmt(esf.totalPasivoCurr), this.fmt(esf.totalPasivoPrev)], bold: true, bg: '#D9E1F2' },
      { c: ['PATRIMONIO', '', '', '', ''], bold: true },
      { c: ['Capital en acciones', '17', this.fmt(esf.capitalSocialCurr), this.fmt(esf.capitalSocialCurr), this.fmt(esf.capitalSocialPrev)] },
      { c: ['Ganancias acumuladas', '17', this.fmt(esf.gananciasAcumFinalCurr - st.eri.utilidadNetaCons), this.fmt(esf.gananciasAcumFinalCurr), this.fmt(esf.gananciasAcumFinalPrev)] },
      { c: ['Reservas legales', '18', this.fmt(esf.reservasCurr), this.fmt(esf.reservasCurr), this.fmt(esf.reservasPrev)] },
      { c: ['Revalorización del patrimonio', '19', this.fmt(esf.revalorizacionCurr), this.fmt(esf.revalorizacionCurr), this.fmt(esf.revalorizacionPrev)] },
      { c: ['PATRIMONIO TOTAL', '', this.fmt(esf.totalPatrimonioCurr - st.eri.utilidadNetaCons), this.fmt(esf.totalPatrimonioCurr), this.fmt(esf.totalPatrimonioPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['TOTAL PASIVO Y PATRIMONIO', '', this.fmt(esf.totalPasivoPatrimonioCurr - st.eri.utilidadNetaCons), this.fmt(esf.totalPasivoPatrimonioCurr), this.fmt(esf.totalPasivoPatrimonioPrev)], bold: true, bg: '#D9E1F2', height: 18 }
    ];

    rows.forEach(r => this.drawTableRow(doc, r.c, w, { bold: r.bold, bg: r.bg, hasNote: true, height: r.height }));
    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 2. ERI - Estado de Resultados Integral
  generateIncomeStatement(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, eri } = st;
    this.addHeader(doc, client, 'ESTADO DE RESULTADOS INTEGRAL', yearCurrent, yearPrev);

    const w = [215, 35, 85, 85, 85];
    this.drawTableRow(doc, ['CONCEPTO', 'Nota', 'Empresa', `Consolidado ${yearCurrent}`, `Consolidado ${yearPrev}`], w, { bold: true, bg: '#E8EEF5', hasNote: true, height: 18 });

    const rows = [
      { c: ['Ingresos de actividades ordinarias', '20', this.fmt(eri.ingresosOrdEmp), this.fmt(eri.ingresosOrdCurr), this.fmt(eri.ingresosOrdPrev)] },
      { c: ['Costo de ventas y operación', '20', this.fmt(eri.costoVentasEmp), this.fmt(eri.costoVentasCurr), this.fmt(eri.costoVentasPrev)] },
      { c: ['GANANCIA BRUTA', '', this.fmt(eri.gananciaBrutaEmp), this.fmt(eri.gananciaBrutaCurr), this.fmt(eri.gananciaBrutaPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['Gastos de ventas', '24', this.fmt(eri.gastosVentasEmp), this.fmt(eri.gastosVentasCurr), this.fmt(eri.gastosVentasPrev)] },
      { c: ['Gastos de administración', '22', this.fmt(eri.gastosAdminEmp), this.fmt(eri.gastosAdminCurr), this.fmt(eri.gastosAdminPrev)] },
      { c: ['UTILIDAD OPERACIONAL', '', this.fmt(eri.utilidadOperacionalEmp), this.fmt(eri.utilidadOperacionalCurr), this.fmt(eri.utilidadOperacionalPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['Otros ingresos', '21', this.fmt(eri.otrosIngresosEmp), this.fmt(eri.otrosIngresosCurr), this.fmt(eri.otrosIngresosPrev)] },
      { c: ['Gastos financieros', '23', this.fmt(eri.gastosFinancierosCurr), this.fmt(eri.gastosFinancierosCurr), this.fmt(eri.gastosFinancierosPrev)] },
      { c: ['Gastos intereses', '23', this.fmt(eri.gastosInteresesCurr), this.fmt(eri.gastosInteresesCurr), this.fmt(eri.gastosInteresesPrev)] },
      { c: ['Otros gastos', '25', this.fmt(eri.otrosGastosCurr), this.fmt(eri.otrosGastosCurr), this.fmt(eri.otrosGastosPrev)] },
      { c: ['GANANCIA ANTES DE IMPUESTOS', '', this.fmt(eri.gananciaAntesImpCurr - eri.utilidadNetaCons), this.fmt(eri.gananciaAntesImpCurr), this.fmt(eri.gananciaAntesImpPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['Gasto por impuesto a las ganancias', '26', this.fmt(eri.impuestoRentaEmp), this.fmt(eri.impuestoRentaCurr), this.fmt(eri.impuestoRentaPrev)] },
      { c: ['GANANCIA DEL AÑO', '', this.fmt(eri.utilidadNetaEmp), this.fmt(eri.utilidadNetaCurr), this.fmt(eri.utilidadNetaPrev)], bold: true, bg: '#D9E1F2', height: 18 }
    ];

    rows.forEach(r => this.drawTableRow(doc, r.c, w, { bold: r.bold, bg: r.bg, hasNote: true, height: r.height }));
    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 3. EFC - Estado de Flujos de Efectivo (Método Indirecto)
  generateCashFlow(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, efc } = st;
    this.addHeader(doc, client, 'ESTADO DE FLUJOS DE EFECTIVO (MÉTODO INDIRECTO)', yearCurrent, yearPrev);

    const w = [350, 40, 115];
    this.drawTableRow(doc, ['ACTIVIDADES Y PARTIDAS', 'Nota', `Consolidado ${yearCurrent}`], w, { bold: true, bg: '#E8EEF5', hasNote: true, height: 18 });

    const rows = [
      { c: ['Flujos de efectivo de actividades de operación:', '', ''], bold: true },
      { c: ['Ganancia (Pérdida) neta del ejercicio', '27', this.fmt(efc.utilidadNeta)] },
      { c: ['Depreciación y amortización del período', '', this.fmt(efc.depreciacionPeriodo)] },
      { c: ['Ajustes a utilidades acumuladas y partidas no monetarias', '', this.fmt(efc.ajustePatrimonio)] },
      { c: ['Disminución (aumento) en deudores y anticipos de impuestos', '', this.fmt(efc.varDeudores)] },
      { c: ['Disminución (aumento) en inventarios', '', this.fmt(efc.varInventarios)] },
      { c: ['Disminución (aumento) en pagos anticipados e intangibles', '', this.fmt(efc.varAnticipados)] },
      { c: ['Aumento (disminución) en proveedores y acreedores', '', this.fmt(efc.varAcreedores)] },
      { c: ['Aumento (disminución) en impuestos por pagar', '', this.fmt(efc.varImpuestos)] },
      { c: ['Aumento (disminución) en obligaciones laborales', '', this.fmt(efc.varLaborales)] },
      { c: ['Aumento (disminución) en provisiones', '', this.fmt(efc.varProvisiones)] },
      { c: ['Flujo de efectivo neto provisto por actividades de operación', '28', this.fmt(efc.flujoOperacion)], bold: true, bg: '#F4F6F9' },
      { c: ['Flujos de efectivo en actividades de inversión:', '', ''], bold: true },
      { c: ['Adquisición / variación en propiedades, planta y equipo', '29', this.fmt(efc.flujoInversion)] },
      { c: ['Flujo de efectivo neto usado en actividades de inversión', '29', this.fmt(efc.flujoInversion)], bold: true, bg: '#F4F6F9' },
      { c: ['Flujos de efectivo en actividades de financiación:', '', ''], bold: true },
      { c: ['Variación en obligaciones financieras y capital', '30', this.fmt(efc.flujoFinanciacion)] },
      { c: ['Flujo de efectivo neto usado en actividades de financiación', '30', this.fmt(efc.flujoFinanciacion)], bold: true, bg: '#F4F6F9' },
      { c: ['AUMENTO (DISMINUCIÓN) NETO DE EFECTIVO', '', this.fmt(efc.flujoNeto)], bold: true, bg: '#D9E1F2' },
      { c: ['Efectivo y equivalentes al inicio del año', '', this.fmt(efc.efectivoInicial)] },
      { c: ['EFECTIVO Y EQUIVALENTES AL FINAL DEL PERÍODO', '', this.fmt(efc.efectivoFinal)], bold: true, bg: '#D9E1F2', height: 18 }
    ];

    rows.forEach(r => this.drawTableRow(doc, r.c, w, { bold: r.bold, bg: r.bg, hasNote: true, height: r.height }));
    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 4. ECP - Estado de Cambios en el Patrimonio
  generateEquityStatement(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, ecp, esf } = st;
    this.addHeader(doc, client, 'ESTADO DE CAMBIOS EN EL PATRIMONIO DE LOS ACCIONISTAS', yearCurrent, yearPrev);

    const w = [285, 110, 110];
    this.drawTableRow(doc, ['CONCEPTO PATRIMONIAL', `Consolidado ${yearCurrent}`, `Consolidado ${yearPrev}`], w, { bold: true, bg: '#E8EEF5', height: 18 });

    const rows = [
      { c: ['CAPITAL SOCIAL', '', ''], bold: true },
      { c: ['Saldo inicial', this.fmt(ecp.capitalInicialCurr), this.fmt(ecp.capitalInicialPrev)] },
      { c: ['Aportes / Capitalización de socios', '$0', '$0'] },
      { c: ['Saldo final capital social', this.fmt(ecp.capitalFinalCurr), this.fmt(ecp.capitalFinalPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['RESERVAS LEGALES', '', ''], bold: true },
      { c: ['Saldo inicial', this.fmt(ecp.reservasInicialCurr), this.fmt(esf.reservasPrev)] },
      { c: ['Saldo final reservas', this.fmt(ecp.reservasFinalCurr), this.fmt(esf.reservasPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['GANANCIAS / PÉRDIDAS ACUMULADAS', '', ''], bold: true },
      { c: ['Saldo inicial ganancias acumuladas', this.fmt(ecp.gananciasInicialCurr), this.fmt(ecp.gananciasInicialPrev)] },
      { c: ['Ganancia (Pérdida) neta del período', this.fmt(ecp.utilidadPeriodoCurr), this.fmt(ecp.utilidadPeriodoPrev)] },
      { c: ['Saldo final ganancias acumuladas', this.fmt(ecp.gananciasFinalCurr), this.fmt(ecp.gananciasFinalPrev)], bold: true, bg: '#F4F6F9' },
      { c: ['REVALORIZACIÓN DEL PATRIMONIO', this.fmt(esf.revalorizacionCurr), this.fmt(esf.revalorizacionPrev)] },
      { c: ['TOTAL PATRIMONIO DE LA EMPRESA', this.fmt(ecp.totalPatrimonioCurr), this.fmt(ecp.totalPatrimonioPrev)], bold: true, bg: '#D9E1F2', height: 18 }
    ];

    rows.forEach(r => this.drawTableRow(doc, r.c, w, { bold: r.bold, bg: r.bg, height: r.height }));
    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 5. Indicadores Financieros
  generateIndicators(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, indicators, esf, eri } = st;
    this.addHeader(doc, client, 'INDICADORES FINANCIEROS Y ANÁLISIS DE SOLVENCIA', yearCurrent, yearPrev);

    const w = [245, 130, 65, 65];
    this.drawTableRow(doc, ['INDICADOR FINANCIERO', 'Fórmula Aplicada', `${yearCurrent}`, `${yearPrev}`], w, { bold: true, bg: '#E8EEF5', height: 18 });

    const rows = [
      { c: ['INDICADORES DE LIQUIDEZ Y SOLVENCIA', '', '', ''], bold: true },
      { c: ['Índice de Liquidez (Razón Corriente)', 'Activo Cte / Pasivo Cte', `${indicators.razonCorrienteCurr.toFixed(2)}x`, `${indicators.razonCorrientePrev.toFixed(2)}x`] },
      { c: ['Capital de Trabajo Neto', 'Activo Cte - Pasivo Cte', this.fmt(indicators.capitalTrabajoCurr), this.fmt(indicators.capitalTrabajoPrev)] },
      { c: ['Razón de Cobertura de Intereses', 'Utilidad Op. / Intereses', `${indicators.coberturaInteresesCurr.toFixed(2)}x`, `${indicators.coberturaInteresesPrev.toFixed(2)}x`] },
      { c: ['Índice de Endeudamiento Total', 'Pasivo Total / Activo Total', this.pct(indicators.endeudamientoCurr * 100), this.pct(indicators.endeudamientoPrev * 100)] },
      { c: ['INDICADORES DE RENTABILIDAD Y MÁRGENES', '', '', ''], bold: true },
      { c: ['ROA (Rentabilidad Operacional del Activo)', 'Utilidad Op. / Activo Total', this.pct(indicators.roaOpCurr * 100), this.pct(indicators.roaOpPrev * 100)] },
      { c: ['ROA Neto', 'Utilidad Neta / Activo Total', this.pct(indicators.roaNetoCurr * 100), '-'] },
      { c: ['ROE (Rentabilidad Operacional Patrimonio)', 'Utilidad Op. / Patrimonio', this.pct(indicators.roeOpCurr * 100), this.pct(indicators.roeOpPrev * 100)] },
      { c: ['ROE Neto', 'Utilidad Neta / Patrimonio', this.pct(indicators.roeNetoCurr * 100), '-'] },
      { c: ['Margen Bruto', 'Ganancia Bruta / Ingresos', this.pct(indicators.margenBrutoCurr), this.pct(indicators.margenBrutoPrev)] },
      { c: ['Margen Operacional', 'Utilidad Op. / Ingresos', this.pct(indicators.margenOpCurr), this.pct(indicators.margenOpPrev)] },
      { c: ['Margen Neto', 'Utilidad Neta / Ingresos', this.pct(indicators.margenNetoCurr), this.pct(indicators.margenNetoPrev)] }
    ];

    rows.forEach(r => this.drawTableRow(doc, r.c, w, { bold: r.bold, bg: r.bg }));

    doc.moveDown(1);
    doc.font('Helvetica-Bold').fontSize(9.5).text('INTERPRETACIÓN EJECUTIVA:');
    doc.font('Helvetica').fontSize(8.5)
      .text(`• Liquidez: Para el cierre de ${yearCurrent}, por cada peso de obligación corriente la compañía cuenta con $${indicators.razonCorrienteCurr.toFixed(2)} para respaldar a sus acreedores, manteniendo un capital de trabajo de ${this.fmt(indicators.capitalTrabajoCurr)}.`)
      .moveDown(0.3)
      .text(`• Endeudamiento: El nivel de endeudamiento sobre activos totales se sitúa en ${this.pct(indicators.endeudamientoCurr * 100)} (${this.fmt(esf.totalPasivoCurr)} de pasivos frente a ${this.fmt(esf.totalActivoCurr)} en activos).`)
      .moveDown(0.3)
      .text(`• Rentabilidad: Los ingresos ordinarios alcanzaron ${this.fmt(eri.ingresosOrdCurr)} generando una utilidad neta de ${this.fmt(eri.utilidadNetaCurr)} (margen neto de ${this.pct(indicators.margenNetoCurr)}).`);

    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 6. Notas a los Estados Financieros bajo NIIF (incluye desglose por terceros)
  generateNotes(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, notesDetail, thirdParties, esf, eri, efc } = st;
    this.addHeader(doc, client, "NOTAS A LOS ESTADOS FINANCIEROS BAJO NIIF", yearCurrent, yearPrev);

    const addNoteSection = (num, title, bodyText, items = []) => {
      if (doc.y > 680) doc.addPage();
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(9.5).fillColor("#1F4E78")
        .text(`NOTA ${num}. ${title.toUpperCase()}`);
      doc.fillColor("#000000").font("Helvetica").fontSize(8.5);
      if (bodyText) {
        doc.text(bodyText, { align: "justify" });
        doc.moveDown(0.3);
      }
      if (items.length > 0) {
        const w = [285, 110, 110];
        this.drawTableRow(doc, ["Detalle / Rubro Contable", `Año ${yearCurrent}`, `Año ${yearPrev}`], w, { bold: true, bg: "#E8EEF5", size: 7.5, height: 14 });
        let totC = 0, totP = 0;
        items.forEach(it => {
          const c = Number(it.totCurr) || 0;
          const p = Number(it.totPrev) || 0;
          if (c === 0 && p === 0) return;
          totC += c;
          totP += p;
          this.drawTableRow(doc, [`${it.code ? it.code + " - " : ""}${it.name}`, this.fmt(c), this.fmt(p)], w, { size: 7.5, height: 13 });
        });
        this.drawTableRow(doc, ["TOTAL NOTA", this.fmt(totC), this.fmt(totP)], w, { bold: true, bg: "#F4F6F9", size: 7.5, height: 14 });
      }
    };

    const addThirdPartyTable = (subtitle, list = []) => {
      if (!list || list.length === 0) return;
      if (doc.y > 670) doc.addPage();
      doc.moveDown(0.4);
      doc.font("Helvetica-Bold").fontSize(8.5).fillColor("#1F4E78").text(subtitle);
      doc.fillColor("#000000").moveDown(0.2);
      const w = [85, 220, 100, 100];
      this.drawTableRow(doc, ["NIT / ID", "Tercero / Razón Social", `Saldo ${yearCurrent}`, `Saldo ${yearPrev}`], w, { bold: true, bg: "#E8EEF5", size: 7.2, height: 14 });
      let sumC = 0, sumP = 0;
      list.forEach(tp => {
        sumC += Number(tp.totCurr) || 0;
        sumP += Number(tp.totPrev) || 0;
        this.drawTableRow(doc, [tp.nit, tp.name.slice(0, 44), this.fmt(tp.totCurr), this.fmt(tp.totPrev)], w, { size: 7.2, height: 13 });
      });
      this.drawTableRow(doc, ["", `TOTAL ${subtitle.toUpperCase()}`, this.fmt(sumC), this.fmt(sumP)], w, { bold: true, bg: "#D9E1F2", size: 7.3, height: 14 });
    };

    addNoteSection(1, "Información General de la Entidad",
      `${client.name}, identificada con NIT ${client.nit || "N/A"}, con domicilio principal en ${client.address || ""} (${client.city || "Colombia"}). ${client.incorporation_info || ""} Objeto social: ${client.corporate_purpose || "Desarrollo de actividades comerciales y de servicios conforme a sus estatutos."} Clasificación empresarial: ${client.company_size || "Pyme - NIIF Grupo 2"}.`
    );

    addNoteSection(2, "Bases de Preparación y Moneda Funcional",
      `Los presentes Estados Financieros con corte al 31 de diciembre de ${yearCurrent} y comparativos al 31 de diciembre de ${yearPrev} han sido preparados de acuerdo con las Normas de Información Financiera aceptadas en Colombia (NCIF / NIIF para Pymes, Decreto 2420 de 2015 y sus modificatorios). Las cifras se expresan en pesos colombianos (COP$), moneda funcional y de presentación de la compañía.`
    );

    addNoteSection(3, "Políticas Contables Significativas",
      "Efectivo y equivalentes: incluye caja, depósitos bancarios y cuentas de ahorro de disponibilidad inmediata. Deudores: se miden al costo amortizado menos deterioro de cartera. Inventarios: se valúan al menor entre el costo y el valor neto realizable. Propiedades, planta y equipo: se reconocen al costo menos depreciación acumulada por el método de línea recta. Ingresos ordinarios: se reconocen cuando se transfiere el control de los bienes o se prestan los servicios."
    );

    addNoteSection(4, "Efectivo y Equivalentes al Efectivo", "El saldo al cierre del ejercicio se compone de:", notesDetail.nota4Efectivo);

    addNoteSection(5, "Deudores Comerciales y Otras Cuentas por Cobrar C.P.", "Corresponde a cartera comercial y cuentas por cobrar corrientes:", notesDetail.nota5Deudores);
    addThirdPartyTable("Detalle de Clientes Comerciales por Tercero", thirdParties?.clientesComerciales);
    addThirdPartyTable("Detalle de Otras Cuentas por Cobrar por Tercero", thirdParties?.otrasCuentasCobrar);

    addNoteSection(6, "Anticipo por Impuestos Corrientes", "Saldos a favor y retenciones practicadas:", notesDetail.nota6AnticiposImp);
    addNoteSection(7, "Inventarios", "Existencias disponibles al corte del período:", notesDetail.nota7Inventarios);
    addNoteSection(8, "Propiedades, Planta y Equipo", "Composición del activo fijo y su depreciación acumulada:", notesDetail.nota8PPE);
    addNoteSection(13, "Impuestos Corrientes por Pagar", "Obligaciones fiscales y retenciones por pagar:", notesDetail.nota13Impuestos);
    addNoteSection(14, "Obligaciones Laborales Corto Plazo", "Pasivos consolidados por beneficios a empleados:", notesDetail.nota14Laborales);
    addNoteSection(15, "Obligaciones Financieras", "Créditos con entidades financieras:", notesDetail.nota15ObligFinLp);

    addNoteSection(16, "Acreedores Comerciales y Otras Cuentas por Pagar", "Proveedores y acreedores comerciales:", notesDetail.nota16AcreedoresLp);
    addThirdPartyTable("Detalle de Proveedores por Tercero", thirdParties?.proveedores);
    addThirdPartyTable("Detalle de Acreedores Varios y CxP por Tercero", thirdParties?.acreedores);

    addNoteSection(17, "Capital Social y Ganancias Acumuladas", "El patrimonio total asciende a " + this.fmt(esf.totalPatrimonioCurr) + " en " + yearCurrent + " frente a " + this.fmt(esf.totalPatrimonioPrev) + " en " + yearPrev + ".", [
      { code: "3105", name: "Capital Suscrito y Pagado", totCurr: esf.capitalSocialCurr, totPrev: esf.capitalSocialPrev },
      { code: "36/37", name: "Ganancias Acumuladas (Incluye Resultado Ejercicio)", totCurr: esf.gananciasAcumFinalCurr, totPrev: esf.gananciasAcumFinalPrev }
    ]);
    addNoteSection(20, "Ingresos de Actividades Ordinarias y Costos", "Detalle de ingresos operacionales:", notesDetail.nota20Ingresos);
    addNoteSection(21, "Otros Ingresos", "Ingresos no operacionales del ejercicio:", notesDetail.nota21OtrosIngresos);
    addNoteSection(22, "Gastos de Administración", "Erogaciones administrativas del período:", notesDetail.nota22GastosAdmin);
    addNoteSection(24, "Gastos de Ventas", "Erogaciones operacionales de ventas:", notesDetail.nota24GastosVentas);
    addNoteSection(25, "Otros Gastos", "Gastos no operacionales:", notesDetail.nota25OtrosGastos);
    addNoteSection(26, "Gasto por Impuesto a las Ganancias", "Provisión de impuesto sobre la renta del período:", [
      { code: "5405", name: "Impuesto de Renta y Complementarios", totCurr: eri.impuestoRentaCurr, totPrev: eri.impuestoRentaPrev }
    ]);
    addNoteSection(28, "Resumen Flujos de Efectivo (Notas 27 a 30)", "Conciliación del flujo de efectivo neto del período:", [
      { code: "N28", name: "Flujo neto actividades de operación", totCurr: efc.flujoOperacion, totPrev: 0 },
      { code: "N29", name: "Flujo neto actividades de inversión", totCurr: efc.flujoInversion, totPrev: 0 },
      { code: "N30", name: "Flujo neto actividades de financiación", totCurr: efc.flujoFinanciacion, totPrev: 0 }
    ]);

    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 7. Certificación de los Estados Financieros
  generateCertification(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev } = st;
    this.addHeader(doc, client, 'CERTIFICACIÓN DE LOS ESTADOS FINANCIEROS', yearCurrent, yearPrev);

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).text(
      `Los suscritos Representante Legal y Contador Público de ${client.name}, con NIT ${client.nit || 'N/A'}, en cumplimiento de lo establecido en el artículo 37 de la Ley 222 de 1995, certificamos que los Estados Financieros al 31 de diciembre de ${yearCurrent} comparativos con el 31 de diciembre de ${yearPrev} (Estado de Situación Financiera, Estado de Resultados Integral, Estado de Cambios en el Patrimonio, Estado de Flujos de Efectivo y sus respectivas Notas), han sido fielmente tomados de los libros oficiales de contabilidad y que antes de ser puestos a disposición de los accionistas y de terceros se han verificado previamente las siguientes afirmaciones contenidas en ellos:`,
      { align: 'justify', lineGap: 4 }
    );

    doc.moveDown(0.8);
    const afirmaciones = [
      '1. Existencia: Los activos y pasivos de la sociedad existen en la fecha de corte y las transacciones registradas se han realizado durante el período.',
      '2. Integridad: Todos los hechos económicos realizados han sido reconocidos en la contabilidad.',
      '3. Derechos y Obligaciones: Los activos representan probables beneficios económicos futuros y los pasivos representan probables sacrificios económicos futuros a cargo de la entidad.',
      '4. Valuación: Todos los elementos han sido reconocidos por los importes apropiados de conformidad con las Normas de Información Financiera (NIIF).',
      '5. Presentación y Revelación: Los hechos económicos han sido correctamente clasificados, descritos y revelados en las notas correspondientes.'
    ];
    afirmaciones.forEach(a => {
      doc.text(a, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.4);
    });

    doc.moveDown(0.6);
    doc.text(`Dada en ${client.city || 'Colombia'}, para los fines legales y estatutarios pertinentes.`);

    this.addSignatures(doc, client);
    return this.writePdf(doc, outputPath);
  }

  // 8. Dictamen del Revisor Fiscal
  generateAuditReport(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev } = st;
    this.addHeader(doc, client, 'DICTAMEN DEL REVISOR FISCAL', yearCurrent, yearPrev);

    doc.font('Helvetica-Bold').fontSize(10).text(`A los Señores Accionistas de ${client.name}`);
    doc.moveDown(0.6);

    const secciones = [
      {
        t: 'Opinión',
        p: `He auditado los estados financieros adjuntos de ${client.name} (NIT ${client.nit || 'N/A'}), que comprenden el Estado de Situación Financiera al 31 de diciembre de ${yearCurrent} y ${yearPrev}, el Estado de Resultados Integral, el Estado de Cambios en el Patrimonio y el Estado de Flujos de Efectivo correspondientes a los ejercicios terminados en dichas fechas, así como el resumen de políticas contables significativas y otras notas explicativas. En mi opinión, los estados financieros mencionados presentan razonablemente, en todos los aspectos materiales, la situación financiera de la sociedad de conformidad con las Normas de Información Financiera aceptadas en Colombia.`
      },
      {
        t: 'Fundamento de la Opinión',
        p: 'He llevado a cabo mi auditoría de conformidad con las Normas Internacionales de Auditoría (NIA) adoptadas en Colombia. Mi responsabilidad de acuerdo con dichas normas se describe más adelante. Soy independiente de la sociedad de conformidad con los requerimientos de ética aplicables y considero que la evidencia de auditoría obtenida proporciona una base suficiente y adecuada para mi opinión.'
      },
      {
        t: 'Informe sobre otros requerimientos legales y reglamentarios',
        p: `De acuerdo con el alcance de mi auditoría, informo que durante el año ${yearCurrent}: (a) la contabilidad de la sociedad ha sido llevada conforme a las normas legales y a la técnica contable; (b) las operaciones registradas en los libros se ajustan a los estatutos y a las decisiones de la Asamblea General de Accionistas; (c) la correspondencia y los comprobantes de las cuentas se llevan y conservan debidamente; y (d) existe concordancia entre los estados financieros que se acompañan y el informe de gestión preparado por los administradores.`
      }
    ];

    secciones.forEach(s => {
      doc.font('Helvetica-Bold').fontSize(9.5).text(s.t);
      doc.moveDown(0.2);
      doc.font('Helvetica').fontSize(9.5).text(s.p, { align: 'justify', lineGap: 3 });
      doc.moveDown(0.6);
    });

    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(9.5).text(client.auditor_name || 'REVISOR FISCAL');
    doc.font('Helvetica').fontSize(8.5).text(`Revisor Fiscal — ${client.auditor_tp || ''}`);

    return this.writePdf(doc, outputPath);
  }

  // 9. Informe de Gestión
  generateManagementReport(st, outputPath) {
    const doc = this.createDoc();
    const { client, yearCurrent, yearPrev, esf, eri, indicators } = st;
    this.addHeader(doc, client, 'INFORME DE GESTIÓN DE LA ADMINISTRACIÓN', yearCurrent, yearPrev);

    doc.font('Helvetica-Bold').fontSize(10).text(`Señores Accionistas — ${client.name}`);
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(9.5).text(
      `En cumplimiento de los estatutos sociales y de lo dispuesto en el artículo 47 de la Ley 222 de 1995 (modificado por la Ley 603 de 2000), presento a consideración de la Asamblea General de Accionistas el Informe de Gestión correspondiente al ejercicio económico terminado el 31 de diciembre de ${yearCurrent}.`,
      { align: 'justify', lineGap: 3 }
    );
    doc.moveDown(0.7);

    doc.font('Helvetica-Bold').fontSize(9.5).text('1. Evolución Económica y Resultados Financieros');
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(9).text(
      `Durante el ejercicio ${yearCurrent}, los ingresos de actividades ordinarias ascendieron a ${this.fmt(eri.ingresosOrdCurr)} frente a ${this.fmt(eri.ingresosOrdPrev)} del año ${yearPrev}. La utilidad operacional se ubicó en ${this.fmt(eri.utilidadOperacionalCurr)} y la ganancia neta del ejercicio cerró en ${this.fmt(eri.utilidadNetaCurr)} (comparada con ${this.fmt(eri.utilidadNetaPrev)} en ${yearPrev}).`,
      { align: 'justify', lineGap: 3 }
    );
    doc.moveDown(0.6);

    const w = [285, 110, 110];
    this.drawTableRow(doc, ['Magnitud Financiera Clave', `Año ${yearCurrent}`, `Año ${yearPrev}`], w, { bold: true, bg: '#E8EEF5', height: 16 });
    [
      ['Activos Totales', this.fmt(esf.totalActivoCurr), this.fmt(esf.totalActivoPrev)],
      ['Pasivos Totales', this.fmt(esf.totalPasivoCurr), this.fmt(esf.totalPasivoPrev)],
      ['Patrimonio Total', this.fmt(esf.totalPatrimonioCurr), this.fmt(esf.totalPatrimonioPrev)],
      ['Ingresos Ordinarios', this.fmt(eri.ingresosOrdCurr), this.fmt(eri.ingresosOrdPrev)],
      ['Utilidad Operacional', this.fmt(eri.utilidadOperacionalCurr), this.fmt(eri.utilidadOperacionalPrev)],
      ['Ganancia Neta del Año', this.fmt(eri.utilidadNetaCurr), this.fmt(eri.utilidadNetaPrev)],
      ['Índice de Liquidez', `${indicators.razonCorrienteCurr.toFixed(2)}x`, `${indicators.razonCorrientePrev.toFixed(2)}x`],
      ['Nivel de Endeudamiento', this.pct(indicators.endeudamientoCurr * 100), this.pct(indicators.endeudamientoPrev * 100)]
    ].forEach(r => this.drawTableRow(doc, r, w, { height: 15 }));

    doc.moveDown(0.7);
    doc.font('Helvetica-Bold').fontSize(9.5).text('2. Situación Jurídica, Administrativa y Propiedad Intelectual');
    doc.moveDown(0.2);
    doc.font('Helvetica').fontSize(9).text(
      'La sociedad ha dado estricto cumplimiento a las normas sobre propiedad intelectual y derechos de autor (Ley 603 de 2000), contando con licencias vigentes para el software utilizado en su operación. Así mismo, se encuentra al día en sus obligaciones laborales, aportes al Sistema de Seguridad Social Integral y declaraciones tributarias.',
      { align: 'justify', lineGap: 3 }
    );

    doc.moveDown(1.5);
    doc.font('Helvetica-Bold').fontSize(9.5).text(client.legal_representative || 'REPRESENTANTE LEGAL');
    doc.font('Helvetica').fontSize(8.5).text('Representante Legal');

    return this.writePdf(doc, outputPath);
  }
}

module.exports = PDFGenerator;
