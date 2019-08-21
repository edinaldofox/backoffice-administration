#!/bin/bash
set -e

if [ -f "config/env/db.connection.js" ]
then
	rm config/env/db.connection.js
fi

if [ -f "node_modules" ]
then
	rm -Rf node_modules
fi

node create-connection.js

npm install
npm install -g sequelize-cli
npm i dotenv --save

node server.js
