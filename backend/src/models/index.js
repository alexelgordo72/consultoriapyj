const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Modelo de Usuario
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER
    },
    username: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    password_hash: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(255)
    },
    role: {
        type: DataTypes.STRING(50),
        defaultValue: 'consultor'
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active'
    },
    last_login: {
        type: DataTypes.DATE
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'users',
    timestamps: false
});

// Modelo de Cliente
const Client = sequelize.define('Client', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nit: {
        type: DataTypes.STRING(50)
    },
    email: {
        type: DataTypes.STRING(255)
    },
    phone: {
        type: DataTypes.STRING(50)
    },
    address: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'active'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'clients',
    timestamps: false
});

module.exports = {
    sequelize,
    User,
    Client
};
