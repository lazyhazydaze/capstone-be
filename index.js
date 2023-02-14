// require Express NPM library
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const socketIO = require("socket.io");

// Step 1. importing Routers
const UsersRouter = require("./routers/UsersRouter");
const InterestsRouter = require("./routers/InterestsRouter");
const ChatsRouter = require("./routers/ChatsRouter");
const MeetupsRouter = require("./routers/MeetupsRouter");

// Step 2. importing Controllers
const UsersController = require("./controllers/UsersController");
const InterestsController = require("./controllers/InterestsController");
const ChatsController = require("./controllers/ChatsController");
const MeetupsController = require("./controllers/MeetupsController");

// Step 3. importing DB
const db = require("./db/models/index");
const { user, interest, chatrequest, chat, message, meetup } = db;

// Step 4. initializing Controllers -> note the lowercase for the first word
const usersController = new UsersController(user, interest);
const interestsController = new InterestsController(interest);
const chatsController = new ChatsController(chatrequest, user, chat);
const meetupsController = new MeetupsController(meetup, chat);

// Step 5.initializing Routers -> note the lowercase for the first word
const usersRouter = new UsersRouter(usersController).routes();
const interestsRouter = new InterestsRouter(interestsController).routes();
const chatsRouter = new ChatsRouter(chatsController).routes();
const meetupsRouter = new MeetupsRouter(meetupsController).routes();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Step 6. using the routers
app.use("/users", usersRouter);
app.use("/interests", interestsRouter);
app.use("/chats", chatsRouter);
app.use("/meetups", meetupsRouter);

server = http.Server(app);
server.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT} yeees!`);
});

// Step 7. Socket
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:8080", //front end client URL is 8080
  },
});
const { MessageStore } = require("./helper/messageStore");
const messageStore = new MessageStore(message, user);
const { SessionStore } = require("./helper/sessionStore");
const sessionStore = new SessionStore(user, chat);

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  const userID = socket.handshake.auth.userID;
  // if (!username || !sessionID) {
  //   return next(new Error("invalid username"));
  // }
  socket.userID = userID;
  socket.username = username;
  next();
});

// io.on connection is triggered once

io.on("connection", async (socket) => {
  console.log("socket", socket);
  // persist session
  sessionStore.saveSession(socket.userID, true);

  // emit session details
  // socket.emit("session", {
  //   userID: socket.userID,
  //   username: socket.username,
  // });

  // join the "userID" room
  socket.join(socket.userID);
  console.log(socket.userID);

  // fetch existing users
  const users = [];
  const messagesPerUser = new Map();
  messages = await messageStore.findMessagesForUser(socket.userID);
  messages.forEach((message) => {
    const { from_id, to_id } = message.dataValues;
    const otherUser = socket.userID == from_id ? to_id : from_id;
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message.dataValues);
    } else {
      messagesPerUser.set(otherUser, [message.dataValues]);
    }
  });
  console.log("messagesPerUser", messagesPerUser);
  sessions = await sessionStore.findAllSessions(socket.userID);
  sessions.forEach((session) => {
    users.push({
      userID: session.id,
      username: session.username,
      connected: session.online,
      chatid: session.chatid,
      messages: messagesPerUser.get(session.id) || [],
    });
  });
  console.log(users);
  socket.emit("users", users);

  // notify existing users that this user is online so the status can be updated (red to green colour)
  socket.broadcast.emit("user connected", {
    userID: socket.userID,
    username: socket.username,
    connected: true,
    messages: [],
  });

  // this does 2 actions: 1. forward the private message to the right recipient (and to other tabs of the sender) 2. save the message into the db
  socket.on(
    "private message",
    async ({ content, to_id, from_id, chatroom_id }) => {
      const message = {
        content,
        from_id,
        to_id,
        chatroom_id,
      };
      messageStore.saveMessage(message);
      socket
        .to(String(message.to_id))
        .to(String(message.from_id))
        .emit("private message", message);
    }
  );

  // notify users upon disconnection so the status can change from green to red colour
  socket.on("disconnect", async () => {
    const matchingSockets = await io.in(socket.userID).allSockets();
    const isDisconnected = matchingSockets.size === 0;
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit("user disconnected", socket.userID);
      // update the connection status of the session
      sessionStore.saveSession(socket.userID, false);
    }
  });
});
