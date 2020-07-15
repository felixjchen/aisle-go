const Cloudant = require("@cloudant/cloudant");
const serviceCredentials = require("./secrets.json").couchdb;

const databaseInitCallback = function (err, cloudant, pong) {
    if (err) {
        return console.log("Failed to initialize Cloudant: " + err.message);
    }
    console.log(pong); // {"couchdb":"Welcome","version": ...
    // Lists all the databases.
    cloudant.db
        .list()
        .then((body) => {
            body.forEach((db) => {
                console.log(db);
            });
        })
        .catch((err) => {
            console.log(err);
        });
}

const cloudant = Cloudant(serviceCredentials, databaseInitCallback);

// https://github.com/cloudant/nodejs-cloudant
// https://github.com/cloudant/haengematte/blob/master/nodejs/crud.js