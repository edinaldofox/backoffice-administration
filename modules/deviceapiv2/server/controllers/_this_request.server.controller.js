'use strict'
var path = require('path'),
    db = require(path.resolve('./config/lib/sequelize')),
    responses = require(path.resolve("./config/responses.js")),
    models = db.models,
    winston = require(path.resolve('./config/lib/winston'));


//read data for current company and pass them to req.thiscompany
exports.read_company_advanced_settings = function(req, res, next) {
    let COMPANY_ID = req.get("company_id") || 1;

    models.advanced_settings.findAll({
        where: {company_id: COMPANY_ID }
    }).then(function(company_data) {
        req.thiscompany = company_data;
        next();
        return false;
    }).catch(function(error){
        winston.error("Quering for company data failed with error: ", error);
        responses.send_res(req, res, [], 706, -1, 'DATABASE_ERROR_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};


//find one user data information and pass it to request
exports.read_thisuser_information = function(req,res,next){
    let COMPANY_ID = req.get("company_id") || 1;

    models.login_data.findOne({
        where: {username: req.auth_obj.username, company_id: COMPANY_ID},
        include: [{model:models.customer_data}] //{model:models.subscription}
    }).then(function (result) {
        if(result) {
              req.thisuser = result;
              next();
              return null; //returns promise
            }
            else {
            responses.send_res_get(req, res, [], 702, -1, 'USER_NOT_FOUND_DESCRIPTION', 'USER_NOT_FOUND_DATA', 'no-store');
        }
    }).catch(function(error) {
        responses.send_res_get(req, res, [], 888, -1, 'USER_NOT_FOUND_DESCRIPTION', 'DATABASE_ERROR_DATA', 'no-store');
    });
};