const ExcelJS = require('exceljs');

class ExcelGenerator {
  async generateConsolidatedWorkbook(statements, outputPath) {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'PyJ Consultoría Financiera';
    wb.created = new Date();

    const { client, yearCurrent, yearPrev, esf, eri, efc, ecp, indicators, accountsLevel4 } = statements;
    const currencyFmt = '$#,##0;($#,##0);"-"';
    const pctFmt = '0.00%';

    const styleHeader = (sheet, title) => {
      sheet.mergeCells('A1:F1');
      sheet.getCell('A1').value = client.name;
      sheet.getCell('A1').font = { bold: true, size: 13 };
      sheet.getCell('A1').alignment = { horizontal: 'center' };

      sheet.mergeCells('A2:F2');
      sheet.getCell('A2').value = `NIT. ${client.nit || ''}`;
      sheet.getCell('A2').font = { bold: true, size: 11 };
      sheet.getCell('A2').alignment = { horizontal: 'center' };

      sheet.mergeCells('A3:F3');
      sheet.getCell('A3').value = title;
      sheet.getCell('A3').font = { bold: true, size: 11, color: { argb: 'FF1F4E78' } };
      sheet.getCell('A3').alignment = { horizontal: 'center' };

      sheet.mergeCells('A4:F4');
      sheet.getCell('A4').value = `AL 31 DE DICIEMBRE DE ${yearCurrent} Y ${yearPrev} (Cifras en COP$)`;
      sheet.getCell('A4').font = { italic: true, size: 9 };
      sheet.getCell('A4').alignment = { horizontal: 'center' };
    };

    // ==================== HOJA 1: BALANCE COMPROBACIÓN NIVEL 4 ====================
    const wsBce = wb.addWorksheet('Bce_Comp_Nivel_4');
    styleHeader(wsBce, 'BALANCE DE COMPROBACIÓN BAJO NIIF - NIVEL 4');
    wsBce.getRow(6).values = ['Código', 'Cuenta Contable', `${client.name} ${yearCurrent}`, `Consorcio ${yearCurrent}`, `Consolidado ${yearCurrent}`, `Consolidado ${yearPrev}`];
    wsBce.getRow(6).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsBce.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

    let rIdx = 7;
    accountsLevel4.forEach(acc => {
      if (acc.totCurr === 0 && acc.totPrev === 0) return;
      const row = wsBce.getRow(rIdx);
      row.values = [
        acc.code,
        acc.name,
        acc.empCurr,
        acc.consCurr,
        { formula: `C${rIdx}+D${rIdx}`, result: acc.totCurr },
        acc.totPrev
      ];
      [3, 4, 5, 6].forEach(c => { row.getCell(c).numFmt = currencyFmt; });
      rIdx++;
    });
    wsBce.columns = [{ width: 12 }, { width: 45 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }];

    // ==================== HOJA 2: ESF ====================
    const wsEsf = wb.addWorksheet('ESF_NIIF');
    styleHeader(wsEsf, 'ESTADO DE SITUACIÓN FINANCIERA');
    wsEsf.getRow(6).values = ['Concepto', 'Nota', `${client.name} ${yearCurrent}`, `Consorcio ${yearCurrent}`, `Consolidado ${yearCurrent}`, `Consolidado ${yearPrev}`];
    wsEsf.getRow(6).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsEsf.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

    const esfRows = [
      { r: 7, label: 'ACTIVOS CORRIENTES', bold: true },
      { r: 8, label: 'Efectivo y Equivalentes al Efectivo', nota: 4, emp: esf.efectivoEmp, cons: esf.efectivoCons, fTot: 'C8+D8', res: esf.efectivoCurr, prev: esf.efectivoPrev },
      { r: 9, label: 'Deudores Comerciales y Otras CxC CP', nota: 5, emp: esf.deudoresCpEmp, cons: esf.deudoresCpCons, fTot: 'C9+D9', res: esf.deudoresCpCurr, prev: esf.deudoresCpPrev },
      { r: 10, label: 'Anticipo por Impuestos Corrientes', nota: 6, emp: esf.anticipoImpCurr, cons: 0, fTot: 'C10+D10', res: esf.anticipoImpCurr, prev: esf.anticipoImpPrev },
      { r: 11, label: 'Inventarios', nota: 7, emp: esf.inventariosCurr, cons: 0, fTot: 'C11+D11', res: esf.inventariosCurr, prev: esf.inventariosPrev },
      { r: 12, label: 'TOTAL ACTIVOS CORRIENTES', bold: true, fEmp: 'SUM(C8:C11)', fCons: 'SUM(D8:D11)', fTot: 'SUM(E8:E11)', fPrev: 'SUM(F8:F11)', res: esf.activoCorrienteCurr, prev: esf.activoCorrientePrev },
      { r: 14, label: 'ACTIVOS NO CORRIENTES', bold: true },
      { r: 15, label: 'Propiedades, Planta y Equipo (Neto)', nota: 8, emp: esf.ppeNetoCurr, cons: 0, fTot: 'C15+D15', res: esf.ppeNetoCurr, prev: esf.ppeNetoPrev },
      { r: 16, label: 'Deudores Comerciales y Otras CxC LP', nota: 9, emp: esf.deudoresLpCurr, cons: 0, fTot: 'C16+D16', res: esf.deudoresLpCurr, prev: esf.deudoresLpPrev },
      { r: 17, label: 'Intangibles y Pagos Anticipados', nota: 10, emp: esf.intangiblesCurr + esf.pagosAnticipadosCurr, cons: 0, fTot: 'C17+D17', res: esf.intangiblesCurr + esf.pagosAnticipadosCurr, prev: esf.intangiblesPrev + esf.pagosAnticipadosPrev },
      { r: 18, label: 'TOTAL ACTIVOS NO CORRIENTES', bold: true, fEmp: 'SUM(C15:C17)', fCons: 'SUM(D15:D17)', fTot: 'SUM(E15:E17)', fPrev: 'SUM(F15:F17)', res: esf.activoNoCorrienteCurr, prev: esf.activoNoCorrientePrev },
      { r: 19, label: 'TOTAL ACTIVOS', bold: true, highlight: true, fEmp: 'C12+C18', fCons: 'D12+D18', fTot: 'E12+E18', fPrev: 'F12+F18', res: esf.totalActivoCurr, prev: esf.totalActivoPrev },
      { r: 21, label: 'PASIVOS CORRIENTES', bold: true },
      { r: 22, label: 'Obligaciones Financieras CP', nota: 11, emp: esf.obligFinCpCurr, cons: 0, fTot: 'C22+D22', res: esf.obligFinCpCurr, prev: esf.obligFinCpPrev },
      { r: 23, label: 'Acreedores Comerciales y Otras CxP CP', nota: 12, emp: esf.acreedoresCpCurr + esf.provisionesCpCurr, cons: 0, fTot: 'C23+D23', res: esf.acreedoresCpCurr + esf.provisionesCpCurr, prev: esf.acreedoresCpPrev + esf.provisionesCpPrev },
      { r: 24, label: 'Impuestos Corrientes por Pagar', nota: 13, emp: esf.impuestosCpCurr, cons: 0, fTot: 'C24+D24', res: esf.impuestosCpCurr, prev: esf.impuestosCpPrev },
      { r: 25, label: 'Obligaciones Laborales CP', nota: 14, emp: esf.laboralesCpCurr, cons: 0, fTot: 'C25+D25', res: esf.laboralesCpCurr, prev: esf.laboralesCpPrev },
      { r: 26, label: 'TOTAL PASIVOS CORRIENTES', bold: true, fEmp: 'SUM(C22:C25)', fCons: 'SUM(D22:D25)', fTot: 'SUM(E22:E25)', fPrev: 'SUM(F22:F25)', res: esf.pasivoCorrienteCurr, prev: esf.pasivoCorrientePrev },
      { r: 28, label: 'PASIVOS NO CORRIENTES', bold: true },
      { r: 29, label: 'Obligaciones Financieras LP', nota: 15, emp: esf.obligFinLpCurr, cons: 0, fTot: 'C29+D29', res: esf.obligFinLpCurr, prev: esf.obligFinLpPrev },
      { r: 30, label: 'Acreedores Comerciales y Otras CxP LP', nota: 16, emp: esf.acreedoresLpCurr, cons: 0, fTot: 'C30+D30', res: esf.acreedoresLpCurr, prev: esf.acreedoresLpPrev },
      { r: 31, label: 'TOTAL PASIVOS NO CORRIENTES', bold: true, fEmp: 'SUM(C29:C30)', fCons: 'SUM(D29:D30)', fTot: 'SUM(E29:E30)', fPrev: 'SUM(F29:F30)', res: esf.pasivoNoCorrienteCurr, prev: esf.pasivoNoCorrientePrev },
      { r: 32, label: 'TOTAL PASIVOS', bold: true, highlight: true, fEmp: 'C26+C31', fCons: 'D26+D31', fTot: 'E26+E31', fPrev: 'F26+F31', res: esf.totalPasivoCurr, prev: esf.totalPasivoPrev },
      { r: 34, label: 'PATRIMONIO', bold: true },
      { r: 35, label: 'Capital en Acciones', nota: 17, emp: esf.capitalSocialCurr, cons: 0, fTot: 'C35+D35', res: esf.capitalSocialCurr, prev: esf.capitalSocialPrev },
      { r: 36, label: 'Ganancias Acumuladas (Incluye Resultado Ejercicio)', nota: 17, emp: esf.gananciasAcumFinalCurr - eri.utilidadNetaCons, cons: eri.utilidadNetaCons, fTot: 'C36+D36', res: esf.gananciasAcumFinalCurr, prev: esf.gananciasAcumFinalPrev },
      { r: 37, label: 'Reservas Legales', nota: 18, emp: esf.reservasCurr, cons: 0, fTot: 'C37+D37', res: esf.reservasCurr, prev: esf.reservasPrev },
      { r: 38, label: 'Revalorización del Patrimonio', nota: 19, emp: esf.revalorizacionCurr, cons: 0, fTot: 'C38+D38', res: esf.revalorizacionCurr, prev: esf.revalorizacionPrev },
      { r: 39, label: 'TOTAL PATRIMONIO', bold: true, fEmp: 'SUM(C35:C38)', fCons: 'SUM(D35:D38)', fTot: 'SUM(E35:E38)', fPrev: 'SUM(F35:F38)', res: esf.totalPatrimonioCurr, prev: esf.totalPatrimonioPrev },
      { r: 40, label: 'TOTAL PASIVO Y PATRIMONIO', bold: true, highlight: true, fEmp: 'C32+C39', fCons: 'D32+D39', fTot: 'E32+E39', fPrev: 'F32+F39', res: esf.totalPasivoPatrimonioCurr, prev: esf.totalPasivoPatrimonioPrev },
      { r: 42, label: 'PRUEBA A CEROS (ACTIVO - PASIVO - PATRIMONIO)', bold: true, fEmp: 'C19-C40', fCons: 'D19-D40', fTot: 'E19-E40', fPrev: 'F19-F40', res: esf.cuadreDiffCurr, prev: esf.cuadreDiffPrev }
    ];

    esfRows.forEach(item => {
      const row = wsEsf.getRow(item.r);
      row.getCell(1).value = item.label;
      if (item.nota) row.getCell(2).value = item.nota;
      if (item.fEmp) row.getCell(3).value = { formula: item.fEmp, result: item.res };
      else if (item.emp !== undefined) row.getCell(3).value = item.emp;

      if (item.fCons) row.getCell(4).value = { formula: item.fCons, result: 0 };
      else if (item.cons !== undefined) row.getCell(4).value = item.cons;

      if (item.fTot) row.getCell(5).value = { formula: item.fTot, result: item.res };
      if (item.fPrev) row.getCell(6).value = { formula: item.fPrev, result: item.prev };
      else if (item.prev !== undefined) row.getCell(6).value = item.prev;

      if (item.bold) row.font = { bold: true };
      if (item.highlight) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
      [3, 4, 5, 6].forEach(c => { if (row.getCell(c).value !== null) row.getCell(c).numFmt = currencyFmt; });
    });
    wsEsf.columns = [{ width: 46 }, { width: 8 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }];

    // ==================== HOJA 3: ERI ====================
    const wsEri = wb.addWorksheet('ERI_NIIF');
    styleHeader(wsEri, 'ESTADO DE RESULTADOS INTEGRAL');
    wsEri.getRow(6).values = ['Concepto', 'Nota', `${client.name} ${yearCurrent}`, `Consorcio ${yearCurrent}`, `Consolidado ${yearCurrent}`, `Consolidado ${yearPrev}`];
    wsEri.getRow(6).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsEri.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

    const eriRows = [
      { r: 7, label: 'Ingresos de Actividades Ordinarias', nota: 20, emp: eri.ingresosOrdEmp, cons: eri.ingresosOrdCons, fTot: 'C7+D7', res: eri.ingresosOrdCurr, prev: eri.ingresosOrdPrev },
      { r: 8, label: 'Costo de Ventas y Operación', nota: 20, emp: eri.costoVentasEmp, cons: eri.costoVentasCons, fTot: 'C8+D8', res: eri.costoVentasCurr, prev: eri.costoVentasPrev },
      { r: 9, label: 'GANANCIA BRUTA', bold: true, fEmp: 'C7-C8', fCons: 'D7-D8', fTot: 'E7-E8', fPrev: 'F7-F8', res: eri.gananciaBrutaCurr, prev: eri.gananciaBrutaPrev },
      { r: 10, label: 'Gastos de Ventas', nota: 24, emp: eri.gastosVentasEmp, cons: eri.gastosVentasCons, fTot: 'C10+D10', res: eri.gastosVentasCurr, prev: eri.gastosVentasPrev },
      { r: 11, label: 'Gastos de Administración', nota: 22, emp: eri.gastosAdminEmp, cons: eri.gastosAdminCons, fTot: 'C11+D11', res: eri.gastosAdminCurr, prev: eri.gastosAdminPrev },
      { r: 12, label: 'UTILIDAD OPERACIONAL', bold: true, fEmp: 'C9-C10-C11', fCons: 'D9-D10-D11', fTot: 'E9-E10-E11', fPrev: 'F9-F10-F11', res: eri.utilidadOperacionalCurr, prev: eri.utilidadOperacionalPrev },
      { r: 13, label: 'Otros Ingresos', nota: 21, emp: eri.otrosIngresosEmp, cons: eri.otrosIngresosCons, fTot: 'C13+D13', res: eri.otrosIngresosCurr, prev: eri.otrosIngresosPrev },
      { r: 14, label: 'Gastos Financieros', nota: 23, emp: eri.gastosFinancierosCurr, cons: 0, fTot: 'C14+D14', res: eri.gastosFinancierosCurr, prev: eri.gastosFinancierosPrev },
      { r: 15, label: 'Gastos Intereses', nota: 23, emp: eri.gastosInteresesCurr, cons: 0, fTot: 'C15+D15', res: eri.gastosInteresesCurr, prev: eri.gastosInteresesPrev },
      { r: 16, label: 'Otros Gastos', nota: 25, emp: eri.otrosGastosCurr, cons: 0, fTot: 'C16+D16', res: eri.otrosGastosCurr, prev: eri.otrosGastosPrev },
      { r: 17, label: 'GANANCIA ANTES DE IMPUESTOS', bold: true, fEmp: 'C12+C13-C14-C15-C16', fCons: 'D12+D13-D14-D15-D16', fTot: 'E12+E13-E14-E15-E16', fPrev: 'F12+F13-F14-F15-F16', res: eri.gananciaAntesImpCurr, prev: eri.gananciaAntesImpPrev },
      { r: 18, label: 'Gasto por Impuesto a las Ganancias', nota: 26, emp: eri.impuestoRentaEmp, cons: eri.impuestoRentaCons, fTot: 'C18+D18', res: eri.impuestoRentaCurr, prev: eri.impuestoRentaPrev },
      { r: 19, label: 'GANANCIA DEL AÑO', bold: true, highlight: true, fEmp: 'C17-C18', fCons: 'D17-D18', fTot: 'E17-E18', fPrev: 'F17-F18', res: eri.utilidadNetaCurr, prev: eri.utilidadNetaPrev }
    ];

    eriRows.forEach(item => {
      const row = wsEri.getRow(item.r);
      row.getCell(1).value = item.label;
      if (item.nota) row.getCell(2).value = item.nota;
      if (item.fEmp) row.getCell(3).value = { formula: item.fEmp, result: item.res };
      else row.getCell(3).value = item.emp;
      if (item.fCons) row.getCell(4).value = { formula: item.fCons, result: 0 };
      else row.getCell(4).value = item.cons;
      if (item.fTot) row.getCell(5).value = { formula: item.fTot, result: item.res };
      if (item.fPrev) row.getCell(6).value = { formula: item.fPrev, result: item.prev };
      else row.getCell(6).value = item.prev;

      if (item.bold) row.font = { bold: true };
      if (item.highlight) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
      [3, 4, 5, 6].forEach(c => { row.getCell(c).numFmt = currencyFmt; });
    });
    wsEri.columns = [{ width: 46 }, { width: 8 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 22 }];

    // ==================== HOJA 4: FLUJO DE EFECTIVO Y PATRIMONIO ====================
    const wsEfc = wb.addWorksheet('EFC_y_ECP');
    styleHeader(wsEfc, 'ESTADO DE FLUJOS DE EFECTIVO Y CAMBIOS EN EL PATRIMONIO');
    wsEfc.getRow(6).values = ['Concepto Flujo de Efectivo', 'Nota', `Consolidado ${yearCurrent}`];
    wsEfc.getRow(6).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsEfc.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

    const efcRows = [
      [7, 'Utilidad Neta del Periodo', 27, efc.utilidadNeta],
      [8, 'Depreciación y Amortización', '', efc.depreciacionPeriodo],
      [9, 'Ajustes a Utilidades Acumuladas / No Monetarios', '', efc.ajustePatrimonio],
      [10, 'Disminución (Aumento) en Deudores y Anticipos Impuestos', '', efc.varDeudores],
      [11, 'Disminución (Aumento) en Inventarios', '', efc.varInventarios],
      [12, 'Disminución (Aumento) en Anticipados e Intangibles', '', efc.varAnticipados],
      [13, 'Aumento (Disminución) en Proveedores y Acreedores', '', efc.varAcreedores],
      [14, 'Aumento (Disminución) en Impuestos por Pagar', '', efc.varImpuestos],
      [15, 'Aumento (Disminución) en Obligaciones Laborales', '', efc.varLaborales],
      [16, 'Aumento (Disminución) en Provisiones', '', efc.varProvisiones]
    ];
    efcRows.forEach(([r, lbl, nota, val]) => {
      const row = wsEfc.getRow(r);
      row.values = [lbl, nota, val];
      row.getCell(3).numFmt = currencyFmt;
    });
    wsEfc.getRow(17).values = ['Flujo de Efectivo de Actividades de Operación', 28, { formula: 'SUM(C7:C16)', result: efc.flujoOperacion }];
    wsEfc.getRow(17).font = { bold: true };
    wsEfc.getRow(17).getCell(3).numFmt = currencyFmt;

    wsEfc.getRow(18).values = ['Flujo de Efectivo de Actividades de Inversión (PPE)', 29, efc.flujoInversion];
    wsEfc.getRow(18).font = { bold: true };
    wsEfc.getRow(18).getCell(3).numFmt = currencyFmt;

    wsEfc.getRow(19).values = ['Flujo de Efectivo de Actividades de Financiación', 30, efc.flujoFinanciacion];
    wsEfc.getRow(19).font = { bold: true };
    wsEfc.getRow(19).getCell(3).numFmt = currencyFmt;

    wsEfc.getRow(20).values = ['Aumento (Disminución) Neto de Efectivo', '', { formula: 'C17+C18+C19', result: efc.flujoNeto }];
    wsEfc.getRow(20).font = { bold: true };
    wsEfc.getRow(20).getCell(3).numFmt = currencyFmt;

    wsEfc.getRow(21).values = ['Efectivo al Inicio del Año', '', efc.efectivoInicial];
    wsEfc.getRow(21).getCell(3).numFmt = currencyFmt;

    wsEfc.getRow(22).values = ['Efectivo al Final del Período', '', { formula: 'C20+C21', result: efc.efectivoFinal }];
    wsEfc.getRow(22).font = { bold: true };
    wsEfc.getRow(22).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
    wsEfc.getRow(22).getCell(3).numFmt = currencyFmt;
    wsEfc.columns = [{ width: 52 }, { width: 10 }, { width: 24 }];

    // ==================== HOJA 5: INDICADORES FINANCIEROS ====================
    const wsInd = wb.addWorksheet('Indicadores');
    styleHeader(wsInd, 'INDICADORES FINANCIEROS');
    wsInd.getRow(6).values = ['Indicador', 'Fórmula', `${yearCurrent}`, `${yearPrev}`];
    wsInd.getRow(6).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    wsInd.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };

