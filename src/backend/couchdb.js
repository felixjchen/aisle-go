const Cloudant = require("@cloudant/cloudant");
const bcrypt = require("bcrypt");
const serviceCredentials = require("./secrets.json").couchdb;

const databaseInitCallback = function (err, cloudant, pong) {
  if (err) {
    return console.log("Failed to initialize Cloudant: " + err.message);
  }
  console.log(pong); // {"couchdb":"Welcome","version": ...
  // Lists all the databases.
  console.log("Databases: ");
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
};

const cloudant = Cloudant(serviceCredentials, databaseInitCallback);
const db = cloudant.db.use("redsweater");

const addUser = function (email, password) {
  let documentName = "users";
  db.get(documentName, function (err, data) {
    // Retrieve Doc
    if (err) {
      return console.log("Failed: " + err.message);
    }
    doc = data;

    //  Make change
    doc["users"][email] = {
      password: bcrypt.hashSync(password, 1),
    };

    // Write
    db.insert(doc, function (err, data) {
      if (err) {
        return console.log("Failed: " + err.message);
      }
    });
  });
};

const auth = async function (email, password) {
  let documentName = "users";
  let doc = await db.get(documentName);
  hash = doc["users"][email]["password"];
  return bcrypt.compareSync(password, hash);
};

const main = async function () {
  user = "harrison@ibm.com";

  // addUser("harrison@ibm.com", "bb")

  console.log(await auth(user, "aa"));
  console.log(await auth(user, "bb"));

}()

// https://github.com/cloudant/nodejs-cloudant
// https://github.com/cloudant/haengematte/blob/master/nodejs/crud.js