// require Express NPM library
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// import middlewares
const errorHandler = require("./middleware/errorHandler");

// Step 1. importing Routers
const UsersRouter = require("./routers/UsersRouter");
const InterestsRouter = require("./routers/InterestsRouter");
const UserRouter = require("./routers/UserRouter")

// Step 2. importing Controllers
const UsersController = require("./controllers/UsersController");
const UserController = require("./controllers/UserController");
const InterestsController = require("./controllers/InterestsController");

// Step 3. importing DB
const db = require("./db/models/index");
const { user, interest } = db;

// Step 4. initializing Controllers -> note the lowercase for the first word
const usersController = new UsersController(user, interest);
const userController = new UserController(user);
const interestsController = new InterestsController(interest);

// Step 5.initializing Routers -> note the lowercase for the first word
const usersRouter = new UsersRouter(usersController).routes();
const userRouter = new UserRouter(userController).routes();
const interestsRouter = new InterestsRouter(interestsController).routes();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Step 6. using the routers
app.use("/user", userRouter)
app.use("/users", usersRouter);
app.use("/interests", interestsRouter);
app.get("*", (req, res) =>
  res.status(404).json({ errors: { body: ["Not found"] } })
);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT} yeees!`);
});
