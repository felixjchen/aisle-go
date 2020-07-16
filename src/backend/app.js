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

  // handle the event sent with socket.send()
  socket.on("message", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("salutations", (elem1, elem2, elem3) => {
    console.log(elem1, elem2, elem3);
  });
});


http.listen(port, function () {
  console.log('listening on *:' + port);
});

// https://github.com/socketio/chat-example