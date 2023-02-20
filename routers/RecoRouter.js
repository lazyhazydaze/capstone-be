const express = require("express");
const router = express.Router();

class RecoRouter {
  constructor(controller) {
    this.controller = controller;
  }
  routes() {
    router.get("/test", this.controller.test.bind(this.controller));

    // get recommendations for user
    router.get(
      "/interest/:userid",
      this.controller.getInterestRecommendations.bind(this.controller)
    );

    router.get(
      "/location/:userid",
      this.controller.getLocationRecommendations.bind(this.controller)
    );

    return router;
  }
}

module.exports = RecoRouter;
