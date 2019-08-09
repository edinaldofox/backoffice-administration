'use strict'

var path = require('path'),
    redis = require(path.resolve('./config/lib/redis')),
    nodemailer = require('nodemailer'),
    winston = require('winston'),
    crypto = require('crypto'),
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    db = sequelize_t.models;

exports.createCompany = function (req) {
    return new Promise(function (resolve, reject) {
        //Check if request is valid
        if (!req.body.company_name) {
            reject({ error: { code: 400, message: 'Parameter company_name is required' } });
            return;
        }
        if (!req.body.expire_date) {
            reject({ error: { code: 400, message: 'Parameter expire_date is required' } });
            return;
        }
        
        if (!req.body.email) {
            reject({ error: { code: 400, message: 'Parameter email is required' } });
            return;
        }
        if (!req.body.telephone) {
            reject({ error: { code: 400, message: 'Parameter telephone is required' } });
            return;
        }

        db.users.findOne({
            where: { email: req.body.email }
        }).then(function (user) {
            if (user) {
                reject({ error: { code: 409, message: 'A user with this email exist' } });
                return;
            }

            req.body.asset_limitations = {
                client_limit: req.body.client_limit ? req.body.client_limit : 5,
                channel_limit: req.body.channel_limit ? req.body.channel_limit : 10,
                vod_limit: req.body.vod_limit ? req.body.vod_limit : 20
            }

            var settings_object = {
                mobile_background_url: req.body.mobile_background_url ? req.body.mobile_background_url : '',
                mobile_logo_url: req.body.mobile_logo_url ? req.body.mobile_logo_url : '',
                box_logo_url: req.body.box_logo_url ? req.body.box_logo_url : '',
                box_background_url: req.body.box_background_url ? req.body.box_background_url : '',
                vod_background_url: req.body.vod_background_url ? req.body.vod_background_url : '',
                assets_url: req.body.assets_url ? req.body.assets_url : '',
                old_encryption_key: '0123456789101112',
                new_encryption_key: '0123456789101112',
                key_transition: false,
                email_address: req.body.email_address ? req.body.email_address : '',
                email_username: req.body.email_username ? req.body.email_username : '',
                email_password: req.body.email_password ? req.body.email_password : '',
                company_name: req.body.company_name,
                company_logo: req.body.company_logo ? req.body.company_logo : '',
                asset_limitations: JSON.stringify(req.body.asset_limitations),
                expire_date: new Date(req.body.expire_date)
            };

            var user_data = {
                username: req.body.email,
                hashedpassword: crypto.randomBytes(4).toString('hex'),
                email: req.body.email,
                telephone: req.body.telephone,
                jwtoken: '',
                isavailable: true,
                third_party_api_token: ''
            };
            
            var new_company_data;
            let ownerUser;

            return sequelize_t.sequelize.transaction(function (t) {
                return db.settings.create(settings_object, { transaction: t }).then(function (new_company) {
                    new_company_data = new_company; //load the data of the new company
                    user_data.company_id = new_company.id;
                    //prepare objects for default stream sources
                    var channel_stream_sources = { company_id: new_company.id, stream_source: 'Live primary source - ' + new_company.company_name };
                    var vod_stream_sources = { company_id: new_company.id, description: 'VOD primary source - ' + new_company.company_name };
                    //prepare object for device_menu
                    var device_menus = require(path.resolve("./config/defaultvalues/device_menu.json"));
                    device_menus.forEach(function (element) { delete element.id });
                    device_menus.forEach(function (element) { element.company_id = new_company.id });
                    //prepare object for advanced settings
                    var advanced_settings = require(path.resolve("./config/defaultvalues/advanced_settings.json"));
                    advanced_settings.forEach(function (element) { delete element.id });
                    advanced_settings.forEach(function (element) { element.company_id = new_company.id });
                    //prepare object for email templates
                    var email_templates = require(path.resolve("./config/defaultvalues/email_templates.json"));
                    email_templates.forEach(function (element) { delete element.id });
                    email_templates.forEach(function (element) { element.company_id = new_company.id });

                    return db.channel_stream_source.create(channel_stream_sources, { transaction: t }).then(function (new_company) {
                        return db.vod_stream_source.create(vod_stream_sources, { transaction: t }).then(function (vod_source) {
                            return db.device_menu.bulkCreate(device_menus, { transaction: t }).then(function (device_menu) {
                                return db.advanced_settings.bulkCreate(advanced_settings, { transaction: t }).then(function (advanced_settings) {
                                    return db.email_templates.bulkCreate(email_templates, { transaction: t }).then(function (email_templates) {
                                        var admin_group = {
                                            company_id: new_company_data.id,
                                            name: req.body.company_name + ' : admin',
                                            code: 'admin',
                                            isavailable: true
                                        };
                                        return db.groups.create(admin_group, { transaction: t }).then(function (admin_data) {
                                            user_data.group_id = admin_data.id;
                                            user_data.comnpany_id = new_company_data.id;
                                            let user = db.users.build(user_data);
                                            user.salt = user.makeSalt();
                                            return user.save({ transaction: t }).then(function (new_user) {
                                                ownerUser = new_user;
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            }).then(function (result) {
                req.app.locals.backendsettings[ownerUser.company_id] = new_company_data;
                redis.client.hmset(new_company_data.id + ':company_settings', new_company_data);
                
                resolve({company: new_company_data, owner: ownerUser});
            }).catch(function (err) {
                winston.error('Company creation failed with error: ', err)
                reject({error: {code: 500, message: 'Internal error'}});
            });
        })
    })
}