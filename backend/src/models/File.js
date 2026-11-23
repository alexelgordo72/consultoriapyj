const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImportedFile = sequelize.define('ImportedFile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER
    },
    file_name: {
        type: DataTypes.STRING(255)
    },
    file_type: {
        type: DataTypes.STRING(50)
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'pending'
    },
    upload_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'imported_files',
    timestamps: false
});

const Account = sequelize.define('Account', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER
    },
    account_code: {
        type: DataTypes.STRING(20)
    },
    account_name: {
        type: DataTypes.STRING(255)
    },
    account_level: {
        type: DataTypes.INTEGER
    },
    parent_code: {
        type: DataTypes.STRING(20)
    },
    account_type: {
        type: DataTypes.STRING(20)
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'accounts',
    timestamps: false
});

const AccountingBalance = sequelize.define('AccountingBalance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tenant_id: {
        type: DataTypes.INTEGER
    },
    file_id: {
        type: DataTypes.INTEGER
    },
    account_code: {
        type: DataTypes.STRING(20)
    },
    period_date: {
        type: DataTypes.DATE
    },
    opening_balance: {
        type: DataTypes.DECIMAL(20, 8),
        defaultValue: 0
    },
    debits: {
        type: DataTypes.DECIMAL(20, 8),
        defaultValue: 0
    },
    credits: {
        type: DataTypes.DECIMAL(20, 8),
        defaultValue: 0
    },
    net_movement: {
        type: DataTypes.DECIMAL(20, 8),
        defaultValue: 0
    },
    closing_balance: {
        type: DataTypes.DECIMAL(20, 8),
        defaultValue: 0
    },
    document_id: {
        type: DataTypes.INTEGER,
        defaultValue: 1
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
    tableName: 'accounting_balances',
    timestamps: false
});

module.exports = {
    ImportedFile,
    Account,
    AccountingBalance
};
