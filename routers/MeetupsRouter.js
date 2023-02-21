const express = require("express");
const router = express.Router();

class MeetupsRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.get("/test", this.controller.test.bind(this.controller));

    router.post(
      "/chatroom/:chatId",
      this.controller.createNewMeetup.bind(this.controller)
    );

    router.get(
      "/chatroom/:chatId",
      this.controller.getAllMeetupsChatroom.bind(this.controller)
    );

    router.get(
      "/user/confirmed/:userId",
      this.controller.getAllConfirmed.bind(this.controller)
    );

    router.get(
      "/user/:userId",
      this.controller.getAllMeetupsByUser.bind(this.controller)
    );

    router.put(
      "/accept/:meetupId",
      this.controller.acceptMeetup.bind(this.controller)
    );

    router.put(
      "/reject/:meetupId",
      this.controller.rejectMeetup.bind(this.controller)
    );

    return router;
  }
}

module.exports = MeetupsRouter;
