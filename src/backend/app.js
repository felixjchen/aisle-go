const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
const {
  v4: uuidv4
} = require("uuid");
const {
  addUser,
  auth,
  addFriend,
  addShoppingItem,
  getFriends,
  getFriendsProfiles,
  addForFriend,
  updatePurchase,
} = require("./couchdb")

var socketToEmail = {}
var emailToSocket = {}
var emailToFriends = {}

app.get('/', function (req, res) {
  res.send('redsweater backend');
});


io.on("connect", (socket) => {
  // either with send()
  socket.send("Hello from websocket backend!");

  socket.on("loginAttempt", async (email, password, callback) => {
    let r = await auth(email, password)

    // Fail
    if (!r.status) {
      callback(r)
    }

    emailToSocket[email] = socket.id
    socketToEmail[socket.id] = email
    emailToFriends[email] = user.friends
    console.log(emailToSocket)
    console.log(socketToEmail)
    console.log(emailToFriends)
    console.log(getFriendSockets(socket.id))
    callback(r)
  })

  socket.on("addItemAttempt", async (email, item, callback) => {

    let itemID = uuidv4()
    item['in_list'] = ""
    item['purchase_by'] = ""

    //  Tell all my friends new item
    let friendSockets = getFriendSockets(socket.id)
    let myEmail = socketToEmail[socket.id]
    friendSockets.forEach(friendSocket => {
      io.to(friendSocket).emit('friendNewItem', myEmail, itemID, item);
    })

    let r = {
      status: await addShoppingItem(email, itemID, item),
      itemID
    }

    callback(r)
  })


  socket.on("claimForFriendAttempt", async (email, friendEmail, itemID, callback) => {

    // If friend is online, notify them that you took there item
    if (friendEmail in emailToSocket) {
      let friendSocket = emailToSocket[friendEmail]
      io.to(friendSocket).emit('friendAddedToTheirList', email, itemID);
    }
    callback(await addForFriend(email, friendEmail, itemID))
  })
});

const getFriendSockets = (mySocketID) => {
  let myEmail = socketToEmail[mySocketID]
  let friendEmails = emailToFriends[myEmail]
  let friendSockets = []

  friendEmails.forEach(friendEmail => {
    if (friendEmail in emailToSocket) {
      friendSockets.push(emailToSocket[friendEmail])
    }
  });

  return friendSockets
}

http.listen(port, function () {
  console.log('listening on *:' + port);
});

// https://github.com/socketio/chat-example