const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT || 3001;
const { Server } = require("socket.io");
const path = require("path");
const { v4: uuidV4 } = require("uuid");

let UserObjectsData = [];

const colors = [
  "#aa0044",
  "#aa4400",
  "#00aa44",
  "#0044aa",
  "#44aa00",
  "#4400aa",

  "#4422a0",
  "#44a022",
  "#2244a0",
  "#22a044",
  "#a04422",
  "#a02244",

  "#004422",
  "#002244",
  "#440022",
  "#442200",
  "#224400",
  "#220044",
];

app.use(cors());
app.use(express.static(path.join(__dirname, "../client")));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`user connection: ${socket.id}`);

  socket.userData = { x: 0, y: 0, z: 0 };
  socket.boxData = [];
  socket.userData.color = colors[Math.round(Math.random() * 18 - 0.5)];

  socket.emit("setId", { id: socket.id });

  socket.on("disconnect", () => {
    socket.broadcast.emit("deletePlayer", { id: socket.id });
    socket.broadcast.emit("user disconnection", {
      userName: socket.userData.name,
      color: socket.userData.color,
    });
  });

  socket.userData.id = socket.id;

  socket.on("update", (data) => {
    socket.userData.x = data.x;
    socket.userData.y = data.y;
    socket.userData.z = data.z;
    socket.userData.rotation = data.rotation;
    socket.userData.anim = data.anim;
  });

  socket.on("user name", (data) => {
    socket.userData.name = data;
    socket.emit("user name", socket.userData.name);
    io.emit("user connected", {
      userName: socket.userData.name,
      color: socket.userData.color,
    });
  });

  socket.on("chat message", (msg) => {
    io.emit("chat message", {
      message: msg,
      userName: socket.userData.name,
      time: `${new Date().getHours()}:${new Date().getSeconds()}`,
      color: socket.userData.color,
    });
  });

  socket.on("box", (boxData) => {
    socket.broadcast.emit("box", boxData);
  });

  socket.on("sphere", (sphereData) => {
    socket.broadcast.emit("sphere", sphereData);
  });

  socket.on("remove box", () => {
    socket.broadcast.emit("remove box");
  });

  socket.on("model", (data) => {
    socket.broadcast.emit("model", data);
  });

  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

server.listen(port, () => {
  console.log("server is running. on localhost:3001");
});

setInterval(async function () {
  const sockets = await io.fetchSockets();

  let remotePlayers = [];

  for (const socket of sockets) {
    socket.added = false;
  }

  for (const socket of sockets) {
    if (socket.added === false && socket.userData.name) {
      remotePlayers.push({
        id: socket.id,
        name: socket.userData.name,
        x: socket.userData.x,
        y: socket.userData.y,
        z: socket.userData.z,
        rotation: socket.userData.rotation,
        anim: socket.userData.anim,
      });
      socket.added = true;
    }
  }

  if (remotePlayers.length > 0) io.emit("remoteData", remotePlayers);
}, 16);
