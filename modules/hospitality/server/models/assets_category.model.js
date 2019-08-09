"use strict";

module.exports = function(sequelize, DataTypes) {
    var assetsCategory = sequelize.define('assets_category', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        assets_master_id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
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
        api_url: {
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
        tableName: 'assets_category',
        associate: function(models) {
            if (models.assets_details){
                assetsCategory.hasMany(models.assets_details, {foreignKey: 'assets_category_id'})
            }
            if (models.assets_master) {
                assetsCategory.belongsTo(models.assets_master, {foreignKey: 'assets_master_id'});
            }
                assetsCategory.belongsTo(models.settings, {foreignKey: 'company_id'});
        }
    });
    return assetsCategory;
};
