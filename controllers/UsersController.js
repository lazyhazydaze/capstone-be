const { jwtSign } = require("../helpers/jwt");
const { bcryptHash, bcryptCompare } = require("../helpers/bcrypt");
const {
  ValidationError,
  FieldRequiredError,
  AlreadyTakenError,
  NotFoundError,
} = require("../helpers/customError");

const BaseController = require("./BaseController");

class UsersController extends BaseController {
  constructor(model, interestModel, io) {
    super(model);
    this.interestModel = interestModel;
    this.io = io;
  }

  // Register
  async signUp(req, res, next) {
    try {
      console.log(req.body.user);
      const {
        username,
        email,
        password,
        firstname,
        profilepic,
        location,
        gender,
        yearofbirth,
        biography,
        interests,
        online,
      } = req.body.user;
      if (!username) throw new FieldRequiredError(`A username`);
      if (!email) throw new FieldRequiredError(`An email`);
      if (!password) throw new FieldRequiredError(`A password`);

      const userExists = await this.model.findOne({
        where: { email: req.body.user.email },
      });
      if (userExists) throw new AlreadyTakenError("Email", "try logging in");

      const newUser = await this.model.create({
        email: email,
        firstname: firstname,
        username: username,
        biography: biography,
        profilepic: profilepic,
        location: location,
        gender: gender,
        yearofbirth: yearofbirth,
        password: await bcryptHash(password),
        interests: interests,
        online: online,
      });

      // Associate interests with the new user
      const interestModels = [];
      for (const interest of interests) {
        const [interestModel, created] = await this.interestModel.findOrCreate({
          where: { name: interest.interest },
          defaults: { self_skill: interest.self_skill },
        });
        interestModels.push(interestModel);
      }
      await newUser.setInterests(interestModels);

      newUser.dataValues.token = await jwtSign(newUser);

      res.status(201).json({ user: newUser });
    } catch (error) {
      next(error);
    }
  }

  // Login
  async signIn(req, res, next) {
    try {
      const { user } = req.body;

      const existentUser = await this.model.findOne({
        where: { email: user.email },
      });

      if (existentUser) {
        await existentUser.update({ online: true });
      }
      
      if (!existentUser) throw new NotFoundError("Email", "Try signing up first");

      const pwd = await bcryptCompare(user.password, existentUser.password);
      if (!pwd) throw new ValidationError("Wrong email/password combination");

      existentUser.dataValues.token = await jwtSign(user);
      // notify existing users that this user is online so the status can be updated (red to green colour)
      console.log("connect", existentUser);
      this.io.emit("user connected", {
        userID: existentUser.id,
        username: existentUser.username,
        connected: true,
        messages: [],
      });
      res.json({ user: existentUser });
    } catch (error) {
      next(error);
    }
  }

  async signOut(req, res) {
    try {
      console.log(req.body.email);

      const existentUser = await this.model.findOne({
        where: { email: req.body.email },
      });
      // update the user's online status to false in the database
      const row = await existentUser.update({ online: false });
      console.log("disconnect", row);
      this.io.emit("user disconnected", row.id);
      // send a successful response
      res.status(200).send({ message: "Logged out successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "An error occurred while logging out." });
    }
  }
}

module.exports = UsersController;
