"use strict";

module.exports = function(sequelize, DataTypes) {
    var assetsDetails = sequelize.define('assets_details', {
        id: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        assets_category_id: {
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
        short_description: {
            type: DataTypes.STRING(128),
            allowNull: false
        },
        long_description: {
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
        rating: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER(11),
            allowNull: false,
        },
        json_actions: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        isavailable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 1
        }
    }, {
        tableName: 'assets_details',
        associate: function(models) {
            assetsDetails.belongsTo(models.settings, {foreignKey: 'company_id'});
            assetsDetails.belongsTo(models.assets_category, {foreignKey: 'assets_category_id'});
        }
    });
    return assetsDetails;
};
