const fs = require("fs");
var cors = require('cors');
const path = require('path');
var compression = require("compression");
var express = require("express"); //import express NodeJS framework module
var app = express(); // create an object of the express module
var http = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const mime = require('mime');

app.use(express.static("public"));
app.use(compression());

// Serve the static files with the appropriate MIME type
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    const contentType = mime.getType(filePath);
    res.setHeader('Content-Type', contentType);
  },
}));

app.use(
  cors({
    allowedHeaders: ["authorization", "Content-Type"], // you can change the headers
    exposedHeaders: ["authorization"], // you can change the headers
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false
  })
);

var httpServer = http.createServer(app);

// setting up the socket io server

const io = new Server(httpServer, {
  // to allow cors
  cors:{
    origin:["*", "https://admin.socket.io"],
    credentials: true
  },
  // transports: ['websocket']
});

// setting up the admin panel
instrument(io, {
  auth: {
    type: "basic",
    username: "admin",
    password: "$2a$12$oWadey/Z6GOVn7P1frRFZuBZXRiwHmA8GfMK1b8DqpHcuOs/x4/AK" // "changeit" encrypted with bcrypt
  },
});


//open a connection with the specific client
io.on("connection", function (socket) {
  socket.broadcast.emit("NEW", "new user connected: " + socket.id);

  // handeling sending voices
  socket.on("VOICE", function (data) {
    var newData = data.split(";");
    newData[0] = "data:audio/ogg;";
    newData = newData[0] + newData[1];

    // emit to all the rooms of the client
    socket.rooms.forEach(room => {
      // basically skips sending the voice to the player
      if (room != socket.id) {
        socket.to(room).emit("UPDATE_VOICE", newData, socket.id);
      }
    });
  });

  // handles returning client rooms
  socket.on("getRooms", function () {
    var rooms = [];
    socket.rooms.forEach(room => {
      rooms.push(room);
      console.log(room);
    })
    rooms.shift();
    socket.emit("Rooms",rooms);
  });

  // handles joining rooms for clients
  socket.on("joinRoom", function(roomID) {
    socket.join(roomID);
    console.log(socket.id + " has joined room: " + roomID)
    socket.to(roomID).emit("onJoinRoom", socket.id, roomID);
  });

  // handles leaving rooms for clients
  socket.on("leaveRoom", function (roomID) {
    socket.leave(roomID);
    console.log(socket.id + " has left room: " + roomID)
    socket.to(roomID).emit("onLeftRoom", socket.id, roomID);
  });

  // handles the retrival of clients socket's id connected to a given room
  socket.on("getClientsInRoom", async function (roomID) {
    const sockets = await io.in(roomID).fetchSockets();
    let clients = [];
    for (const clientSocket of sockets) {
      clients.push(clientSocket.id);
    }
    
    socket.emit("clientsInRoom", clients);
  });

  // handles leaving all the rooms for clients
  socket.on("leaveAllRooms", function () {
    socket.rooms.forEach((room) => {
      if (room != socket.id) {
        socket.leave(room);
        socket.to(room).emit("onLeftRoom", socket.id, room);
      }
    });
  });

  /* The Texting Functionality */

  socket.on("SendMessage", function (message) {
    // emit to all the rooms of the client
    socket.rooms.forEach(room => {
      // basically skips sending the text to the player
      if (room != socket.id) {
        socket.to(room).emit("UpdateChat", message, socket.id);
      }
    });
  });

  /* The Texting Functionality */

  socket.on("disconnect", function () {});
});

httpServer.listen(process.env.PORT || 80, function () {
  console.log("listening on *:80");
})
console.log("------- server is running -------");
