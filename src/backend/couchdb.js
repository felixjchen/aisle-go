const Cloudant = require("@cloudant/cloudant");
const couchDBServiceCredentials = require("./secrets.json").couchdb;

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

const cloudant = Cloudant(couchDBServiceCredentials, databaseInitCallback);
console.log(1111)

// https://github.com/cloudant/nodejs-cloudant
// https://github.com/cloudant/haengematte/blob/master/nodejs/crud.js