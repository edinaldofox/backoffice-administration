'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    assets_master = require(path.resolve('./modules/hospitality/server/controllers/assets_master.controller')),
    assets_category = require(path.resolve('./modules/hospitality/server/controllers/assets_category.controller')),
    assets_details = require(path.resolve('./modules/hospitality/server/controllers/assets_details.controller')),
    policy = require(path.resolve('./modules/mago/server/policies/mago.server.policy')),
    cache = require('apicache'),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    /* ===== assets_master  ===== */
    app.route('/api/assetsMaster')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(assets_master.list)
        .post(assets_master.create);

    app.route('/api/assetsMaster/:assetsMasterId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(assets_master.read)
        .put(assets_master.update)
        .delete(assets_master.delete);

    app.param('assetsMasterId', assets_master.dataByID);

    /* ===== assets_category  ===== */
    app.route('/api/assetsCategory')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(assets_category.list)
        .post(assets_category.create);

    app.route('/api/assetsCategory/:assetsCategoryId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(assets_category.read)
        .put(assets_category.update)
        .delete(assets_category.delete);

    app.param('assetsCategoryId', assets_category.dataByID);

    /* ===== assets_details  ===== */
    app.route('/api/assetsDetails')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(assets_details.list)
        .post(assets_details.create);

    app.route('/api/assetsDetails/:assetsDetailsId')
        .all(policy.Authenticate)
        .all(policy.isAllowed)
        .get(assets_details.read)
        .put(assets_details.update)
        .delete(assets_details.delete);

    app.param('assetsDetailsId', assets_details.dataByID);

};
