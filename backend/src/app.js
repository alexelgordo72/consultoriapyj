require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sequelize = require('./config/database');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
const importRoutes = require('./routes/importRoutes');
const reportRoutes = require('./routes/reportRoutes');
const clientRoutes = require('./routes/clientRoutes');
const fileRoutes = require('./routes/fileRoutes');
const authRoutes = require('./routes/auth/authRoutes');

app.use('/api/import', importRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'OK',
            message: 'Backend funcionando 🚀',
            database: 'Conectado'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Error de conexión a la base de datos',
            error: error.message
        });
    }
});

// Iniciar servidor
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a PostgreSQL establecida.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor corriendo en http://0.0.0.0:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📊 Import: http://localhost:${PORT}/api/import`);
            console.log(`📊 Reports: http://localhost:${PORT}/api/reports`);
            console.log(`📊 Clients: http://localhost:${PORT}/api/clients`);
            console.log(`📊 Files: http://localhost:${PORT}/api/files`);
            console.log(`📊 Auth: http://localhost:${PORT}/api/auth`);
        });
    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();
