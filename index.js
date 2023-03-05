// require Express NPM library
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const http = require("http");
const socketIO = require("socket.io");

// import middlewares
const errorHandler = require("./middleware/errorHandler");

// Step 1. importing Routers
const UsersRouter = require("./routers/UsersRouter");
const InterestsRouter = require("./routers/InterestsRouter");
const ChatsRouter = require("./routers/ChatsRouter");
const MeetupsRouter = require("./routers/MeetupsRouter");
const UserRouter = require("./routers/UserRouter");
const ProfileRouter = require("./routers/ProfileRouter");
const RecommendationsRouter = require("./routers/RecoRouter");

// Step 2. importing Controllers
const UsersController = require("./controllers/UsersController");
const UserController = require("./controllers/UserController");
const InterestsController = require("./controllers/InterestsController");
const ChatsController = require("./controllers/ChatsController");
const MeetupsController = require("./controllers/MeetupsController");
const ProfileController = require("./controllers/ProfileController");
const RecommendationsController = require("./controllers/RecoController");

// Step 3. importing DB
const db = require("./db/models/index");
const { user, interest, chatrequest, chat, message, meetup, userinterest } = db;

const PORT = process.env.PORT || 8080;
const app = express();

server = http.Server(app);

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
  socket.join(String(socket.userID));
  console.log("userID is", socket.userID, "and username is ", socket.username);

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
      firstname: session.firstname,
      profilepic: session.profilepic,
      connected: session.online,
      chatid: session.chatid,
      messages: messagesPerUser.get(session.id) || [],
    });
  });
  console.log(users);
  socket.emit("users", users);
  // this does 2 actions: 1. forward the private message to the right recipient (and to other tabs of the sender) 2. save the message into the db
  socket.on(
    "private message",
    async ({ content, to_id, from_id, chatroom_id, createdAt }) => {
      const message = {
        content,
        from_id,
        to_id,
        chatroom_id,
        createdAt,
      };
      messageStore.saveMessage(message);
      console.log("to id", message.to_id, " and from id", message.from_id);
      socket
        .to(String(message.from_id))
        .to(String(message.to_id))
        .emit("private message", message);
    }
  );

  // notify users upon disconnection so the status can change from green to red colour
  // socket.on("disconnect", async () => {
  //   const matchingSockets = await io.in(socket.userID).allSockets();
  //   const isDisconnected = matchingSockets.size === 0;
  //   if (isDisconnected) {
  //     // notify other users
  //     socket.broadcast.emit("user disconnected", socket.userID);
  //     // update the connection status of the session
  //     sessionStore.saveSession(socket.userID, false);
  //   }
  // });
});

// Step 4. initializing Controllers -> note the lowercase for the first word
const usersController = new UsersController(user, interest, io);
const userController = new UserController(user);
const interestsController = new InterestsController(interest);
const chatsController = new ChatsController(chatrequest, user, chat, io);
const meetupsController = new MeetupsController(meetup, chat, user);
const profileController = new ProfileController(user);
const recommendationsController = new RecommendationsController(
  chat,
  chatrequest,
  userinterest,
  user
);

// Step 5.initializing Routers -> note the lowercase for the first word
const usersRouter = new UsersRouter(usersController).routes();
const userRouter = new UserRouter(userController).routes();
const interestsRouter = new InterestsRouter(interestsController).routes();
const chatsRouter = new ChatsRouter(chatsController).routes();
const meetupsRouter = new MeetupsRouter(meetupsController).routes();
const profileRouter = new ProfileRouter(profileController).routes();
const recommendationsRouter = new RecommendationsRouter(
  recommendationsController
).routes();

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Step 6. using the routers
app.use("/user", userRouter);
app.use("/users", usersRouter);
app.use("/interests", interestsRouter);
app.use("/chats", chatsRouter);
app.use("/meetups", meetupsRouter);
app.use("/profile", profileRouter);
app.use("/recommendations", recommendationsRouter);
app.get("*", (req, res) =>
  res.status(404).json({ errors: { body: ["Not found"] } })
);
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT} yeees!`);
});
