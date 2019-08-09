'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    dateFormat = require('dateformat'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    logHandler = require(path.resolve('./modules/mago/server/controllers/logs.server.controller')),
    winston = require('winston'),
    db = require(path.resolve('./config/lib/sequelize')).models,
    merge = require('merge'),
    DBModel = db.settings,
    config = require(path.resolve('./config/config')),
    redis = require(path.resolve('./config/lib/redis')),
    companyFunctions = require(path.resolve('./custom_functions/company')),
    userFunctions = require(path.resolve('./custom_functions/user'));

var sequelize_t = require(path.resolve('./config/lib/sequelize'));
var jwt = require('jsonwebtoken'),
    jwtSecret = "thisIsMySecretPasscode";


/**
 * Show current
 */


exports.read = function (req, res) {
    //for every client company perform a redirect to their setting path, then display their settings. For the mother company, display results
    if (req.token.company_id !== req.settings.id && req.token.role !== 'superadmin') {
        res.redirect(req.path.substr(0, req.path.lastIndexOf("/") + 1) + req.token.company_id); //redirects to /settings_api_example_url/company_id
    }
    else {
        res.json(req.settings);
    }
};

exports.env_settings = function (req, res) {

    var company_id = 1;
    if (req.get("Authorization")) {
        var aHeader = req.get("Authorization");

        //Check if this request is signed by a valid token
        var token = null;
        if (typeof aHeader != 'undefined') token = aHeader;

        try {
            var decoded = jwt.verify(token, jwtSecret);
            company_id = decoded.company_id;
        } catch (err) {
            company_id = 1;
        }
    }
    var env_settings = {
        "backoffice_version": config.seanjs.version + ' ' + config.seanjs.db_migration_nr,
        "company_name": req.app.locals.backendsettings[company_id].company_name,
        "company_logo": req.app.locals.backendsettings[company_id].assets_url + req.app.locals.backendsettings[company_id].company_logo
    };
    res.json(env_settings); //returns version number and other middleware constants
};


/*
* Create
 */
exports.create = function (req, res) {

    //set 30 day trial
    let expire_date = new Date(Date.now());
    let free_trial_days = 30;
    if(req.body.freetrialdays) free_trial_days = 1 * req.body.freetrialdays
    expire_date.setDate(expire_date.getDate() + free_trial_days);
    req.body.expire_date = expire_date;

    return sequelize_t.sequelize.transaction(function (t) {
        // chain all your queries here. make sure you return them.
        return db.settings.create(req.body, { transaction: t }).then(function (new_company) {

            if (!new_company) return res.status(400).send({ message: 'fail create data' });
            else {
                req.app.locals.backendsettings[new_company.id] = new_company;
                req.body.id = new_company.id;
                var channel_stream_sources = { company_id: req.body.id, stream_source: 'Live primary source - ' + req.body.company_name };
                var vod_stream_sources = { company_id: req.body.id, description: 'VOD primary source - ' + req.body.company_name };
                //prepare object for device_menu
                var device_menus = require(path.resolve("./config/defaultvalues/device_menu.json"));
                device_menus.forEach(function (element) { delete element.id });
                device_menus.forEach(function (element) { element.company_id = req.body.id });
                //prepare object for advanced settings
                var advanced_settings = require(path.resolve("./config/defaultvalues/advanced_settings.json"));
                advanced_settings.forEach(function (element) { delete element.id });
                advanced_settings.forEach(function (element) { element.company_id = req.body.id });
                //prepare object for email templates
                var email_templates = require(path.resolve("./config/defaultvalues/email_templates.json"));
                email_templates.forEach(function (element) { delete element.id });
                email_templates.forEach(function (element) { element.company_id = req.body.id });

                req.body.asset_limitations = {
                    "client_limit": req.body.asset_limitations.client_limit,
                    "channel_limit": req.body.asset_limitations.channel_limit,
                    "vod_limit": req.body.asset_limitations.vod_limit
                };
                return db.channel_stream_source.create(channel_stream_sources, { transaction: t }).then(function (new_company) {
                    return db.vod_stream_source.create(vod_stream_sources, { transaction: t }).then(function (vod_source) {
                        return db.device_menu.bulkCreate(device_menus, { transaction: t }).then(function (device_menu) {
                            return db.advanced_settings.bulkCreate(advanced_settings, { transaction: t }).then(function (advanced_settings) {
                                return db.email_templates.bulkCreate(email_templates, { transaction: t })//.then(function(email_templates){});
                            });
                        });
                    });
                });
            }
        });
    }).then(function (result) {
        redis.client.hmset(req.body.id + ':company_settings', req.app.locals.backendsettings[req.body.id])
        res.jsonp(req.app.locals.backendsettings[req.body.id]);
    }).catch(function (err) {
        winston.error("Creating new company failed with error: ", err);
        res.status(400).send({ message: errorHandler.getErrorMessage(err) });
    });
};

