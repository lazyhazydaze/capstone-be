const express = require("express");
const router = express.Router();

class InterestsRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.get("/test", this.controller.test.bind(this.controller));
    router.get("/", this.controller.getAll.bind(this.controller));
    router.post("/", this.controller.createInterest.bind(this.controller));

    return router;
  }
}

module.exports = InterestsRouter;
