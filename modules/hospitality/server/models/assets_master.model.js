"use strict";

module.exports = function(sequelize, DataTypes) {
    var assetsMaster = sequelize.define('assets_master', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        company_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
        },
        title: {
            type: DataTypes.STRING(32),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        icon_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        order: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            defaultValue: 1
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'assets_master',
        associate: function(models) {
            if (models.assets_category){
                assetsMaster.hasMany(models.assets_category, {foreignKey: 'assets_master_id'})
            }
            assetsMaster.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return assetsMaster;
};