exports.createByEmail = function(req, res) {
    //set 30 day trial
    let expire_date = new Date(Date.now());
    expire_date.setDate(expire_date.getDate() + 30);
    req.body.expire_date = expire_date.toString();
   
    companyFunctions.createCompany(req)
    .then(function(result) {
        userFunctions.sendInvite(req, result.owner, true).then(function() {
            res.send({status: true, message: 'Company created successfully! Check your email'});
        }).catch(function(err) {
            res.status(500).send({status: false, message: 'Company created but failded to send invitation'})
        })
    }).catch(function(result) {
        res.status(result.error.code).send({status: false, message: result.error.message});
    });
}

/**
 * Update
 */

exports.update = function (req, res) {
    var new_settings = {}; //final values of settings will be stored here
    var new_setting = {}; //temporary timestamps will be stored here

    //for each activity, if the checkbox was checked, store the current timestamp at the temporary object. Otherwise delete it so that it won't be updated
    //LIVE TV
    if (req.body.updatelivetvtimestamp === true) {
        delete req.body.livetvlastchange;
        new_setting.livetvlastchange = Date.now();
    }
    else delete req.body.livetvlastchange;
    //MAIN MENU
    if (req.body.updatemenulastchange) {
        delete req.body.menulastchange;
        new_setting.menulastchange = Date.now()
    }
    else delete req.body.menulastchange;
    //VOD
    if (req.body.updatevodtimestamp) {
        delete req.body.vodlastchange;
        new_setting.vodlastchange = Date.now()
    }
    else delete req.body.vodlastchange;

    if (req.body.expire_date) {
        new_setting.expire_date = new Date(req.body.expire_date);
        delete req.body.expire_date;
    }

    new_settings = merge(req.body, new_setting); //merge values left @req.body with values stored @temp object into a new object
    logHandler.add_log(req.token.id, req.ip.replace('::ffff:', ''), 'created', JSON.stringify(new_settings)); //write new values in logs

    req.body.asset_limitations = {
        "client_limit": req.body.asset_limitations.client_limit,
        "channel_limit": req.body.asset_limitations.channel_limit,
        "vod_limit": req.body.asset_limitations.vod_limit
    };
    
    req.settings.updateAttributes(new_settings).then(function (result) {
        //refresh company settings in app memory
        delete req.app.locals.backendsettings[result.id];
        result.already_updated = true;
        req.app.locals.backendsettings[result.id] = result;

        redis.client.hmset(req.token.company_id + ':company_settings', new_settings, function () {
            redis.client.publish('event:company_settings_updated', req.token.company_id)
        });

        return res.json(result);
    }).catch(function (err) {
        winston.error("Updating setting failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};


/**
 * Delete
 */
exports.delete = function (req, res) {
    var deleteData = req.settings;
    DBModel.findById(deleteData.id).then(function (result) {
        if (result) {
            result.destroy().then(function () {
                return res.json(result);
            }).catch(function (err) {
                winston.error("Deleting this setting failed with error: ", err);
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        } else {
            delete req.app.locals.backendsettings[deleteData.id]; //delete from local app storage this setting
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function (err) {
        winston.error("Getting setting object failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * List todo: ky api duhet mbrojtur vetem per admins
 */
exports.list = function (req, res) {

    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.company_name = {};
        qwhere.$or.company_name.$like = '%'+query.q+'%';
    }

    //start building where
    final_where.where = qwhere;
    if(parseInt(query._end) !== -1){
        if(parseInt(query._start)) final_where.offset = parseInt(query._start);
        if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    }
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [];
    //end build final where


    DBModel.findAndCountAll(
        final_where
    ).then(function (results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {
            res.setHeader("X-Total-Count", results.count);
            res.json(results.rows);
        }
    }).catch(function (err) {
        winston.error("Getting setting list failed with error: ", err);
        res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function (req, res, next, id) {

    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({
            message: 'Data is invalid'
        });
    }

    DBModel.find({
        where: {
            id: id
        },
        include: []
    }).then(function (result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.settings = result;
            next();
            return null;
        }
    }).catch(function (err) {
        winston.error("Getting setting data failed with error: ", err);
        return next(err);
    });

};