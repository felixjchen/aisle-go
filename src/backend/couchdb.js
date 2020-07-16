const Cloudant = require("@cloudant/cloudant");
const bcrypt = require("bcrypt");
const serviceCredentials = require("./secrets.json").couchdb;

const databaseInitCallback = function (err, cloudant, pong) {
  if (err) {
    return console.log("Failed to initialize Cloudant: " + err.message);
  }
  console.log(pong);
};

const cloudant = Cloudant(serviceCredentials, databaseInitCallback);
const db = cloudant.db.use("redsweater");

const addUser = async function (email, password) {
  let doc = await db.get("users");
  email = email.toLowerCase()
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

  if (!(email in doc.users)) {
    return "User not in DB"
  }

  user = doc.users[email]
  hash = user.password;

  delete user.password
  friends = await getFriendsProfiles(email)

  r = {
    status: bcrypt.compareSync(password, hash),
    user,
    friends,
  }
  return r;
};

const addFriend = async function (email, friend) {
  let doc = await db.get("users");

  doc.users[email].friends.push(friend);
  doc.users[friend].friends.push(email);

  await db.insert(doc);
  return 1;
};

const addShoppingItem = async function (email, itemID, item) {
  let doc = await db.get("users");
  doc.users[email].shoppinglist[itemID] = item;

  await db.insert(doc);
  return 1;
};

const getFriends = async function (email) {
  let doc = await db.get("users");
  friends = doc.users[email].friends;
  return friends;
};

const getFriendsProfiles = async function (email) {
  friends = await getFriends(email);
  let doc = await db.get("users");
  let users = doc.users;

  Object.keys(users)
    .filter((key) => !friends.includes(key))
    .forEach((key) => delete users[key]);

  Object.keys(users).forEach((key) => delete users[key].password);

  return users;
};

const addForFriend = async (email, friend, itemID) => {
  let doc = await db.get("users");
  doc.users[friend]["shoppinglist"][itemID]["in_list"] = email;
  await db.insert(doc);
  return 1;
}

const updatePurchase = async function (email, itemID, by) {
  let doc = await db.get("users");
  doc.users[email]["shoppinglist"][itemID]["purchased_by"] = by;
  await db.insert(doc);
  return 1;
};

const main = async function () {
  felix = "felix.chen@ibm.com";
  harrison = "harrison.ossias@ibm.com";
  diya = "nadiya.stakhyra@ibm.com";

  // await addUser(felix, "a");
  await addUser(harrison, "c");

  await addFriend(felix, harrison);
  await addFriend(diya, harrison);
  // await addFriend(felix, diya);


  // await addShoppingItem(user, shoppingItem)
  // await updatePurchase(email, "e95eb31a-a6c0-45ea-8310-a8d56b5d411e", "felix")

  // console.log(await auth(user, "aa"));
  // console.log(await auth(user, "bb"));
}

module.exports = {
  addUser,
  auth,
  addFriend,
  addShoppingItem,
  getFriends,
  getFriendsProfiles,
  addForFriend,
  updatePurchase,
};

// https://github.com/cloudant/nodejs-cloudant
// https://github.com/cloudant/haengematte/blob/master/nodejs/crud.js