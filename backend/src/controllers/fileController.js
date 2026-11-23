const pool = require('../services/database');

const getFiles = async (req, res) => {
  try {
    const { clientId } = req.params;
    const result = await pool.query(
      `SELECT id, client_id, file_name, file_type, period_year, source_role, status, upload_date
       FROM imported_files
       WHERE client_id = $1
       ORDER BY upload_date DESC`,
      [clientId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteFile = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fileId } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM accounting_balances WHERE file_id = $1', [fileId]);
    await client.query('DELETE FROM imported_files WHERE id = $1', [fileId]);
    await client.query('COMMIT');
    res.json({ success: true, message: 'Archivo y saldos asociados eliminados' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

module.exports = { getFiles, deleteFile };
