const BaseController = require("./BaseController");

class UsersController extends BaseController {
  constructor(model, interestModel) {
    super(model);
    this.interestModel = interestModel;
  }

  // create user profile, or if user profile exists, get user profile
  // how do i add the user interests to this one?

  async createOrGetUser(req, res) {
    try {
      const { email } = req.body;
      let user = await this.model.findAll({ where: { email: email } }); //foong discourages use of email, to use id instead
      if (user.length == 0) {
        // const data = { ...req.body }; //req.body will included selectedInterestIds also?
        const {
          username,
          password,
          email,
          firstname,
          profilepic,
          location,
          gender,
          yearofbirth,
          biography,
          selectedInterestIds,
        } = req.body;
        //user = await this.model.create(data);
        user = await this.model.create({
          username,
          password,
          email,
          firstname,
          profilepic,
          location,
          gender,
          yearofbirth,
          biography,
          online: true,
        });
        // retrieve selected interests
        const selectedInterests = await this.interestModel.findAll({
          where: {
            id: selectedInterestIds,
          },
        });
        // Associated new user with selected interests
        await user.setInterests(selectedInterests);
        return res.json(user);
      }
      return res.json(user[0]);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // edit user profile details
  // delete user profile details
}

module.exports = UsersController;
