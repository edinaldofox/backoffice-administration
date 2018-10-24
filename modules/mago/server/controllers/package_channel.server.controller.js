'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
    db = require(path.resolve('./config/lib/sequelize')).models,
    sequelize_t = require(path.resolve('./config/lib/sequelize')),
    DBModel = db.packages_channels;



//function link_channel_with_packages(channel_id,array_package_ids) {
function link_channels_with_package(array_channel_ids, package_id) {

    var transactions_array = [];

    return DBModel.destroy({
        where: {
            package_id: package_id,
            channel_id: {$notIn: array_channel_ids}
        }
    }).then(function (result) {
        return sequelize_t.sequelize.transaction(function (t) {
            for (var i = 0; i < array_channel_ids.length; i++) {
                transactions_array.push(
                    DBModel.upsert({
                        channel_id: array_channel_ids[i],
                        package_id: package_id,
                    }, {transaction: t})
                )
            }
            return Promise.all(transactions_array, {transaction: t}); //execute transaction
        }).then(function (result) {
            return {status: true, message:'transaction executed correctly'};
        }).catch(function (err) {
            return {status: false, message:'error executing transaction'};
        })
    }).catch(function (err) {
        return {status: false, message:'error deleteting existing packages'};
    })
}










/**
 * Create
 */


exports.create = function(req, res) {

    return link_channels_with_package(req.body.channel_id, req.body.package_id).then(function(t_result) {
        if (t_result.status) {
            return res.jsonp(t_result);
        }
        else {
            return res.send(t_result);
        }
    })

    /*
    DBModel.create(req.body).then(function(result) {
      if (!result) {
        return res.status(400).send({message: 'fail create data'});
      } else {
        return res.jsonp(result);
      }
    }).catch(function(err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
    */

};

/**
 * Show current
 */
exports.read = function(req, res) {
    res.json(req.packageChannel);
};

/**
 * Update
 */
exports.update = function(req, res) {
    var updateData = req.packageChannel;

    updateData.updateAttributes(req.body).then(function(result) {
        res.json(result);
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });
};

/**
 * Delete
 */
exports.delete = function(req, res) {
    var deleteData = req.packageChannel;

    DBModel.findById(deleteData.id).then(function(result) {
        if (result) {

            result.destroy().then(function() {
                return res.json(result);
            }).catch(function(err) {
                return res.status(400).send({
                    message: errorHandler.getErrorMessage(err)
                });
            });
        } else {
            return res.status(400).send({
                message: 'Unable to find the Data'
            });
        }
    }).catch(function(err) {
        return res.status(400).send({
            message: errorHandler.getErrorMessage(err)
        });
    });

};

/**
 * List
 */
exports.list = function(req, res) {

    var query = req.query;
    var offset_start = parseInt(query._start);
    var records_limit = query._end - query._start;
    var qwhere = {};
    if(query.package_id) qwhere.package_id = query.package_id;

    DBModel.findAndCountAll({
        where: qwhere,
        offset: offset_start,
        limit: records_limit,
    }).then(function(results) {
        if (!results) {
            return res.status(404).send({
                message: 'No data found'
            });
        } else {

            res.setHeader("X-Total-Count", results.count);
            res.json(results.rows);
        }
    }).catch(function(err) {
        res.jsonp(err);
    });
};

/**
 * middleware
 */
exports.dataByID = function(req, res, next, id) {
    if ((id % 1 === 0) === false) { //check if it's integer
        return res.status(404).send({ message: 'Data is invalid' });
    }

    DBModel.find({
        where: {
            id: id
        },
    }).then(function(result) {
        if (!result) {
            return res.status(404).send({
                message: 'No data with that identifier has been found'
            });
        } else {
            req.packageChannel = result;
            next();
            return null;
        }
    }).catch(function(err) {
        return next(err);
    });

};