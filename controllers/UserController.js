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

  // Update User
  async updateUser (req, res, next) {
  try {
    const { loggedUser } = req;
    if (!loggedUser) throw new UnauthorizedError();

    const {
      user: { password },
      user,
    } = req.body;

    Object.entries(user).forEach((entry) => {
      const [key, value] = entry;

      if (value !== undefined && key !== "password") loggedUser[key] = value;
    });

    if (password !== undefined && password !== "") {
      loggedUser.password = await bcryptHash(password);
    }

    await loggedUser.save();

    res.json({ user: loggedUser });
  } catch (error) {
    next(error);
  }
};


async getUserInterests(req, res) {
  const { username } = req.params;
  
  // Retrieve the user and their associated interests
  const user = await this.model.findOne({ where: { username } });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const interests = await user.getInterests();
  const interestNames = interests.map((interest) => interest.name);
  
  // Return the user interests in the API response
  res.json({ interests: interestNames });
}

}

module.exports = UserController;
