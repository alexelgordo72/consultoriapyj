const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../services/database');

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
        }
        
        const result = await pool.query(
            `SELECT id, username, email, full_name, role, status, tenant_id, password_hash
             FROM users 
             WHERE username = $1 AND status = 'active'`,
            [username]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user = result.rows[0];
        
        // En desarrollo, aceptamos cualquier contraseña
        // En producción, descomentar:
        // const isValid = await bcrypt.compare(password, user.password_hash);
        // if (!isValid) {
        //     return res.status(401).json({ error: 'Credenciales inválidas' });
        // }
        
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = $1',
            [user.id]
        );
        
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'consultor_excel_secret_key_2025',
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );
        
        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                tenantId: user.tenant_id
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const logout = async (req, res) => {
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
};

const getProfile = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, full_name, role, status, tenant_id, created_at, last_login
             FROM users 
             WHERE id = $1`,
            [req.user.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.user.id;
        
        if (!newPassword) {
            return res.status(400).json({ error: 'Nueva contraseña es requerida' });
        }
        
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await pool.query(
            'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
            [hashedPassword, userId]
        );
        
        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, email, password, fullName, role, tenantId } = req.body;
        
        const userCheck = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await pool.query(
            `INSERT INTO users (tenant_id, username, email, password_hash, full_name, role, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'active')
             RETURNING id, username, email, full_name, role`,
            [tenantId || 1, username, email, hashedPassword, fullName, role || 'consultor']
        );
        
        res.json({
            success: true,
            user: result.rows[0],
            message: 'Usuario creado correctamente'
        });
    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const listUsers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, username, email, full_name, role, status, tenant_id, created_at, last_login
             FROM users 
             ORDER BY created_at DESC`
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, email, role, status } = req.body;
        
        let query = 'UPDATE users SET ';
        const updates = [];
        const values = [];
        let paramCount = 1;
        
        if (fullName) {
            updates.push(`full_name = $${paramCount}`);
            values.push(fullName);
            paramCount++;
        }
        if (email) {
            updates.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }
        if (status) {
            updates.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }
        if (role) {
            updates.push(`role = $${paramCount}`);
            values.push(role);
            paramCount++;
        }
        
        updates.push(`updated_at = NOW()`);
        values.push(userId);
        
        query += updates.join(', ') + ` WHERE id = $${paramCount} RETURNING id, username, email, full_name, role, status`;
        
        const result = await pool.query(query, values);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            success: true,
            user: result.rows[0],
            message: 'Usuario actualizado correctamente'
        });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

module.exports = {
    login,
    logout,
    getProfile,
    changePassword,
    createUser,
    listUsers,
    updateUser
};
