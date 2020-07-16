const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
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

var sockets = {

}

app.get('/', function (req, res) {
  res.send('redsweater backend');
});


io.on("connect", (socket) => {
  // either with send()
  socket.send("Hello from websocket backend!");

  socket.on("loginAttempt", async (email, password, callback) => {
    callback(await auth(email, password))
  })

  socket.on("addItemAttempt", async (email, item, callback) => {

    item['in_list'] = ""
    item['purchase_by'] = ""

    callback(await addShoppingItem(email, item))
  })


  socket.on("addForFriendAttempt", async (email, friendEmail, itemID, callback) => {
    callback(await addForFriend(email, friendEmail, itemID))
  })


});


http.listen(port, function () {
  console.log('listening on *:' + port);
});

// https://github.com/socketio/chat-example