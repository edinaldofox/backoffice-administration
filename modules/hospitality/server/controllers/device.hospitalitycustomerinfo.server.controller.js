'use strict';
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    sequelize = require('sequelize'),
    response = require(path.resolve("./config/responses.js")),
    crypto = require('crypto'),
    models = db.models,
    winston = require(path.resolve('./config/lib/winston'));
//var sequelizes =  require(path.resolve('./config/lib/sequelize'));
var async = require('async');
var dateformat = require('dateformat');


/**
 * @api {get} /apiv3/hospitality/hotelinfo/:companyid  Get Hotel Info
 * @apiName GetHotelInfo
 * @apiGroup Hospitality
 *
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 * @apiDescription GET Hotel Information
 *
 */
exports.hotelinfo = function(req, res) {

    let thisresponse = [{
                        title: "Air-Conditioning",
                        description: "Each room is fitted with individual digital thermostat control for the central air conditioning unit, The temperature and the fan speed can be adjusted to the level you feel comfortable."
                        },
                        {
                            title: "Laundry / Dry Cleaning",
                            description: "The hotel has an in-house laundry facility and is pleased to supply this service daily. Laundry bags are located in the wardrobe of your room. Kindly fill out the laundry form and our staff will pickup your laundry from your room. Please do not put your laundry bag outside the room."
                        },
                        {
                            title: "Doctor on call",
                            description: "Should you require medical attention, a nurse is on standby 24 hours a day at the hotel and a doctor is on call at all times for emergencies. Doctor's fee can be billed to your room account."
                        },
                        {
                            title: "Safety Deposit box.",
                            description: "Guest are advised to use the hotel's safety deposit boxes located on all guest rooms for keeping their valuables as hotel's liability is limited for such items. Safety boxes are also available at the front desk."
                        },
                        {
                            title: "Mini Bar",
                            description: "For you convenience and refreshment a selection of beverages and snacks are available in your room. The mini bar will be re-stocked on a daily basis and the consumption is billed to your room account. Should you have other requirements, please contact our staff."
                        },
                        {
                            title: "Safety Deposit box.",
                            description: "Guest are advised to use the hotel's safety deposit boxes located on all guest rooms for keeping their valuables as hotel's liability is limited for such items. Safety boxes are also available at the front desk."
                        },
                        {
                            title: "Fire and Emergency",
                            description: "For emergency like  fire / earthquake / Other emergency please call \"4\". In case of fire calmly tell our staff the location of the and if possible, the extent of it, then leave immediately! Additionally please refer to the \"Fire safety and security card\" for further fire safety instruction. The evacuation plan is on the back of your door."
                        }
                    ];


    response.sendv3(req, res, thisresponse, 200, -1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');

};


/**
 * @api {get} /apiv3/hospitality/customerbooking/:companyid/:roomnumber  Get Booking Info
 * @apiName GetCustomerBooking
 * @apiGroup Hospitality
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 *
 * @apiDescription GET Customer Booking
 *
 */

exports.customerbooking = function(req, res) {

    let thisresponse = [{
        room_type: "Standard Double Room",
        checkin_date: "2019-06-24",
        checkout_date: "2019-08-26"}];

    response.sendv3(req, res, thisresponse, 200, -1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');

};


/**
 * @api {get} /apiv3/hospitality/customerorders/:companyid/:roomnumber  Get customer orders
 * @apiName GetCustomerOrders
 * @apiGroup Hospitality
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 * @apiDescription GET Customer Orders
 *
 */

exports.customerorders = function(req, res) {

    let thisresponse = [{
        id: 1,
        description: "City Heritage Tour",
        datetime: "2019-06-22 13:05:05",
        status: "complete"
    },
        {
            id: 1,
            description: "Bicycle grand tour",
            datetime: "2019-06-22 13:05:05",
            status: "canceled"
        },
        {
            id: 2,
            description: "Dinner at Plaza Restaurant",
            datetime: "2019-06-22 13:05:05",
            status: "complete"
        },
        {
            id: 4,
            description: "Taxi/Shuttle Service",
            datetime: "2019-06-22 13:05:05",
            status: "complete"
        },
        {
            id: 5,
            description: "Movie - Kung Fu Panda 2",
            datetime: "2019-06-22 13:05:05",
            status: "complete"
        }
        ,
        {
            id: 6,
            description: "Economy Car rental from Hertz",
            datetime: "2019-06-22 13:05:05",
            status: "pending"
        }
        ,
        {
            id: 7,
            description: "Description for item 1",
            datetime: "2019-06-22 13:05:05",
            status: "complete"
        }
    ];

    response.sendv3(req, res, thisresponse, 200, -1, 'OK_DESCRIPTION', 'OK_DATA', 'no-store');
};

/**
 * @api {POST} /apiv3/hospitality/customercheckout/:companyid/:roomnumber  Guest Checkout
 * @apiName GuestCheckout
 * @apiGroup Hospitality
 *
 * @apiHeader (DeviceHeaders) {String} auth Authorization value.
 *
 * @apiDescription Guest Checkout
 *
 */

exports.customercheckout = function(req, res) {

    response.sendv3(req, res, [], 200, -1, 'CHECKOUT_SUCCESS', 'CHECKOUT_SUCCESS', 'no-store');

};

