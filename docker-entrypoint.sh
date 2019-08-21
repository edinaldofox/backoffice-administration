#!/bin/bash
set -e

if [ -f "config/env/db.connection.js" ]
then
	rm config/env/db.connection.js
fi

npm install
npm install -g sequelize-cli
node create-connection.js

node server.js
