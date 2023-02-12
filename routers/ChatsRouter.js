const express = require("express");
const router = express.Router();

class ChatsRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.post(
      "/request",
      this.controller.sendChatRequest.bind(this.controller)
    );
    router.get(
      "/requests-sent/sender/:senderId",
      this.controller.getAllRequestSent.bind(this.controller)
    );
    router.get(
      "/requests-received/recipient/:recipientId",
      this.controller.getAllRequestReceived.bind(this.controller)
    );

    router.post(
      "/requests-accept/table/:tableId",
      this.controller.acceptChatRequest.bind(this.controller)
    );

    router.delete(
      "/requests-delete/table/:tableId",
      this.controller.rejectChatRequest.bind(this.controller)
    );

    return router;
  }
}

module.exports = ChatsRouter;
