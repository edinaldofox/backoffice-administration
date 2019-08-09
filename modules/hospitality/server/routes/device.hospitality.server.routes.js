'use strict';
/**
 * Module dependencies.
 */
var path = require('path'),
    config = require(path.resolve('./config/config')),
    hospitalityauthPolicy = require(path.resolve('./modules/hospitality/server/auth/hospitality.server.auth')),
    deviceauthpolicy = require(path.resolve('./modules/deviceapiv2/server/auth/apiv2.server.auth.js')),
    readuserdataController = require(path.resolve('./modules/deviceapiv2/server/controllers/_this_request.server.controller')),
    hospitalityController = require(path.resolve('./modules/hospitality/server/controllers/device.hospitalitycredentials.server.controller')),
    hospitalityCustomerinfo = require(path.resolve('./modules/hospitality/server/controllers/device.hospitalitycustomerinfo.server.controller')),
    homepageController = require(path.resolve('./modules/hospitality/server/controllers/device.homepage.server.controller')),
    assetsController = require(path.resolve('./modules/hospitality/server/controllers/device.assets.server.controllers')),
    assets_master = require(path.resolve('./modules/hospitality/server/controllers/assets_master.controller')),
    assets_category = require(path.resolve('./modules/hospitality/server/controllers/assets_category.controller')),
    assets_details = require(path.resolve('./modules/hospitality/server/controllers/assets_details.controller')),
    cache = require('apicache'),
    winston = require(path.resolve('./config/lib/winston'));

module.exports = function(app) {

    /* ===== login with mac address ===== */
    app.route('/apiv3/credentials/login_device_mac')
        .all(hospitalityauthPolicy.plainAuth)
        .all(hospitalityauthPolicy.isAccountAllowed)
        .post(hospitalityController.login_device_mac);

    /* ===== login with mac address ===== */
    app.route('/apiv2/credentials/login_device_mac')
        .all(hospitalityauthPolicy.plainAuth)
        .all(hospitalityauthPolicy.isAccountAllowed)
        .post(hospitalityController.login_device_mac);


    /* ----------------------------------------------  CUSTOMER INFO ---------------------------------------------- */

    /* ===== Hotel Info ===== */
    app.route('/apiv3/hospitality/hotelinfo/:companyid')
        .all(deviceauthpolicy.isAllowed)
        .get(hospitalityCustomerinfo.hotelinfo);

    /* ===== Customer Booking ===== */
    app.route('/apiv3/hospitality/customerbooking/:companyid/:roomnumber')
        .all(deviceauthpolicy.isAllowed)
        .get(hospitalityCustomerinfo.customerbooking);


    /* ===== Customer Orders ===== */
    app.route('/apiv3/hospitality/customerorders/:companyid/:roomnumber')
        .all(deviceauthpolicy.isAllowed)
        .get(hospitalityCustomerinfo.customerorders);


    /* ===== Customer Checkout ===== */
    app.route('/apiv3/hospitality/customercheckout/:companyid/:roomnumber')
        .all(deviceauthpolicy.isAllowed)
        .post(hospitalityCustomerinfo.customercheckout);


    /* ----------------------------------------------  ASSETS APIs ---------------------------------------------- */

    //Assets Menu & Carousel
    app.route('/apiv3/assets/assets_menu')
        .all(deviceauthpolicy.isAllowed)
        .get(assetsController.assets_menu_list);

    app.route('/apiv3/assets/assets_list/:asset_category_id')
        .all(deviceauthpolicy.isAllowed)
        .get(assetsController.get_assets_items_list);

    app.route('/apiv3/assets/asset_details/:asset_id')
        .all(deviceauthpolicy.isAllowed)
        .get(assetsController.get_assets_item_details);

    /* ---------------------------------------------- Homepage API ---------------------------------------------- */

    //Assets Menu & Carousel
    app.route('/apiv3/homepage/:companyid')
        //.all(deviceauthpolicy.isAllowed)
        .all(deviceauthpolicy.isAuthTokenValid)
        .all(readuserdataController.read_thisuser_information)
        .get(homepageController.get_company_homepage);

};
