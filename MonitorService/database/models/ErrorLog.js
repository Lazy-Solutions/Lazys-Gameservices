// models/error.js
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../sequalize.js';

export class ErrorLog extends Model { }

ErrorLog.init({
    service: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    instance:{
        type: DataTypes.STRING,
        allowNull: true,
    },
    error_message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stackTrace: {
        
        type: DataTypes.TEXT,
        allowNull: false,
    },
    severity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
    },
    // You can add more fields as needed
}, {
    sequelize,
    modelName: 'errorLog',
});
