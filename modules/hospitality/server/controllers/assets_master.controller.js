'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    fileHandler = require(path.resolve('./modules/mago/server/controllers/common.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    winston = require('winston'),
    DBModel = db.assets_master,
    refresh = require(path.resolve('./modules/mago/server/controllers/common.controller.js')),
    fs = require('fs');

/**
 * Create
 */
exports.create = function(req, res) {

    req.body.company_id = req.token.company_id; //save record for this company

    DBModel.create(req.body).then(function(result) {
        if (!result) {
            return res.status(400).send({message: 'fail create data'});
        } else {
            return res.jsonp(result);
        }
    }).catch(function(err) {
        if(err.name === "SequelizeUniqueConstraintError"){
            if(err.errors[0].path === "position")  return res.status(400).send({message: 'This position is being used by another menu'}); //position is taken
            else return res.status(400).send({message: err.errors[0].message}); //other duplicate fields. return sequelize error message
        }
        else {
            winston.error("Creating menu failed with error: ", err);
            return res.status(400).send({message: 'An error occurred while creating menu item. '+err.errors[0].message}); //another error occurred. return sequelize error message
        }
    });
};


/**
 * Show current
 */

exports.read = function(req, res) {
    if(req.assetsMaster.company_id === req.token.company_id)
        res.json(req.assetsMaster);
    else
        return res.status(404).send({message: 'No data with that identifier has been found'});
};



/**
 * Update
 */
exports.update = function(req, res) {

    var updateData = req.assetsMaster;
    if(updateData.icon_url != req.body.icon_url) {
        var deletefile = path.resolve('./public'+updateData.icon_url);
    }
    if(updateData.image_url != req.body.image_url) {
        var deletefile = path.resolve('./public'+updateData.image_url);
    }

    if(req.body.company_id === req.token.company_id){
        updateData.updateAttributes(req.body).then(function(result){
            if(deletefile) {
                fs.unlink(deletefile, function (err) {
                    winston.error("Error deleting file on assets_master controller: ", err);
                    res.status(400).send({message: 'An error occurred while editing asstes item. '+err.errors[0].message});
                });
            }
            res.json(result);
        }).catch(function(err) {
            if(err.name === "SequelizeUniqueConstraintError"){
                if(err.errors[0].path === "position")  return res.status(400).send({message: 'This position is being used by another menu'}); //position is taken
                else return res.status(400).send({message: err.errors[0].message}); //other duplicate fields. return sequelize error message
            }
            else {
                winston.error("Updating assets master failed with error: ", err);
                return res.status(400).send({message: 'An error occurred while editing assets master. '+err.errors[0].message}); //another error occurred. return sequelize error message
            }
        });
    }
    else{
        res.status(404).send({message: 'User not authorized to access these data'});
    }

};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.assetsMaster;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {
            if (result && (result.company_id === req.token.company_id)) {
                result.destroy().then(function() {
                    return res.json(result);
                }).catch(function(err) {
                    winston.error("Deleting asset failed with error: ", err);
                    return res.status(400).send({
                        message: errorHandler.getErrorMessage(err)
                    });
                });
                return null;
            }
            else{
                return res.status(400).send({message: 'Unable to find the Data'});
            }
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function(err) {
        winston.error("Finding failed with error: ", err);
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * List
 */
exports.list = function(req, res) {

    var qwhere = {},
        final_where = {},
        query = req.query;

    if(query.q) {
        qwhere.$or = {};
        qwhere.$or.title = {};
        qwhere.$or.title.$like = '%'+query.q+'%';
        qwhere.$or.description = {};
        qwhere.$or.description.$like = '%'+query.q+'%';
    }

    //start building where
    final_where.where = qwhere;
    if(parseInt(query._start)) final_where.offset = parseInt(query._start);
    if(parseInt(query._end)) final_where.limit = parseInt(query._end)-parseInt(query._start);
    if(query._orderBy) final_where.order = query._orderBy + ' ' + query._orderDir;
    final_where.include = [];
    //end build final where

    final_where.where.company_id = req.token.company_id; //return only records for this company

    DBModel.findAndCountAll(

        final_where


    ).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {

            res.setHeader("X-Total-Count", results.count);
            res.json(results.rows);
        }
    }).catch(function(err) {
        winston.error("Getting assets list failed with error: ", err);
        res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {

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
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.assetsMaster = result;
            next();
            return null;
        }
    }).catch(function(err) {
        winston.error("Getting assets master data failed with error: ", err);
        return next(err);
    });
};