    const indData = [
      ['Índice de Liquidez (Razón Corriente)', 'Activo Corriente / Pasivo Corriente', indicators.razonCorrienteCurr, indicators.razonCorrientePrev, '0.00"x"'],
      ['Capital de Trabajo Neto', 'Activo Corriente - Pasivo Corriente', indicators.capitalTrabajoCurr, indicators.capitalTrabajoPrev, currencyFmt],
      ['Cobertura de Intereses', 'Utilidad Operacional / Gastos Intereses', indicators.coberturaInteresesCurr, indicators.coberturaInteresesPrev, '0.00"x"'],
      ['Índice de Endeudamiento Total', 'Pasivos Totales / Activos Totales', indicators.endeudamientoCurr, indicators.endeudamientoPrev, pctFmt],
      ['ROA Operacional', 'Utilidad Operacional / Activos Totales', indicators.roaOpCurr, indicators.roaOpPrev, pctFmt],
      ['ROE Operacional', 'Utilidad Operacional / Patrimonio Total', indicators.roeOpCurr, indicators.roeOpPrev, pctFmt],
      ['Margen Bruto', 'Ganancia Bruta / Ingresos Ordinarios', indicators.margenBrutoCurr / 100, indicators.margenBrutoPrev / 100, pctFmt],
      ['Margen Operacional', 'Utilidad Operacional / Ingresos Ordinarios', indicators.margenOpCurr / 100, indicators.margenOpPrev / 100, pctFmt],
      ['Margen Neto', 'Utilidad Neta / Ingresos Ordinarios', indicators.margenNetoCurr / 100, indicators.margenNetoPrev / 100, pctFmt]
    ];

