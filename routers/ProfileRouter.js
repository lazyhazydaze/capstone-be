const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");

class ProfileRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.get("/:username", verifyToken, this.controller.getProfile.bind(this.controller));

    return router;
  }
}

module.exports = ProfileRouter;
