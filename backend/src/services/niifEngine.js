/**
 * Motor Contable NIIF para PyJ Consultoría
 * Transforma Balances de Prueba PUC (Empresa + Consorcio + Terceros, Periodo Actual y Anterior)
 * en ESF, ERI, EFC, ECP, Indicadores, Notas NIIF y Desglose por Terceros.
 */

const PUC_CATALOG = [
  // ACTIVO CORRIENTE
  { code: '1105', name: 'CAJA', section: 'ACTIVO', group: 'EFECTIVO', note: 4 },
  { code: '1110', name: 'BANCOS', section: 'ACTIVO', group: 'EFECTIVO', note: 4 },
  { code: '1120', name: 'CUENTA DE AHORRO', section: 'ACTIVO', group: 'EFECTIVO', note: 4 },
  { code: '1125', name: 'FONDO', section: 'ACTIVO', group: 'EFECTIVO', note: 4 },
  { code: '1210', name: 'CUOTAS O PARTES DE INTERÉS SOCIAL', section: 'ACTIVO', group: 'INVERSIONES_CP', note: 4 },
  { code: '1225', name: 'CERTIFICADOS', section: 'ACTIVO', group: 'INVERSIONES_CP', note: 4 },
  { code: '1255', name: 'OBLIGATORIAS', section: 'ACTIVO', group: 'INVERSIONES_CP', note: 4 },
  { code: '1305', name: 'CLIENTES', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1308', name: 'CUENTAS CORRIENTES COMERCIALES', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1330', name: 'ANTICIPOS Y AVANCES', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1340', name: 'PROMESAS DE COMPRA VENTA', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1350', name: 'RETENCIÓN SOBRE CONTRATOS', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1355', name: 'ANTICIPO DE IMPUESTOS Y CONTRIBUCIONES', section: 'ACTIVO', group: 'ANTICIPO_IMPUESTOS', note: 6 },
  { code: '1365', name: 'CUENTAS POR COBRAR A TRABAJADORES', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1370', name: 'PRÉSTAMOS A PARTICULARES', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1380', name: 'DEUDORES VARIOS', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1399', name: 'PROVISIÓN CLIENTES', section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 },
  { code: '1405', name: 'INVENTARIO MATERIA PRIMA', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  { code: '1410', name: 'INVENTARIO PRODUCTO EN PROCESO', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  { code: '1430', name: 'INVENTARIO PRODUCTO TERMINADO', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  { code: '1435', name: 'MERCANCÍA NO FABRICADA POR LA EMPRESA', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  { code: '1455', name: 'INVENTARIO REPUESTOS Y ACCESORIOS', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  { code: '1460', name: 'ENVASES Y EMPAQUES', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  { code: '1499', name: 'PROVISIONES INVENTARIOS', section: 'ACTIVO', group: 'INVENTARIOS', note: 7 },
  // ACTIVO NO CORRIENTE
  { code: '1325', name: 'CUENTAS POR COBRAR A SOCIOS Y ACCIONISTAS', section: 'ACTIVO', group: 'DEUDORES_LP', note: 9 },
  { code: '1504', name: 'TERRENOS', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1508', name: 'CONSTRUCCIONES EN CURSO', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1512', name: 'MAQUINARIA Y EQUIPOS EN MONTAJE', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1516', name: 'CONSTRUCCIONES Y EDIFICACIONES', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1520', name: 'MAQUINARIA Y EQUIPO', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1524', name: 'EQUIPO DE OFICINA', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1528', name: 'EQUIPO DE COMPUTACIÓN Y COMUNICACIÓN', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1540', name: 'FLOTA Y EQUIPO DE TRANSPORTE', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1560', name: 'ARMAMENTO DE VIGILANCIA', section: 'ACTIVO', group: 'PPE_BRUTO', note: 8 },
  { code: '1592', name: 'DEPRECIACIÓN ACUMULADA', section: 'ACTIVO', group: 'PPE_DEPRECIACION', note: 8 },
  { code: '1575', name: 'ACTIVOS INTANGIBLES DISTINTOS DE LA PLUSVALÍA', section: 'ACTIVO', group: 'INTANGIBLES', note: 10 },
  { code: '1615', name: 'PATENTES', section: 'ACTIVO', group: 'INTANGIBLES', note: 10 },
  { code: '1630', name: 'LICENCIAS', section: 'ACTIVO', group: 'INTANGIBLES', note: 10 },
  { code: '1635', name: 'DERECHOS DE LEASING', section: 'ACTIVO', group: 'INTANGIBLES', note: 10 },
  { code: '1698', name: 'AMORTIZACIÓN ACUMULADA INTANGIBLES', section: 'ACTIVO', group: 'INTANGIBLES', note: 10 },
  { code: '1705', name: 'GASTOS PAGADOS POR ANTICIPADO', section: 'ACTIVO', group: 'PAGOS_ANTICIPADOS', note: 10 },
  { code: '1710', name: 'CARGOS DIFERIDOS', section: 'ACTIVO', group: 'PAGOS_ANTICIPADOS', note: 10 },
  { code: '1905', name: 'VALORIZACIONES', section: 'ACTIVO', group: 'INTANGIBLES', note: 10 },
  // PASIVO
  { code: '2105', name: 'OBLIGACIONES FINANCIERAS (LP)', section: 'PASIVO', group: 'OBLIG_FIN_LP', note: 15 },
  { code: '2115', name: 'CORPORACIONES FINANCIERAS (CP)', section: 'PASIVO', group: 'OBLIG_FIN_CP', note: 11 },
  { code: '2195', name: 'OTRAS OBLIGACIONES FINANCIERAS (CP)', section: 'PASIVO', group: 'OBLIG_FIN_CP', note: 11 },
  { code: '2205', name: 'PROVEEDORES NACIONALES (LP)', section: 'PASIVO', group: 'ACREEDORES_LP', note: 16 },
  { code: '2305', name: 'CUENTAS CORRIENTES COMERCIALES (CP)', section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 },
  { code: '2315', name: 'CUENTAS POR PAGAR A COMPAÑÍAS VINCULADAS', section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 },
  { code: '2330', name: 'ÓRDENES DE COMPRA POR LEGALIZAR', section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 },
  { code: '2335', name: 'COSTOS Y GASTOS POR PAGAR (LP)', section: 'PASIVO', group: 'ACREEDORES_LP', note: 16 },
  { code: '2355', name: 'DEUDAS CON ACCIONISTAS O SOCIOS', section: 'PASIVO', group: 'ACREEDORES_LP', note: 16 },
  { code: '2365', name: 'RETENCIÓN EN LA FUENTE', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2367', name: 'IMPUESTO A LAS VENTAS RETENIDO', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2368', name: 'IMPUESTO DE INDUSTRIA Y COMERCIO RETENIDO', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2369', name: 'IMPUESTO CREE RETENIDO', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2370', name: 'RETENCIONES Y APORTES DE NÓMINA', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2380', name: 'ACREEDORES VARIOS (LP)', section: 'PASIVO', group: 'ACREEDORES_LP', note: 16 },
  { code: '2404', name: 'IMPUESTO DE RENTA Y COMPLEMENTARIOS', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2408', name: 'IMPUESTO SOBRE LAS VENTAS POR PAGAR', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2412', name: 'IMPUESTO DE INDUSTRIA Y COMERCIO', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2480', name: 'IMPUESTO AL CONSUMO', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2495', name: 'OTROS IMPUESTOS POR PAGAR', section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 },
  { code: '2505', name: 'SALARIOS POR PAGAR', section: 'PASIVO', group: 'LABORALES_CP', note: 14 },
  { code: '2510', name: 'CESANTÍAS CONSOLIDADAS', section: 'PASIVO', group: 'LABORALES_CP', note: 14 },
  { code: '2515', name: 'INTERESES SOBRE CESANTÍAS', section: 'PASIVO', group: 'LABORALES_CP', note: 14 },
  { code: '2520', name: 'PRIMA DE SERVICIOS', section: 'PASIVO', group: 'LABORALES_CP', note: 14 },
  { code: '2525', name: 'VACACIONES CONSOLIDADAS', section: 'PASIVO', group: 'LABORALES_CP', note: 14 },
  { code: '2605', name: 'PASIVOS ESTIMADOS PARA COSTOS Y GASTOS', section: 'PASIVO', group: 'PROVISIONES_CP', note: 12 },
  { code: '2610', name: 'PARA OBLIGACIONES LABORALES', section: 'PASIVO', group: 'PROVISIONES_CP', note: 14 },
  { code: '2615', name: 'PARA OBLIGACIONES FISCALES', section: 'PASIVO', group: 'PROVISIONES_CP', note: 13 },
  { code: '2695', name: 'PROVISIONES DIVERSAS', section: 'PASIVO', group: 'PROVISIONES_CP', note: 12 },
  { code: '2805', name: 'ANTICIPOS Y AVANCES RECIBIDOS', section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 },
  { code: '2810', name: 'DEPÓSITOS RECIBIDOS', section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 },
  { code: '2815', name: 'INGRESOS RECIBIDOS PARA TERCEROS', section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 },
  // PATRIMONIO
  { code: '3105', name: 'CAPITAL SUSCRITO Y PAGADO', section: 'PATRIMONIO', group: 'CAPITAL', note: 17 },
  { code: '3115', name: 'APORTES SOCIALES', section: 'PATRIMONIO', group: 'CAPITAL', note: 17 },
  { code: '3205', name: 'PRIMA EN COLOCACIÓN DE ACCIONES', section: 'PATRIMONIO', group: 'CAPITAL', note: 17 },
  { code: '3305', name: 'RESERVAS LEGALES', section: 'PATRIMONIO', group: 'RESERVAS', note: 18 },
  { code: '3405', name: 'REVALORIZACIÓN DEL PATRIMONIO', section: 'PATRIMONIO', group: 'REVALORIZACION', note: 19 },
  { code: '3415', name: 'AJUSTES POR INFLACIÓN DECRETO 3019', section: 'PATRIMONIO', group: 'REVALORIZACION', note: 19 },
  { code: '3605', name: 'UTILIDAD DEL EJERCICIO (ANTERIOR)', section: 'PATRIMONIO', group: 'GANANCIAS_ACUM_BASE', note: 17 },
  { code: '3610', name: 'PÉRDIDA DEL EJERCICIO (ANTERIOR)', section: 'PATRIMONIO', group: 'GANANCIAS_ACUM_BASE', note: 17 },
  { code: '3705', name: 'UTILIDADES ACUMULADAS', section: 'PATRIMONIO', group: 'GANANCIAS_ACUM_BASE', note: 17 },
  { code: '3710', name: 'PÉRDIDAS ACUMULADAS', section: 'PATRIMONIO', group: 'GANANCIAS_ACUM_BASE', note: 17 },
  { code: '3905', name: 'IMPACTOS POR ADOPCIÓN NIIF', section: 'PATRIMONIO', group: 'GANANCIAS_ACUM_BASE', note: 17 },
  // INGRESOS
  { code: '4130', name: 'CONSTRUCCIÓN', section: 'INGRESO', group: 'INGRESOS_ORDINARIOS', note: 20 },
  { code: '4135', name: 'COMERCIO AL POR MAYOR Y AL POR MENOR', section: 'INGRESO', group: 'INGRESOS_ORDINARIOS', note: 20 },
  { code: '4145', name: 'TRANSPORTE, ALMACENAMIENTO Y COMUNICACIONES', section: 'INGRESO', group: 'INGRESOS_ORDINARIOS', note: 20 },
  { code: '4155', name: 'ACTIVIDADES INMOBILIARIAS, EMPRESARIALES Y DE ALQUILER', section: 'INGRESO', group: 'INGRESOS_ORDINARIOS', note: 20 },
  { code: '4175', name: 'DEVOLUCIONES EN VENTAS', section: 'INGRESO', group: 'INGRESOS_ORDINARIOS', note: 20 },
  { code: '4205', name: 'OTRAS VENTAS NO OPERACIONALES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4210', name: 'INGRESOS FINANCIEROS', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4220', name: 'ARRENDAMIENTOS NO OPERACIONALES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4235', name: 'SERVICIOS NO OPERACIONALES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4245', name: 'UTILIDAD EN VENTA DE PROPIEDADES, PLANTA Y EQUIPO', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4250', name: 'RECUPERACIONES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4255', name: 'INDEMNIZACIONES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4265', name: 'INGRESOS DE EJERCICIOS ANTERIORES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  { code: '4295', name: 'DIVERSOS NO OPERACIONALES', section: 'INGRESO', group: 'OTROS_INGRESOS', note: 21 },
  // GASTOS
  { code: '5105', name: 'GASTOS DE PERSONAL (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5110', name: 'HONORARIOS (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5115', name: 'IMPUESTOS (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5120', name: 'ARRENDAMIENTOS (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5125', name: 'CONTRIBUCIONES Y AFILIACIONES (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5130', name: 'SEGUROS (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5135', name: 'SERVICIOS (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5140', name: 'GASTOS LEGALES (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5145', name: 'MANTENIMIENTO Y REPARACIONES (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5150', name: 'ADECUACIONES E INSTALACIONES (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5155', name: 'GASTOS DE VIAJE (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5160', name: 'DEPRECIACIONES (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5165', name: 'AMORTIZACIONES (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5195', name: 'DIVERSOS (ADM)', section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 },
  { code: '5205', name: 'GASTOS DE PERSONAL (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5210', name: 'HONORARIOS (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5215', name: 'IMPUESTOS (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5220', name: 'ARRENDAMIENTOS (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5225', name: 'CONTRIBUCIONES Y AFILIACIONES (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5230', name: 'SEGUROS CUMPLIMIENTO (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5235', name: 'SERVICIOS (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5240', name: 'GASTOS LEGALES (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5245', name: 'MANTENIMIENTO Y REPARACIONES (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5250', name: 'REPARACIONES LOCATIVAS (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5255', name: 'GASTOS DE VIAJE (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5260', name: 'DEPRECIACIONES (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5265', name: 'AMORTIZACIONES (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5295', name: 'DIVERSOS (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5299', name: 'PROVISIONES (VENTAS)', section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 },
  { code: '5305', name: 'GASTOS FINANCIEROS', section: 'GASTO', group: 'GASTOS_FINANCIEROS', note: 23 },
  { code: '5310', name: 'PÉRDIDA EN VENTA Y RETIRO DE BIENES', section: 'GASTO', group: 'OTROS_GASTOS', note: 25 },
  { code: '5315', name: 'GASTOS EXTRAORDINARIOS', section: 'GASTO', group: 'OTROS_GASTOS', note: 25 },
  { code: '5395', name: 'GASTOS NO OPERACIONALES DIVERSOS', section: 'GASTO', group: 'OTROS_GASTOS', note: 25 },
  { code: '5405', name: 'IMPUESTO DE RENTA Y COMPLEMENTARIOS', section: 'GASTO', group: 'IMPUESTO_RENTA', note: 26 },
  // COSTOS
  { code: '6130', name: 'COSTO DE CONSTRUCCIÓN', section: 'COSTO', group: 'COSTO_VENTAS', note: 20 },
  { code: '6135', name: 'COMERCIO AL POR MAYOR Y AL POR MENOR', section: 'COSTO', group: 'COSTO_VENTAS', note: 20 },
  { code: '6145', name: 'COSTO DE TRANSPORTE, ALMACENAMIENTO Y COMUNICACIONES', section: 'COSTO', group: 'COSTO_VENTAS', note: 20 },
  { code: '6155', name: 'COSTO DE ACTIVIDADES INMOBILIARIAS Y DE ALQUILER', section: 'COSTO', group: 'COSTO_VENTAS', note: 20 },
  { code: '7101', name: 'MATERIA PRIMA', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7105', name: 'COMPRAS MATERIA PRIMA', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7201', name: 'MANO DE OBRA DIRECTA', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7205', name: 'GASTOS DE PERSONAL OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7210', name: 'HONORARIOS OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7225', name: 'CONTRIBUCIONES Y AFILIACIONES OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7230', name: 'SEGUROS OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7235', name: 'TRANSPORTE DE CARGA Y ACARREOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7240', name: 'GASTOS LEGALES OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7245', name: 'MANTENIMIENTO Y REPARACIONES OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7250', name: 'ADECUACIÓN E INSTALACIÓN OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7255', name: 'GASTOS DE VIAJE OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7295', name: 'DIVERSOS OPERACIONAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7301', name: 'COSTOS INDIRECTOS M.O. Y MATERIALES', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7305', name: 'GASTOS PERSONAL INDIRECTO', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7310', name: 'INDIRECTOS HONORARIOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7315', name: 'IMPUESTOS INDIRECTOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7320', name: 'INDIRECTOS ARRENDAMIENTOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7325', name: 'CONTRIBUCIONES Y AFILIACIONES INDIRECTAS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7330', name: 'SEGUROS INDIRECTOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7335', name: 'SERVICIOS INDIRECTOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7340', name: 'GASTOS LEGALES INDIRECTOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7345', name: 'INDIRECTOS MTTO. Y REPARACIONES', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7350', name: 'ADECUACIÓN E INSTALACIÓN INDIRECTA', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7355', name: 'GASTOS DE VIAJE INDIRECTOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7360', name: 'DEPRECIACIONES INDIRECTAS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7365', name: 'COSTOS SEGURIDAD INDUSTRIAL', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7370', name: 'GARANTÍAS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7395', name: 'INDIRECTOS DIVERSOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 },
  { code: '7490', name: 'COSTOS OBRAS CONSORCIOS', section: 'COSTO', group: 'COSTO_PRODUCCION', note: 20 }
];

function classifyAccount(code, name = '') {
  const clean = String(code || '').trim();
  const c4 = clean.slice(0, 4);
  const found = PUC_CATALOG.find(item => item.code === c4);
  if (found) return found;

  const c1 = clean[0];
  const c2 = clean.slice(0, 2);
  if (c1 === '1') {
    if (c2 === '11') return { code: c4, name, section: 'ACTIVO', group: 'EFECTIVO', note: 4 };
    if (c2 === '12') return { code: c4, name, section: 'ACTIVO', group: 'INVERSIONES_CP', note: 4 };
    if (c2 === '13') return { code: c4, name, section: 'ACTIVO', group: 'DEUDORES_CP', note: 5 };
    if (c2 === '14') return { code: c4, name, section: 'ACTIVO', group: 'INVENTARIOS', note: 7 };
    if (c2 === '15') return { code: c4, name, section: 'ACTIVO', group: c4 === '1592' ? 'PPE_DEPRECIACION' : 'PPE_BRUTO', note: 8 };
    return { code: c4, name, section: 'ACTIVO', group: 'INTANGIBLES', note: 10 };
  }
  if (c1 === '2') {
    if (c2 === '21') return { code: c4, name, section: 'PASIVO', group: 'OBLIG_FIN_LP', note: 15 };
    if (c2 === '22') return { code: c4, name, section: 'PASIVO', group: 'ACREEDORES_LP', note: 16 };
    if (c2 === '23') return { code: c4, name, section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 };
    if (c2 === '24') return { code: c4, name, section: 'PASIVO', group: 'IMPUESTOS_CP', note: 13 };
    if (c2 === '25') return { code: c4, name, section: 'PASIVO', group: 'LABORALES_CP', note: 14 };
    if (c2 === '26') return { code: c4, name, section: 'PASIVO', group: 'PROVISIONES_CP', note: 12 };
    return { code: c4, name, section: 'PASIVO', group: 'ACREEDORES_CP', note: 12 };
  }
  if (c1 === '3') {
    if (c2 === '31' || c2 === '32') return { code: c4, name, section: 'PATRIMONIO', group: 'CAPITAL', note: 17 };
    if (c2 === '33') return { code: c4, name, section: 'PATRIMONIO', group: 'RESERVAS', note: 18 };
    if (c2 === '34') return { code: c4, name, section: 'PATRIMONIO', group: 'REVALORIZACION', note: 19 };
    return { code: c4, name, section: 'PATRIMONIO', group: 'GANANCIAS_ACUM_BASE', note: 17 };
  }
  if (c1 === '4') {
    return { code: c4, name, section: 'INGRESO', group: c2 === '41' ? 'INGRESOS_ORDINARIOS' : 'OTROS_INGRESOS', note: c2 === '41' ? 20 : 21 };
  }
  if (c1 === '5') {
    if (c2 === '51') return { code: c4, name, section: 'GASTO', group: 'GASTOS_ADMIN', note: 22 };
    if (c2 === '52') return { code: c4, name, section: 'GASTO', group: 'GASTOS_VENTAS', note: 24 };
    if (c2 === '53') return { code: c4, name, section: 'GASTO', group: c4 === '5305' ? 'GASTOS_FINANCIEROS' : 'OTROS_GASTOS', note: c4 === '5305' ? 23 : 25 };
    return { code: c4, name, section: 'GASTO', group: 'IMPUESTO_RENTA', note: 26 };
  }
  if (c1 === '6' || c1 === '7') {
    return { code: c4, name, section: 'COSTO', group: c1 === '6' ? 'COSTO_VENTAS' : 'COSTO_PRODUCCION', note: 20 };
  }
  return { code: c4, name, section: 'OTRO', group: 'OTRO', note: 0 };
}

function normalizeSign(code, rawClosing) {
  const c1 = String(code || '').trim()[0];
  const val = Number(rawClosing) || 0;
  if (c1 === '2' || c1 === '3' || c1 === '4') {
    return -val;
  }
  return val;
}

function classifyThirdPartyBucket(code) {
  const clean = String(code || '').trim();
  const c4 = clean.slice(0, 4);
  if (c4 === '1305' || c4 === '1308') return 'clientesComerciales';
  if (clean.startsWith('13') && c4 !== '1355' && c4 !== '1399') return 'otrasCuentasCobrar';
  if (clean.startsWith('22')) return 'proveedores';
  if (clean.startsWith('23') && !['2365', '2367', '2368', '2369', '2370'].includes(c4)) return 'acreedores';
  return null;
}

function buildFinancialStatements({ client, rowsCurrent, rowsPrev, yearCurrent, yearPrev }) {
  const byCode4 = new Map();
  const byExact = new Map();
  const tpBuckets = {
    clientesComerciales: new Map(),
    otrasCuentasCobrar: new Map(),
    proveedores: new Map(),
    acreedores: new Map()
  };

  const ensureCode4 = (code4, fallbackName = '') => {
    if (!byCode4.has(code4)) {
      const meta = classifyAccount(code4, fallbackName);
      byCode4.set(code4, {
        code: code4,
        name: meta.name || fallbackName || code4,
        section: meta.section,
        group: meta.group,
        note: meta.note,
        empCurr: 0,
        consCurr: 0,
        totCurr: 0,
        empPrev: 0,
        consPrev: 0,
        totPrev: 0
      });
    }
    return byCode4.get(code4);
  };

  PUC_CATALOG.forEach(item => ensureCode4(item.code, item.name));

  const processPeriodRows = (rows, isCurrent) => {
    const exactMap = new Map();
    const hasLevel4 = new Set();

    rows.forEach(r => {
      const code = String(r.account_code || '').trim();
      const role = r.source_role || 'empresa';
      const val = normalizeSign(code, r.closing_balance);

      // Si es desglose por tercero, acumular en tpBuckets y no duplicar en byCode4
      if (r.third_party_nit) {
        const bucketName = classifyThirdPartyBucket(code);
        if (bucketName) {
          const nit = String(r.third_party_nit).trim();
          const name = String(r.third_party_name || nit).trim();
          const bucket = tpBuckets[bucketName];
          if (!bucket.has(nit)) {
            bucket.set(nit, {
              nit,
              name,
              accountCode: code.slice(0, 4),
              totCurr: 0,
              totPrev: 0
            });
          }
          const item = bucket.get(nit);
          if (item.name === nit && name !== nit) item.name = name;
          if (isCurrent) item.totCurr += val;
          else item.totPrev += val;
        }
        return;
      }

      const key = `${code}|${role}`;
      exactMap.set(key, (exactMap.get(key) || 0) + val);
      byExact.set(`${isCurrent ? 'C' : 'P'}|${code}|${role}`, (byExact.get(`${isCurrent ? 'C' : 'P'}|${code}|${role}`) || 0) + val);

      if (code.length === 4) {
        hasLevel4.add(`${code}|${role}`);
      }
    });

    exactMap.forEach((val, key) => {
      const [code, role] = key.split('|');
      if (code.length === 4) {
        const entry = ensureCode4(code);
        if (isCurrent) {
          if (role === 'consorcio') entry.consCurr += val;
          else entry.empCurr += val;
        } else {
          if (role === 'consorcio') entry.consPrev += val;
          else entry.empPrev += val;
        }
      } else if (code.length > 4) {
        const c4 = code.slice(0, 4);
        if (!hasLevel4.has(`${c4}|${role}`)) {
          const entry = ensureCode4(c4);
          if (isCurrent) {
            if (role === 'consorcio') entry.consCurr += val;
            else entry.empCurr += val;
          } else {
            if (role === 'consorcio') entry.consPrev += val;
            else entry.empPrev += val;
          }
        }
      }
    });
  };

  processPeriodRows(rowsCurrent, true);
  processPeriodRows(rowsPrev, false);

  byCode4.forEach(entry => {
    entry.totCurr = entry.empCurr + entry.consCurr;
    entry.totPrev = entry.empPrev + entry.consPrev;
  });

  const finalizeTpList = (map) => Array.from(map.values())
    .filter(x => Math.abs(x.totCurr) >= 1 || Math.abs(x.totPrev) >= 1)
    .sort((a, b) => (Math.abs(b.totCurr) - Math.abs(a.totCurr)) || (Math.abs(b.totPrev) - Math.abs(a.totPrev)));

  const thirdParties = {
    clientesComerciales: finalizeTpList(tpBuckets.clientesComerciales),
    otrasCuentasCobrar: finalizeTpList(tpBuckets.otrasCuentasCobrar),
    proveedores: finalizeTpList(tpBuckets.proveedores),
    acreedores: finalizeTpList(tpBuckets.acreedores)
  };

  const sumGroup = (groupName, field = 'totCurr') => {
    let s = 0;
    byCode4.forEach(e => {
      if (e.group === groupName) s += e[field] || 0;
    });
    return s;
  };

  const getCode = (code4, field = 'totCurr') => byCode4.get(code4)?.[field] || 0;

  const getExact = (isCurrent, exactCode, role = 'all') => {
    const p = isCurrent ? 'C' : 'P';
    if (role === 'all') {
      return (byExact.get(`${p}|${exactCode}|empresa`) || 0) + (byExact.get(`${p}|${exactCode}|consorcio`) || 0);
    }
    return byExact.get(`${p}|${exactCode}|${role}`) || 0;
  };

  // ==================== 1. ESTADO DE RESULTADOS INTEGRAL (ERI) ====================
  const ingresosOrdCurr = sumGroup('INGRESOS_ORDINARIOS', 'totCurr');
  const ingresosOrdPrev = sumGroup('INGRESOS_ORDINARIOS', 'totPrev');
  const ingresosOrdEmp = sumGroup('INGRESOS_ORDINARIOS', 'empCurr');
  const ingresosOrdCons = sumGroup('INGRESOS_ORDINARIOS', 'consCurr');

  const costoVentasCurr = sumGroup('COSTO_VENTAS', 'totCurr') + sumGroup('COSTO_PRODUCCION', 'totCurr');
  const costoVentasPrev = sumGroup('COSTO_VENTAS', 'totPrev') + sumGroup('COSTO_PRODUCCION', 'totPrev');
  const costoVentasEmp = sumGroup('COSTO_VENTAS', 'empCurr') + sumGroup('COSTO_PRODUCCION', 'empCurr');
  const costoVentasCons = sumGroup('COSTO_VENTAS', 'consCurr') + sumGroup('COSTO_PRODUCCION', 'consCurr');

  const gananciaBrutaCurr = ingresosOrdCurr - costoVentasCurr;
  const gananciaBrutaPrev = ingresosOrdPrev - costoVentasPrev;
  const gananciaBrutaEmp = ingresosOrdEmp - costoVentasEmp;
  const gananciaBrutaCons = ingresosOrdCons - costoVentasCons;

  const gastosVentasCurr = sumGroup('GASTOS_VENTAS', 'totCurr');
  const gastosVentasPrev = sumGroup('GASTOS_VENTAS', 'totPrev');
  const gastosVentasEmp = sumGroup('GASTOS_VENTAS', 'empCurr');
  const gastosVentasCons = sumGroup('GASTOS_VENTAS', 'consCurr');

  const gastosAdminCurr = sumGroup('GASTOS_ADMIN', 'totCurr');
  const gastosAdminPrev = sumGroup('GASTOS_ADMIN', 'totPrev');
  const gastosAdminEmp = sumGroup('GASTOS_ADMIN', 'empCurr');
  const gastosAdminCons = sumGroup('GASTOS_ADMIN', 'consCurr');

  const utilidadOperacionalCurr = gananciaBrutaCurr - gastosVentasCurr - gastosAdminCurr;
  const utilidadOperacionalPrev = gananciaBrutaPrev - gastosVentasPrev - gastosAdminPrev;
  const utilidadOperacionalEmp = gananciaBrutaEmp - gastosVentasEmp - gastosAdminEmp;
  const utilidadOperacionalCons = gananciaBrutaCons - gastosVentasCons - gastosAdminCons;

  const otrosIngresosCurr = sumGroup('OTROS_INGRESOS', 'totCurr');
  const otrosIngresosPrev = sumGroup('OTROS_INGRESOS', 'totPrev');
  const otrosIngresosEmp = sumGroup('OTROS_INGRESOS', 'empCurr');
  const otrosIngresosCons = sumGroup('OTROS_INGRESOS', 'consCurr');

  const total5305Curr = getCode('5305', 'totCurr');
  const total5305Prev = getCode('5305', 'totPrev');
  const gastosInteresesCurr = getExact(true, '530520');
  const gastosInteresesPrev = getExact(false, '530520');
  const gastosFinancierosCurr = total5305Curr - gastosInteresesCurr;
  const gastosFinancierosPrev = total5305Prev - gastosInteresesPrev;

  const otrosGastosCurr = sumGroup('OTROS_GASTOS', 'totCurr');
  const otrosGastosPrev = sumGroup('OTROS_GASTOS', 'totPrev');

  const gananciaAntesImpCurr = utilidadOperacionalCurr + otrosIngresosCurr - gastosFinancierosCurr - gastosInteresesCurr - otrosGastosCurr;
  const gananciaAntesImpPrev = utilidadOperacionalPrev + otrosIngresosPrev - gastosFinancierosPrev - gastosInteresesPrev - otrosGastosPrev;
  const gananciaAntesImpEmp = utilidadOperacionalEmp + otrosIngresosEmp - (getCode('5305', 'empCurr')) - sumGroup('OTROS_GASTOS', 'empCurr');
  const gananciaAntesImpCons = utilidadOperacionalCons + otrosIngresosCons - (getCode('5305', 'consCurr')) - sumGroup('OTROS_GASTOS', 'consCurr');

  const impuestoRentaCurr = sumGroup('IMPUESTO_RENTA', 'totCurr');
  const impuestoRentaPrev = sumGroup('IMPUESTO_RENTA', 'totPrev');
  const impuestoRentaEmp = sumGroup('IMPUESTO_RENTA', 'empCurr');
  const impuestoRentaCons = sumGroup('IMPUESTO_RENTA', 'consCurr');

  const utilidadNetaCurr = gananciaAntesImpCurr - impuestoRentaCurr;
  const utilidadNetaPrev = gananciaAntesImpPrev - impuestoRentaPrev;
  const utilidadNetaEmp = gananciaAntesImpEmp - impuestoRentaEmp;
  const utilidadNetaCons = gananciaAntesImpCons - impuestoRentaCons;

  // ==================== 2. ESTADO DE SITUACIÓN FINANCIERA (ESF) ====================
  const efectivoCurr = sumGroup('EFECTIVO', 'totCurr') + sumGroup('INVERSIONES_CP', 'totCurr');
  const efectivoPrev = sumGroup('EFECTIVO', 'totPrev') + sumGroup('INVERSIONES_CP', 'totPrev');

  const deudoresCpCurr = sumGroup('DEUDORES_CP', 'totCurr');
  const deudoresCpPrev = sumGroup('DEUDORES_CP', 'totPrev');

  const anticipoImpCurr = sumGroup('ANTICIPO_IMPUESTOS', 'totCurr');
  const anticipoImpPrev = sumGroup('ANTICIPO_IMPUESTOS', 'totPrev');

  const inventariosCurr = sumGroup('INVENTARIOS', 'totCurr');
  const inventariosPrev = sumGroup('INVENTARIOS', 'totPrev');

  const activoCorrienteCurr = efectivoCurr + deudoresCpCurr + anticipoImpCurr + inventariosCurr;
  const activoCorrientePrev = efectivoPrev + deudoresCpPrev + anticipoImpPrev + inventariosPrev;

  const ppeBrutoCurr = sumGroup('PPE_BRUTO', 'totCurr');
  const ppeBrutoPrev = sumGroup('PPE_BRUTO', 'totPrev');
  const ppeDeprecCurr = sumGroup('PPE_DEPRECIACION', 'totCurr');
  const ppeDeprecPrev = sumGroup('PPE_DEPRECIACION', 'totPrev');
  const ppeNetoCurr = ppeBrutoCurr + ppeDeprecCurr;
  const ppeNetoPrev = ppeBrutoPrev + ppeDeprecPrev;

  const deudoresLpCurr = sumGroup('DEUDORES_LP', 'totCurr');
  const deudoresLpPrev = sumGroup('DEUDORES_LP', 'totPrev');

  const intangiblesCurr = sumGroup('INTANGIBLES', 'totCurr');
  const intangiblesPrev = sumGroup('INTANGIBLES', 'totPrev');

  const pagosAnticipadosCurr = sumGroup('PAGOS_ANTICIPADOS', 'totCurr');
  const pagosAnticipadosPrev = sumGroup('PAGOS_ANTICIPADOS', 'totPrev');

  const activoNoCorrienteCurr = ppeNetoCurr + deudoresLpCurr + intangiblesCurr + pagosAnticipadosCurr;
  const activoNoCorrientePrev = ppeNetoPrev + deudoresLpPrev + intangiblesPrev + pagosAnticipadosPrev;

  const totalActivoCurr = activoCorrienteCurr + activoNoCorrienteCurr;
  const totalActivoPrev = activoCorrientePrev + activoNoCorrientePrev;

  // PASIVOS
  const obligFinCpCurr = sumGroup('OBLIG_FIN_CP', 'totCurr');
  const obligFinCpPrev = sumGroup('OBLIG_FIN_CP', 'totPrev');

  const acreedoresCpCurr = sumGroup('ACREEDORES_CP', 'totCurr');
  const acreedoresCpPrev = sumGroup('ACREEDORES_CP', 'totPrev');

  const impuestosCpCurr = sumGroup('IMPUESTOS_CP', 'totCurr');
  const impuestosCpPrev = sumGroup('IMPUESTOS_CP', 'totPrev');

  const laboralesCpCurr = sumGroup('LABORALES_CP', 'totCurr');
  const laboralesCpPrev = sumGroup('LABORALES_CP', 'totPrev');

  const provisionesCpCurr = sumGroup('PROVISIONES_CP', 'totCurr');
  const provisionesCpPrev = sumGroup('PROVISIONES_CP', 'totPrev');

  const pasivoCorrienteCurr = obligFinCpCurr + acreedoresCpCurr + impuestosCpCurr + laboralesCpCurr + provisionesCpCurr;
  const pasivoCorrientePrev = obligFinCpPrev + acreedoresCpPrev + impuestosCpPrev + laboralesCpPrev + provisionesCpPrev;

  const obligFinLpCurr = sumGroup('OBLIG_FIN_LP', 'totCurr');
  const obligFinLpPrev = sumGroup('OBLIG_FIN_LP', 'totPrev');

  const acreedoresLpCurr = sumGroup('ACREEDORES_LP', 'totCurr');
  const acreedoresLpPrev = sumGroup('ACREEDORES_LP', 'totPrev');

  const pasivoNoCorrienteCurr = obligFinLpCurr + acreedoresLpCurr;
  const pasivoNoCorrientePrev = obligFinLpPrev + acreedoresLpPrev;

  const totalPasivoCurr = pasivoCorrienteCurr + pasivoNoCorrienteCurr;
  const totalPasivoPrev = pasivoCorrientePrev + pasivoNoCorrientePrev;

  // PATRIMONIO
  const capitalSocialCurr = sumGroup('CAPITAL', 'totCurr');
  const capitalSocialPrev = sumGroup('CAPITAL', 'totPrev');

  const reservasCurr = sumGroup('RESERVAS', 'totCurr');
  const reservasPrev = sumGroup('RESERVAS', 'totPrev');

  const revalorizacionCurr = sumGroup('REVALORIZACION', 'totCurr');
  const revalorizacionPrev = sumGroup('REVALORIZACION', 'totPrev');

  const gananciasAcumInicioCurr = sumGroup('GANANCIAS_ACUM_BASE', 'totCurr');
  const gananciasAcumInicioPrev = sumGroup('GANANCIAS_ACUM_BASE', 'totPrev');

  const gananciasAcumFinalCurr = gananciasAcumInicioCurr + utilidadNetaCurr;
  const gananciasAcumFinalPrev = gananciasAcumInicioPrev + utilidadNetaPrev;

  const totalPatrimonioCurr = capitalSocialCurr + gananciasAcumFinalCurr + reservasCurr + revalorizacionCurr;
  const totalPatrimonioPrev = capitalSocialPrev + gananciasAcumFinalPrev + reservasPrev + revalorizacionPrev;

  const totalPasivoPatrimonioCurr = totalPasivoCurr + totalPatrimonioCurr;
  const totalPasivoPatrimonioPrev = totalPasivoPrev + totalPatrimonioPrev;

  // ==================== 3. ESTADO DE FLUJOS DE EFECTIVO (MÉTODO INDIRECTO) ====================
  const depreciacionPeriodo = getCode('5160', 'totCurr') + getCode('5165', 'totCurr') + getCode('5260', 'totCurr') + getCode('5265', 'totCurr') + getCode('7360', 'totCurr');
  const varDeudores = -(deudoresCpCurr + anticipoImpCurr + deudoresLpCurr - (deudoresCpPrev + anticipoImpPrev + deudoresLpPrev));
  const varInventarios = -(inventariosCurr - inventariosPrev);
  const varAnticipados = -((pagosAnticipadosCurr + intangiblesCurr) - (pagosAnticipadosPrev + intangiblesPrev));
  const varAcreedores = (acreedoresCpCurr + acreedoresLpCurr) - (acreedoresCpPrev + acreedoresLpPrev);
  const varImpuestos = impuestosCpCurr - impuestosCpPrev;
  const varLaborales = laboralesCpCurr - laboralesCpPrev;
  const varProvisiones = provisionesCpCurr - provisionesCpPrev;
  const ajustePatrimonio = (gananciasAcumInicioCurr - gananciasAcumFinalPrev);

  const flujoOperacion =
    utilidadNetaCurr +
    depreciacionPeriodo +
    ajustePatrimonio +
    varDeudores +
    varInventarios +
    varAnticipados +
    varAcreedores +
    varImpuestos +
    varLaborales +
    varProvisiones;

  const flujoInversion = -(ppeBrutoCurr - ppeBrutoPrev);
  const flujoFinanciacion = (obligFinCpCurr + obligFinLpCurr) - (obligFinCpPrev + obligFinLpPrev) + (capitalSocialCurr - capitalSocialPrev);
  const flujoNeto = flujoOperacion + flujoInversion + flujoFinanciacion;
  const efectivoInicial = efectivoPrev;
  const efectivoFinal = efectivoInicial + flujoNeto;

  // ==================== 4. INDICADORES FINANCIEROS ====================
  const razonCorrienteCurr = pasivoCorrienteCurr > 0 ? activoCorrienteCurr / pasivoCorrienteCurr : 0;
  const razonCorrientePrev = pasivoCorrientePrev > 0 ? activoCorrientePrev / pasivoCorrientePrev : 0;

  const capitalTrabajoCurr = activoCorrienteCurr - pasivoCorrienteCurr;
  const capitalTrabajoPrev = activoCorrientePrev - pasivoCorrientePrev;

  const coberturaInteresesCurr = gastosInteresesCurr > 0 ? utilidadOperacionalCurr / gastosInteresesCurr : 0;
  const coberturaInteresesPrev = gastosInteresesPrev > 0 ? utilidadOperacionalPrev / gastosInteresesPrev : 0;

  const endeudamientoCurr = totalActivoCurr > 0 ? totalPasivoCurr / totalActivoCurr : 0;
  const endeudamientoPrev = totalActivoPrev > 0 ? totalPasivoPrev / totalActivoPrev : 0;

  const roaOpCurr = totalActivoCurr > 0 ? utilidadOperacionalCurr / totalActivoCurr : 0;
  const roaOpPrev = totalActivoPrev > 0 ? utilidadOperacionalPrev / totalActivoPrev : 0;
  const roaNetoCurr = totalActivoCurr > 0 ? utilidadNetaCurr / totalActivoCurr : 0;

  const roeOpCurr = totalPatrimonioCurr > 0 ? utilidadOperacionalCurr / totalPatrimonioCurr : 0;
  const roeOpPrev = totalPatrimonioPrev > 0 ? utilidadOperacionalPrev / totalPatrimonioPrev : 0;
  const roeNetoCurr = totalPatrimonioCurr > 0 ? utilidadNetaCurr / totalPatrimonioCurr : 0;

  const margenBrutoCurr = ingresosOrdCurr > 0 ? (gananciaBrutaCurr / ingresosOrdCurr) * 100 : 0;
  const margenBrutoPrev = ingresosOrdPrev > 0 ? (gananciaBrutaPrev / ingresosOrdPrev) * 100 : 0;
  const margenOpCurr = ingresosOrdCurr > 0 ? (utilidadOperacionalCurr / ingresosOrdCurr) * 100 : 0;
  const margenOpPrev = ingresosOrdPrev > 0 ? (utilidadOperacionalPrev / ingresosOrdPrev) * 100 : 0;
  const margenNetoCurr = ingresosOrdCurr > 0 ? (utilidadNetaCurr / ingresosOrdCurr) * 100 : 0;
  const margenNetoPrev = ingresosOrdPrev > 0 ? (utilidadNetaPrev / ingresosOrdPrev) * 100 : 0;

  return {
    client,
    yearCurrent,
    yearPrev,
    accountsLevel4: Array.from(byCode4.values()),
    thirdParties,
    esf: {
      efectivoCurr, efectivoPrev,
      efectivoEmp: sumGroup('EFECTIVO', 'empCurr') + sumGroup('INVERSIONES_CP', 'empCurr'),
      efectivoCons: sumGroup('EFECTIVO', 'consCurr') + sumGroup('INVERSIONES_CP', 'consCurr'),
      deudoresCpCurr, deudoresCpPrev,
      deudoresCpEmp: sumGroup('DEUDORES_CP', 'empCurr'),
      deudoresCpCons: sumGroup('DEUDORES_CP', 'consCurr'),
      anticipoImpCurr, anticipoImpPrev,
      inventariosCurr, inventariosPrev,
      activoCorrienteCurr, activoCorrientePrev,
      ppeNetoCurr, ppeNetoPrev,
      ppeBrutoCurr, ppeBrutoPrev,
      ppeDeprecCurr, ppeDeprecPrev,
      deudoresLpCurr, deudoresLpPrev,
      intangiblesCurr, intangiblesPrev,
      pagosAnticipadosCurr, pagosAnticipadosPrev,
      activoNoCorrienteCurr, activoNoCorrientePrev,
      totalActivoCurr, totalActivoPrev,
      obligFinCpCurr, obligFinCpPrev,
      acreedoresCpCurr, acreedoresCpPrev,
      impuestosCpCurr, impuestosCpPrev,
      laboralesCpCurr, laboralesCpPrev,
      provisionesCpCurr, provisionesCpPrev,
      pasivoCorrienteCurr, pasivoCorrientePrev,
      obligFinLpCurr, obligFinLpPrev,
      acreedoresLpCurr, acreedoresLpPrev,
      pasivoNoCorrienteCurr, pasivoNoCorrientePrev,
      totalPasivoCurr, totalPasivoPrev,
      capitalSocialCurr, capitalSocialPrev,
      gananciasAcumFinalCurr, gananciasAcumFinalPrev,
      gananciasAcumInicioCurr, gananciasAcumInicioPrev,
      reservasCurr, reservasPrev,
      revalorizacionCurr, revalorizacionPrev,
      totalPatrimonioCurr, totalPatrimonioPrev,
      totalPasivoPatrimonioCurr, totalPasivoPatrimonioPrev,
      cuadreDiffCurr: totalActivoCurr - totalPasivoPatrimonioCurr,
      cuadreDiffPrev: totalActivoPrev - totalPasivoPatrimonioPrev
    },
    eri: {
      ingresosOrdCurr, ingresosOrdPrev, ingresosOrdEmp, ingresosOrdCons,
      costoVentasCurr, costoVentasPrev, costoVentasEmp, costoVentasCons,
      gananciaBrutaCurr, gananciaBrutaPrev, gananciaBrutaEmp, gananciaBrutaCons,
      gastosVentasCurr, gastosVentasPrev, gastosVentasEmp, gastosVentasCons,
      gastosAdminCurr, gastosAdminPrev, gastosAdminEmp, gastosAdminCons,
      utilidadOperacionalCurr, utilidadOperacionalPrev, utilidadOperacionalEmp, utilidadOperacionalCons,
      otrosIngresosCurr, otrosIngresosPrev, otrosIngresosEmp, otrosIngresosCons,
      gastosFinancierosCurr, gastosFinancierosPrev,
      gastosInteresesCurr, gastosInteresesPrev,
      otrosGastosCurr, otrosGastosPrev,
      gananciaAntesImpCurr, gananciaAntesImpPrev,
      impuestoRentaCurr, impuestoRentaPrev,
      utilidadNetaCurr, utilidadNetaPrev, utilidadNetaEmp, utilidadNetaCons
    },
    efc: {
      utilidadNeta: utilidadNetaCurr,
      depreciacionPeriodo,
      ajustePatrimonio,
      varDeudores,
      varInventarios,
      varAnticipados,
      varAcreedores,
      varImpuestos,
      varLaborales,
      varProvisiones,
      flujoOperacion,
      flujoInversion,
      flujoFinanciacion,
      flujoNeto,
      efectivoInicial,
      efectivoFinal
    },
    ecp: {
      capitalInicialCurr: capitalSocialPrev,
      capitalFinalCurr: capitalSocialCurr,
      capitalInicialPrev: capitalSocialPrev,
      capitalFinalPrev: capitalSocialPrev,
      reservasInicialCurr: reservasPrev,
      reservasFinalCurr: reservasCurr,
      gananciasInicialCurr: gananciasAcumInicioCurr,
      utilidadPeriodoCurr: utilidadNetaCurr,
      gananciasFinalCurr: gananciasAcumFinalCurr,
      gananciasInicialPrev: gananciasAcumInicioPrev,
      utilidadPeriodoPrev: utilidadNetaPrev,
      gananciasFinalPrev: gananciasAcumFinalPrev,
      totalPatrimonioCurr,
      totalPatrimonioPrev
    },
    indicators: {
      razonCorrienteCurr, razonCorrientePrev,
      capitalTrabajoCurr, capitalTrabajoPrev,
      coberturaInteresesCurr, coberturaInteresesPrev,
      endeudamientoCurr, endeudamientoPrev,
      roaOpCurr, roaOpPrev, roaNetoCurr,
      roeOpCurr, roeOpPrev, roeNetoCurr,
      margenBrutoCurr, margenBrutoPrev,
      margenOpCurr, margenOpPrev,
      margenNetoCurr, margenNetoPrev
    },
    notesDetail: {
      nota4Efectivo: ['1105', '1110', '1120', '1125', '1210', '1225', '1255'].map(c => byCode4.get(c)).filter(Boolean),
      nota5Deudores: ['1305', '1308', '1330', '1340', '1350', '1365', '1370', '1380', '1399'].map(c => byCode4.get(c)).filter(Boolean),
      nota6AnticiposImp: [
        { code: '1355', name: 'Anticipo de Impuestos y Contribuciones (Total)', totCurr: getCode('1355', 'totCurr'), totPrev: getCode('1355', 'totPrev') },
        { code: '135515', name: 'Retención en la Fuente a Favor', totCurr: getExact(true, '135515'), totPrev: getExact(false, '135515') },
        { code: '135517', name: 'Impuesto a las Ventas Retenido', totCurr: getExact(true, '135517'), totPrev: getExact(false, '135517') },
        { code: '135518', name: 'Impuesto de Industria y Comercio Retenido', totCurr: getExact(true, '135518'), totPrev: getExact(false, '135518') }
      ],
      nota7Inventarios: ['1405', '1410', '1430', '1435', '1455', '1460', '1499'].map(c => byCode4.get(c)).filter(Boolean),
      nota8PPE: ['1504', '1508', '1512', '1516', '1520', '1524', '1528', '1540', '1560', '1592'].map(c => byCode4.get(c)).filter(Boolean),
      nota13Impuestos: ['2365', '2367', '2368', '2369', '2370', '2404', '2408', '2412', '2480'].map(c => byCode4.get(c)).filter(Boolean),
      nota14Laborales: ['2505', '2510', '2515', '2520', '2525'].map(c => byCode4.get(c)).filter(Boolean),
      nota15ObligFinLp: ['2105', '2115', '2195'].map(c => byCode4.get(c)).filter(Boolean),
      nota16AcreedoresLp: ['2205', '2335', '2355', '2380'].map(c => byCode4.get(c)).filter(Boolean),
      nota20Ingresos: ['4130', '4135', '4145', '4155', '4175'].map(c => byCode4.get(c)).filter(Boolean),
      nota20Costos: ['6130', '6135', '6145', '6155', '7205', '7210', '7225', '7230', '7235', '7240', '7245', '7255', '7295', '7490'].map(c => byCode4.get(c)).filter(Boolean),
      nota21OtrosIngresos: ['4205', '4210', '4220', '4235', '4245', '4250', '4255', '4265', '4295'].map(c => byCode4.get(c)).filter(Boolean),
      nota22GastosAdmin: ['5105', '5110', '5115', '5120', '5125', '5130', '5135', '5140', '5145', '5150', '5155', '5160', '5165', '5195'].map(c => byCode4.get(c)).filter(Boolean),
      nota24GastosVentas: ['5205', '5210', '5215', '5220', '5225', '5230', '5235', '5240', '5245', '5250', '5255', '5260', '5265', '5295'].map(c => byCode4.get(c)).filter(Boolean),
      nota25OtrosGastos: ['5310', '5315', '5395'].map(c => byCode4.get(c)).filter(Boolean)
    }
  };
}

module.exports = {
  PUC_CATALOG,
  classifyAccount,
  normalizeSign,
  buildFinancialStatements
};
