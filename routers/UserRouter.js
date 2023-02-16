const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

class UserRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {

    router.get("/", verifyToken, this.controller.currentUser.bind(this.controller));
    router.put("/", verifyToken, this.controller.updateUser.bind(this.controller));
    router.get("/:username/interests", verifyToken, this.controller.getUserInterests.bind(this.controller));

    return router;
  }
}

module.exports = UserRouter;