    indData.forEach(([name, formulaTxt, vCurr, vPrev, fmt], idx) => {
      const row = wsInd.getRow(7 + idx);
      row.values = [name, formulaTxt, vCurr, vPrev];
      row.getCell(3).numFmt = fmt;
      row.getCell(4).numFmt = fmt;
    });
    wsInd.columns = [{ width: 38 }, { width: 38 }, { width: 18 }, { width: 18 }];


    // ==================== HOJA 6: DETALLE POR TERCEROS (CARTERA Y PROVEEDORES) ====================
    const wsTp = wb.addWorksheet("Detalle_Terceros");
    styleHeader(wsTp, "DETALLE DE CARTERA Y PROVEEDORES POR TERCERO");
    const tp = statements.thirdParties || {};

    let tr = 6;
    const renderTpBlock = (sectionTitle, rowsList) => {
      wsTp.getRow(tr).values = [sectionTitle];
      wsTp.getRow(tr).font = { bold: true, size: 10, color: { argb: "FF1F4E78" } };
      tr++;

      wsTp.getRow(tr).values = ["NIT / ID", "Tercero / Razón Social", "Cuenta PUC", `Saldo ${yearCurrent}`, `Saldo ${yearPrev}`, "Variación ($)"];
      wsTp.getRow(tr).font = { bold: true, color: { argb: "FFFFFFFF" } };
      wsTp.getRow(tr).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };
      tr++;

