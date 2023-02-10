// require Express NPM library
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Step 1. importing Routers
const UsersRouter = require("./routers/UsersRouter");
const InterestsRouter = require("./routers/InterestsRouter");

// Step 2. importing Controllers
const UsersController = require("./controllers/UsersController");
const InterestsController = require("./controllers/InterestsController");

// Step 3. importing DB
const db = require("./db/models/index");
const { user, interest } = db;

// Step 4. initializing Controllers -> note the lowercase for the first word
const usersController = new UsersController(user, interest);
const interestsController = new InterestsController(interest);

// Step 5.initializing Routers -> note the lowercase for the first word
const usersRouter = new UsersRouter(usersController).routes();
const interestsRouter = new InterestsRouter(interestsController).routes();

const PORT = process.env.PORT || 8080;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Step 6. using the routers
app.use("/users", usersRouter);
app.use("/interests", interestsRouter);

app.listen(PORT, () => {
  console.log(`Express app listening on port ${PORT} yeees!`);
});
