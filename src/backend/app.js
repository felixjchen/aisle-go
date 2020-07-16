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
  updatePurchase,
} = require("./couchdb")

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

  // handle the event sent with socket.send()
  socket.on("message", (data) => {
    console.log(data);
  });

});


http.listen(port, function () {
  console.log('listening on *:' + port);
});

// https://github.com/socketio/chat-example