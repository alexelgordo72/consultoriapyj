# PyJ Consultoría Financiera — Sistema Automatizado NIIF

Plataforma web full-stack para automatizar el procesamiento de Balances de Prueba contables (Loggro / PUC) y generar los estados financieros comparativos bajo NIIF para Pymes en Colombia, incluyendo desgloses por terceros y consorcios.

## Arquitectura

- **Frontend:** React 19 + Vite (`frontend/`, puerto `5173`).
- **Backend:** Node.js + Express (`backend/src/app.js`, puerto `4000`), procesamiento Excel (`xlsx` / `exceljs`) y generación de PDF (`pdfkit`).
- **Base de Datos y Caché:** PostgreSQL 15 (`consultor_excel_db`) y Redis 7 en contenedores Docker.
- **Gestor de Procesos:** PM2 (`consultor-backend` y `consultor-frontend`).

## Entregables Generados por Cliente

1. Estado de Situación Financiera (ESF) comparativo y consolidado.
2. Estado de Resultados Integral (ERI).
3. Estado de Flujos de Efectivo (EFC - Método Indirecto).
4. Estado de Cambios en el Patrimonio (ECP).
5. Indicadores Financieros (Liquidez, Endeudamiento, ROA, ROE y Márgenes).
6. Notas a los Estados Financieros bajo NIIF (incluye detalle de cartera y proveedores por NIT).
7. Certificación de los Estados Financieros (Art. 37 Ley 222 de 1995).
8. Dictamen del Revisor Fiscal (NIA 700).
9. Informe de Gestión (Art. 47 Ley 222 de 1995).
10. Libro Excel Consolidado Formulado (`.xlsx`) con hoja de detalle por terceros.
