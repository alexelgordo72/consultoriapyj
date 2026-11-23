const pool = require('../services/database');
const { LoggroParser } = require('../services/parsers/loggroParser');

const importFile = async (req, res) => {
  const db = await pool.connect();
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo Excel' });
    }

    const clientId = parseInt(req.body.clientId, 10) || 1;
    const periodYear = parseInt(req.body.periodYear, 10) || 2025;
    const allowedRoles = ['empresa', 'consorcio', 'terceros'];
    const sourceRole = allowedRoles.includes(req.body.sourceRole) ? req.body.sourceRole : 'empresa';
    const sharePercentage = parseFloat(req.body.sharePercentage) || 100;
    const tenantId = 1;

    await db.query('BEGIN');

    const insertFile = await db.query(
      `INSERT INTO imported_files (tenant_id, client_id, file_name, file_type, period_year, source_role, status)
       VALUES ($1, $2, $3, 'loggro', $4, $5, 'processing') RETURNING id`,
      [tenantId, clientId, file.originalname, periodYear, sourceRole]
    );
    const fileId = insertFile.rows[0].id;

    const parser = new LoggroParser();
    const parsed = await parser.parse(file.path, { periodYear, sourceRole, sharePercentage });

    for (const pDate of parsed.periods) {
      await db.query(
        `DELETE FROM accounting_balances
         WHERE client_id = $1 AND period_date = $2 AND source_role = $3`,
        [clientId, pDate, sourceRole]
      );
    }

    const uniqueAccounts = new Map();
    for (const rec of parsed.records) {
      if (!rec.thirdPartyNit && !uniqueAccounts.has(rec.accountCode)) {
        uniqueAccounts.set(rec.accountCode, rec);
      }
    }

    for (const acc of uniqueAccounts.values()) {
      await db.query(
        `INSERT INTO accounts (tenant_id, client_id, account_code, account_name, account_level, account_type)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (client_id, account_code) DO UPDATE SET
           account_name = EXCLUDED.account_name,
           account_level = EXCLUDED.account_level,
           account_type = EXCLUDED.account_type`,
        [tenantId, clientId, acc.accountCode, acc.accountName, acc.accountLevel, acc.accountType]
      );
    }

    let savedBalances = 0;
    for (const rec of parsed.records) {
      await db.query(
        `INSERT INTO accounting_balances
         (tenant_id, client_id, file_id, account_code, period_date, source_role,
          opening_balance, debits, credits, net_movement, closing_balance,
          third_party_nit, third_party_name, document_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 1, NOW(), NOW())`,
        [
          tenantId, clientId, fileId, rec.accountCode, rec.periodDate, rec.sourceRole,
          rec.openingBalance, rec.debits, rec.credits, rec.net, rec.closingBalance,
          rec.thirdPartyNit, rec.thirdPartyName
        ]
      );
      savedBalances++;
    }

    await db.query(`UPDATE imported_files SET status = 'completed' WHERE id = $1`, [fileId]);
    await db.query('COMMIT');

    res.json({
      success: true,
      fileId,
      clientId,
      periods: parsed.periods,
      savedAccounts: uniqueAccounts.size,
      savedBalances
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('❌ Error en importación:', error);
    res.status(500).json({ error: error.message });
  } finally {
    db.release();
  }
};

module.exports = { importFile };
