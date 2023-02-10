class BaseController {
  constructor(model) {
    this.model = model;
  }

  async test(req, res) {
    try {
      // put logic here
      return res.json("testing - this route is working");
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }

  async getAll(req, res) {
    console.log(this.model);
    try {
      const output = await this.model.findAll();
      return res.json(output);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }

  async createOne(req, res) {
    try {
      const data = { ...req.body };
      const output = await this.model.create(data);
      return res.json(output);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = BaseController;
