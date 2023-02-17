const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

class UsersRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.get("/test", this.controller.test.bind(this.controller));

    // router.get("/", this.controller.getRecommendations.bind(this.controller));

    router.get("/", this.controller.getAll.bind(this.controller));

    // Sign Up
    router.post("/", this.controller.signUp.bind(this.controller));

    // Login
    router.post("/login", this.controller.signIn.bind(this.controller));

    // Sign Out
    router.post("/logout", this.controller.signOut.bind(this.controller));

    // Get Random Users
    router.get("/random-users", verifyToken, this.controller.getRandomUsers.bind(this.controller));

    return router;
  }
}

module.exports = UsersRouter;
