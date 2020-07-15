const Cloudant = require("@cloudant/cloudant");
const bcrypt = require("bcrypt");
const {
  v4: uuidv4
} = require('uuid');
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
  doc.users[email].friends = [];
  doc.users[email].shoppinglist = {};

  await db.insert(doc);
  return 1;
};

const auth = async function (email, password) {
  let doc = await db.get("users");
  hash = doc.users[email].password;
  return bcrypt.compareSync(password, hash);
};

const addFriend = async function (email, friend) {
  let doc = await db.get("users");
  doc.users[email].friends.push(friend);

  await db.insert(doc);
  return 1;
};

const addShoppingItem = async function (email, item) {
  let doc = await db.get("users");
  doc.users[email].shoppinglist[uuidv4()] = item

  await db.insert(doc);
  return 1;
};

const getFriends = async function (email) {
  let doc = await db.get("users");
  friends = doc.users[email].friends
  return friends;
};

const getFriendsProfiles = async function (email) {
  friends = await getFriends(email)
  let doc = await db.get("users");
  let users = doc.users


  Object.keys(users)
    .filter(key => !friends.includes(key))
    .forEach(key => delete users[key]);

  Object.keys(users)
    .forEach(key => delete users[key].password)

  return users
}

const updatePurchase = async function (email, itemID, by) {
  let doc = await db.get("users");
  doc.users[email]["shoppinglist"][itemID]["purchased_by"] = by

  await db.insert(doc);
  return 1;
}

const main = (async function () {
  felix = "felix.chen@ibm.com"
  harrison = "harrison.ossias@ibm.com";
  diya = "nadiya.stakhyra@ibm.com"

  // await addUser(felix, "a");
  // await addUser(harrison, "b");
  // await addUser(diya, "c");

  // await addFriend(felix, harrison);
  // await addFriend(felix, diya);

  r = await getFriendsProfiles(felix)
  console.log(r)

  shoppingItem = {
    "item": "Cheese",
    "quantity": "2g",
    "notes": "marble",
    "purchased_by": ""
  }

  // await addShoppingItem(user, shoppingItem)
  // await updatePurchase(email, "e95eb31a-a6c0-45ea-8310-a8d56b5d411e", "felix")

  // console.log(await auth(user, "aa"));
  // console.log(await auth(user, "bb"));
})();

// https://github.com/cloudant/nodejs-cloudant
// https://github.com/cloudant/haengematte/blob/master/nodejs/crud.js