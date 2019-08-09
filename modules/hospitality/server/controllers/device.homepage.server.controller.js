'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    responses = require(path.resolve("./config/responses.js")),
    crypto = require('crypto'),
    models = db.models;
var async = require("async");
var winston = require('winston');

/**
 * @api {get} /apiv3/homepage/:companyid Get device homepage information
 * @apiVersion 0.1.0
 * @apiName HospitalityDeviceHomepage
 * @apiGroup Homepage
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 * @apiHeader (DeviceHeaders) {String} Authorization Authorization value.
 * @apiDescription This api is used login the device using room number (or other convetion) as username and mac address as password.
 *
 * @apiSuccess {String}   video_url             Company video url
 * @apiSuccess {String}   company_name          Company name
 * @apiSuccess {String}   welcome_message       Wellcome message
 * @apiSuccess {String}   contact_info          Hotel contact info
 * @apiSuccess {String}   contact_phone         Hotels phone number
 * @apiSuccess {String}   weather_widget_url    Weather widget url
 * @apiSuccess {String}   customer_fullname     Customers Fullname
 *
 */
exports.get_company_homepage = function(req,res) {
   var responseobject = {};

        responseobject.company_name = req.app.locals.backendsettings[req.thisuser.company_id].company_name;
        responseobject.welcome_message = "Wellcome to " + req.app.locals.backendsettings[req.thisuser.company_id].company_name;
        responseobject.contact_info = "Frontdesk phone: ";
        responseobject.contact_phone = "999";
        responseobject.weather_widget_url = req.app.locals.backendsettings[req.thisuser.company_id].assets_url + "/api/htmlContent/1";
        responseobject.customer_fullname = req.thisuser.customer_datum.firstname + " " + req.thisuser.customer_datum.lastname;
        responseobject.video_url = "http://edgetiboeu.tibo.tv:8081/filmashqip/edgevod/mp4://filma1/vod1280-2.mp4/playlist.m3u8"; //req.app.locals.backendsettings[req.thisuser.company_id].assets_url + "/api/htmlContent/1";


        responses.sendv3(req, res, responseobject, 200, 1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
        //res.send(req.app.locals.backendsettings[req.thisuser.company_id]);

};

