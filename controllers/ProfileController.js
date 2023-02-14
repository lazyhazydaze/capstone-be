const { NotFoundError } = require("../helpers/customError");
const BaseController = require("./BaseController");

class ProfileController extends BaseController {
  constructor(model) {
    super(model);
  }

  //* Get Profile
  async getProfile (req, res, next) {
  try {
    const { loggedUser } = req;
    const { username } = req.params;

    const profile = await this.model.findOne({
      where: { username: username || null },
      attributes: { exclude: "email" },
    });
    if (!profile) throw new NotFoundError("User profile");

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};
}

module.exports = ProfileController;
