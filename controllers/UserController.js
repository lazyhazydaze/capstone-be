const { UnauthorizedError } = require("../helpers/customError");
const { bcryptHash } = require("../helpers/bcrypt");
const BaseController = require("./BaseController");


class UserController extends BaseController {
  constructor(model, interestModel) {
    super(model);
  }

  //* Current User
  async currentUser(req, res, next) {
    try {
      const { loggedUser } = req;
      if (!loggedUser) throw new UnauthorizedError();

      loggedUser.dataValues.email = req.headers.email;
      delete req.headers.email;

      res.json({ user: loggedUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
