'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    sequelize = require('sequelize'),
    responses = require(path.resolve("./config/responses.js")),
    crypto = require('crypto'),
    models = db.models,
    winston = require(path.resolve('./config/lib/winston'));
//var sequelizes =  require(path.resolve('./config/lib/sequelize'));
var async = require('async');
var dateformat = require('dateformat');


/**
 * @api {get} /apiv3/assets/assets_menu  Get Assets Menu
 * @apiName GetAssetsMenu
 * @apiGroup Assets
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 * @apiDescription GET list of assets menu items
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
exports.assets_menu_list = function(req, res) {

    models.assets_master.findAll({
        attributes: ['id', ['title','name'], 'description',
            [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('icon_url')), 'small_icon_url'],
            [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('assets_master.image_url')), 'image_url'],
            'order',
            'isavailable'],
        include: [{
            model: models.assets_category, attributes: ['id',['title','name'],'description','order',['api_url','url'],'isavailable',
                [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('assets_categories.image_url')), 'image_url']], required: true
        }],
        where: {company_id: req.thisuser.company_id}
    }).then(function (result) {

        responses.sendv3(req, res, result, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');

    }).catch(function(error) {
        winston.error("Getting list of vod menus failed with error: ", error);
        responses.sendv3(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};



/**
 * @api {get} /apiv3/assets/assets_list/:category_id  Get Assets List
 * @apiName GetAssetsList
 * @apiGroup Assets
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 *
 *@apiDescription GET list of assets items for category_id
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */
//todo:build where with order and filters before running query
//todo:improve pagination
exports.get_assets_items_list = function(req, res) {

    var final_where = {};
        final_where.where = {};

    //set range of movies
    //final_where.offset = (!req.query.page) ? 0 : (((parseInt(req.query.page) - 1)) * page_length);
    //final_where.limit = page_length;

    final_where.attributes = ['id',
                                'title',
                                'assets_category_id',
                                'short_description',
                                [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('icon_url')), 'poster_path'],
                                [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('image_url')), 'backdrop_path'],
                                [db.sequelize.fn("concat", 'asset'), 'vod_type'],
                                'rating',
                                'price',
                                'isavailable'
                                ];

    //filter list
    final_where.where.isavailable = true; //return only available movies
    final_where.where.company_id = req.thisuser.company_id;
    final_where.where.assets_category_id = req.params.asset_category_id;


    //prepare order clause
    var order_by = (req.query.order_by) ? req.query.order_by : 'createdAt';
    var order_dir = (req.query.order_dir) ? req.query.order_dir : 'DESC';
    final_where.order = [[order_by, order_dir]];

    models.assets_details.findAndCountAll(
        final_where
    ).then(function (results) {
        let this_response_object = {};
            this_response_object.page = 1;
            this_response_object.total_results = results.count;
            this_response_object.total_pages = 1;
            this_response_object.results = results.rows;

        res.setHeader("X-Total-Count", results.count);

        responses.sendv3(req, res, this_response_object, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {
        winston.error("Getting list of assets failed with error: ", error);
        responses.sendv3(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};



/**
 * @api {get} /apiv3/assets/asset_details/:asset_id  Get Asset Details
 * @apiName GetAssetDetails
 * @apiGroup Assets
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 *
 *@apiDescription GET single asset details
 *
 * Copy paste this auth for testing purposes
 *auth=%7Bapi_version%3D22%2C+appversion%3D1.1.4.2%2C+screensize%3D480x800%2C+appid%3D2%2C+devicebrand%3D+SM-G361F+Build%2FLMY48B%2C+language%3Deng%2C+ntype%3D1%2C+app_name%3DMAGOWARE%2C+device_timezone%3D2%2C+os%3DLinux%3B+U%3B+Android+5.1.1%2C+auth%3D8yDhVenHT3Mp0O2QCLJFhCUfT73WR1mE2QRc1ZE7J22cRfmskdTmhCk9ssGWhoIBpIzoTEOLIqwl%0A47NaUwLoLZjH1i2WRYaiioIRMqhRvH2FsSuf1YG%2FFoT9fEw4CrxF%0A%2C+hdmi%3Dfalse%2C+firmwareversion%3DLMY48B.G361FXXU1APB1%7D
 *
 */

exports.get_assets_item_details = function(req, res) {

    var final_where = {};
    final_where.where = {};

    //set range of movies
    //final_where.offset = (!req.query.page) ? 0 : (((parseInt(req.query.page) - 1)) * page_length);
    //final_where.limit = page_length;

    final_where.attributes = ['id', 'assets_category_id', 'company_id','title','short_description','long_description',
        [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('icon_url')), 'icon_url'],
        [db.sequelize.fn("concat", req.app.locals.backendsettings[req.thisuser.company_id].assets_url, db.sequelize.col('image_url')), 'image_url'],
        'rating','price','json_actions','isavailable'];

    //filter list
    final_where.where.isavailable = true; //return only available movies
    final_where.where.company_id = req.thisuser.company_id;
    final_where.where.id = req.params.asset_id;

    //prepare order clause
    //var order_by = (req.query.order_by) ? req.query.order_by : 'createdAt';
    //var order_dir = (req.query.order_dir) ? req.query.order_dir : 'DESC';
    //final_where.order = [[order_by, order_dir]];

    models.assets_details.findOne(
        final_where
    ).then(function (results) {

        results.dataValues.actions = [
                                        {name:"order", description: languages[req.body.language].language_variables["ORDER"]},
                                        {name:"thumbup", description: languages[req.body.language].language_variables["THUMBUP"]},
                                        {name:"thumbdown", description: languages[req.body.language].language_variables["THUMBDOWN"]},
                                        {name:"back", description: "BACK Button"}
                                    ];

        responses.sendv3(req, res, results, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'private,max-age=86400');
    }).catch(function(error) {

        winston.error("Getting list of assets failed with error: ", error);
        responses.sendv3(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};

