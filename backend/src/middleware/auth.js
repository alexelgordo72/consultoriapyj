const jwt = require('jsonwebtoken');
const pool = require('../services/database');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'consultor_excel_secret_key_2025');
        
        const result = await pool.query(
            'SELECT id, username, email, full_name, role, tenant_id FROM users WHERE id = $1 AND status = $2',
            [decoded.userId, 'active']
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
        }
        
        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        console.error('Error en autenticación:', error);
        res.status(500).json({ error: 'Error en autenticación' });
    }
};

const authorize = (role) => {
    return (req, res, next) => {
        if (req.user.role !== role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'No tiene permiso para realizar esta acción' });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
