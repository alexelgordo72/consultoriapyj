const pool = require('../services/database');

const getClients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*,
              (SELECT COUNT(*) FROM imported_files f WHERE f.client_id = c.id) AS files_count
       FROM clients c
       WHERE c.status = 'active'
       ORDER BY c.id ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error listando clientes:', error);
    res.status(500).json({ error: error.message });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createClient = async (req, res) => {
  try {
    const {
      name, nit, email, phone, address, city,
      incorporation_info, corporate_purpose, company_size,
      legal_representative, legal_rep_id,
      accountant_name, accountant_tp,
      auditor_name, auditor_tp,
      consortium_name, consortium_share
    } = req.body;

    if (!name || !nit) {
      return res.status(400).json({ error: 'Nombre o Razón Social y NIT son obligatorios' });
    }

    const result = await pool.query(
      `INSERT INTO clients (
        tenant_id, name, nit, email, phone, address, city,
        incorporation_info, corporate_purpose, company_size,
        legal_representative, legal_rep_id,
        accountant_name, accountant_tp,
        auditor_name, auditor_tp,
        consortium_name, consortium_share, status
      )
      VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'active')
      RETURNING *`,
      [
        name.trim(), nit.trim(), email || '', phone || '', address || '', city || 'Yumbo - Valle del Cauca',
        incorporation_info || '', corporate_purpose || '', company_size || 'Pyme - NIIF Grupo 2',
        legal_representative || '', legal_rep_id || '',
        accountant_name || '', accountant_tp || '',
        auditor_name || '', auditor_tp || '',
        consortium_name || '', parseFloat(consortium_share) || 0
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error creando cliente:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, nit, email, phone, address, city,
      incorporation_info, corporate_purpose, company_size,
      legal_representative, legal_rep_id,
      accountant_name, accountant_tp,
      auditor_name, auditor_tp,
      consortium_name, consortium_share
    } = req.body;

    const result = await pool.query(
      `UPDATE clients SET
        name = COALESCE($1, name),
        nit = COALESCE($2, nit),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        address = COALESCE($5, address),
        city = COALESCE($6, city),
        incorporation_info = COALESCE($7, incorporation_info),
        corporate_purpose = COALESCE($8, corporate_purpose),
        company_size = COALESCE($9, company_size),
        legal_representative = COALESCE($10, legal_representative),
        legal_rep_id = COALESCE($11, legal_rep_id),
        accountant_name = COALESCE($12, accountant_name),
        accountant_tp = COALESCE($13, accountant_tp),
        auditor_name = COALESCE($14, auditor_name),
        auditor_tp = COALESCE($15, auditor_tp),
        consortium_name = COALESCE($16, consortium_name),
        consortium_share = COALESCE($17, consortium_share)
       WHERE id = $18
       RETURNING *`,
      [
        name, nit, email, phone, address, city,
        incorporation_info, corporate_purpose, company_size,
        legal_representative, legal_rep_id,
        accountant_name, accountant_tp,
        auditor_name, auditor_tp,
        consortium_name, consortium_share !== undefined ? parseFloat(consortium_share) : null,
        id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getClients, getClientById, createClient, updateClient };