      const startDataRow = tr;
      if (!rowsList || rowsList.length === 0) {
        wsTp.getRow(tr).values = ["—", "Sin movimientos registrados por tercero en este rubro", "", 0, 0, { formula: `D${tr}-E${tr}`, result: 0 }];
        [4, 5, 6].forEach(c => { wsTp.getRow(tr).getCell(c).numFmt = currencyFmt; });
        tr++;
      } else {
        rowsList.forEach(item => {
          const row = wsTp.getRow(tr);
          row.values = [
            item.nit,
            item.name,
            item.accountCode,
            item.totCurr,
            item.totPrev,
            { formula: `D${tr}-E${tr}`, result: (item.totCurr || 0) - (item.totPrev || 0) }
          ];
          [4, 5, 6].forEach(c => { row.getCell(c).numFmt = currencyFmt; });
          tr++;
        });
      }
      const endDataRow = tr - 1;
      const totRow = wsTp.getRow(tr);
      totRow.values = [
        "",
        `TOTAL ${sectionTitle}`,
        "",
        { formula: `SUM(D${startDataRow}:D${endDataRow})`, result: (rowsList || []).reduce((s, x) => s + (x.totCurr || 0), 0) },
        { formula: `SUM(E${startDataRow}:E${endDataRow})`, result: (rowsList || []).reduce((s, x) => s + (x.totPrev || 0), 0) },
        { formula: `D${tr}-E${tr}`, result: 0 }
      ];
      totRow.font = { bold: true };
      totRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9E1F2" } };
      [4, 5, 6].forEach(c => { totRow.getCell(c).numFmt = currencyFmt; });
      tr += 2;
    };

    renderTpBlock("1. CLIENTES COMERCIALES (CUENTAS 1305 - 1308)", tp.clientesComerciales);
    renderTpBlock("2. OTRAS CUENTAS POR COBRAR (CUENTAS 1330 - 1380)", tp.otrasCuentasCobrar);
    renderTpBlock("3. PROVEEDORES NACIONALES Y DEL EXTERIOR (CUENTAS 22)", tp.proveedores);
    renderTpBlock("4. ACREEDORES VARIOS Y CUENTAS POR PAGAR (CUENTAS 23)", tp.acreedores);
    wsTp.columns = [{ width: 16 }, { width: 46 }, { width: 14 }, { width: 22 }, { width: 22 }, { width: 22 }];

    await wb.xlsx.writeFile(outputPath);
    return outputPath;
  }
}

module.exports = ExcelGenerator;
