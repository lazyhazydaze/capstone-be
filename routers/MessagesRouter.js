const express = require("express");
const router = express.Router();

class MessagesRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.get("/test", this.controller.test.bind(this.controller));

    router.post(
      "/chatroom/:chatroomId",
      this.controller.sendMessage.bind(this.controller)
    );

    router.get(
      "/chatroom/:chatroomId",
      this.controller.getAllMessages.bind(this.controller)
    );

    return router;
  }
}

module.exports = MessagesRouter;
