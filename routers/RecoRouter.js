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
      "/:userid",
      this.controller.getRecommendations.bind(this.controller)
    );

    return router;
  }
}

module.exports = RecoRouter;
