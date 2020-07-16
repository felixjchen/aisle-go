const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 80;
const {
  v4: uuidv4
} = require("uuid");
const {
  addUser,
  getUser,
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
      //  Update feed
      let msg = `${email} has added ${item.name} to their cart`
      io.to(friendSocket).emit('updateFeed', msg);

      // Add item to friends list
      io.to(friendSocket).emit('friendNewItem', myEmail, itemID, item);
    })

    let r = {
      status: await addShoppingItem(email, itemID, item),
      itemID
    }

    callback(r)
  })

  socket.on("addFriendAttempt", async (email, friendEmail, callback) => {

    let r = {
      status: await addFriend(email, friendEmail),
      user: await getUser(email),
      friends: await getFriendsProfiles(email)
    }


    // Only if add friend is succesful
    if (r.status) {
      emailToFriends[email].push(friendEmail)
      emailToFriends[friendEmail].push(email)


      //  Tell all my friends feeds
      let friendSockets = getFriendSockets(socket.id)
      friendSockets.forEach(friendSocket => {
        let msg = `${email} and ${friendEmail} are now friends`
        io.to(friendSocket).emit('updateFeed', msg);
      })

      // new friend rerender
      let friendSocket = emailToSocket[friendEmail]
      let f = {
        user: await getUser(friendEmail),
        friends: await getFriendsProfiles(friendEmail)
      }
      io.to(friendSocket).emit('render', f);

      // I render
      callback(r)
    }
  })


  socket.on("claimForFriendAttempt", async (email, friendEmail, itemID, callback) => {

    let r = {
      item: await addForFriend(email, friendEmail, itemID),
      user: await getUser(email),
      friends: await getFriendsProfiles(email)
    }

    //  Tell all my friends, that email claimed friendEmail's item
    let friendSockets = getFriendSockets(socket.id)
    friendSockets.forEach(friendSocket => {
      let msg = `${email} is going to get ${r.item.name} for ${friendEmail}`
      io.to(friendSocket).emit('updateFeed', msg);

      io.to(friendSocket).emit('friendClaimed', email, itemID)
    })

    callback(r)
  })


  socket.on("purchaseForFriendAttempt", async (email, friendEmail, itemID, callback) => {
    console.log(email, friendEmail, itemID)
    let r = {
      item: await updatePurchase(friendEmail, itemID, email)
    }

    if (r.item != false) {

      // tell friend rerender
      let friendSocket = emailToSocket[friendEmail]
      let f = {
        user: await getUser(friendEmail),
        friends: await getFriendsProfiles(friendEmail)
      }
      io.to(friendSocket).emit('render', f);

      //  Tell all my friends feeds
      let friendSockets = getFriendSockets(socket.id)
      friendSockets.forEach(friendSocket => {
        let msg = `${email} has purchased ${r.item.name} for ${friendEmail}`
        io.to(friendSocket).emit('updateFeed', msg);
      })

      callback(r)
    }

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