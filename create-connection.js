'use strict';

var path = require('path');
var dbfile = path.resolve("./config/env/db.connection.js");
var fs = require('fs');

require('dotenv').config();

var configfile = 'module.exports = { \n'   +
    'database: "'+ process.env.DB_NAME +'", \n' +
    'host: "'+ process.env.DB_HOST +'",  \n ' +
    'port: "'+ process.env.DB_PORT +'", \n ' +
    'username: "'+ process.env.DB_USERNAME +'",  \n' +
    'password: "'+ process.env.DB_PASSWORD +'",  \n' +
    'dialect: "'+ process.env.DB_DIALECT +'", \n' +
    'storage: "./db.development.sqlite", \n' +
    'enableSequelizeLog: "'+ process.env.DB_LOG +'", \n' +
    'ssl: '+ process.env.DB_SSL +',   \n' +
    'sync: "'+ process.env.DB_SYNC +'" \n' +
    '};';

fs.writeFile(dbfile, configfile, function(err) {
    if(err) {
        return console.log(err);
    }
    console.log("Configuration file saved !");
});