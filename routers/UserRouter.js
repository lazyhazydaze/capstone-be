const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

class UserRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {

    router.get("/", verifyToken, this.controller.currentUser.bind(this.controller));

    return router;
  }
}

module.exports = UserRouter;
