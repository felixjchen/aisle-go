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

const addUser = async function (email, password) {
  let doc = await db.get("users");
  doc.users[email] = {
    password: bcrypt.hashSync(password, 1),
  };
  doc.users[email].friends = []
  doc.users[email].shoppinglist = {}

  await db.insert(doc)
  return 1
};

const auth = async function (email, password) {
  let doc = await db.get("users");
  hash = doc.users[email].password;
  return bcrypt.compareSync(password, hash);
};


const main = async function () {
  user = "harrison@ibm.com4";

  await addUser(user, "bb")

  console.log(await auth(user, "aa"));
  console.log(await auth(user, "bb"));

}()

// https://github.com/cloudant/nodejs-cloudant
// https://github.com/cloudant/haengematte/blob/master/nodejs/crud.js