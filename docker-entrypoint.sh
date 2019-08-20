#!/bin/bash
set -e

if [ -f "config/env/db.connection.js" ]
then
	rm config/env/db.connection.js
fi

node create-connection.js

npm install
npm install -g sequelize-cli

node server.js