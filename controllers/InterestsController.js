const BaseController = require("./BaseController");

class InterestsController extends BaseController {
  constructor(model) {
    super(model);
  }

  // retrieve all interests for selection
  // use getAll method from base controller

  // create new interest
  async createInterest(req, res) {
    const { name } = req.body;
    try {
      const newInterest = await this.model.create({
        name: name,
      });
      return res.json(newInterest);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  
}

module.exports = InterestsController;
