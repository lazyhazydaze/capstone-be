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
  constructor(model, interestModel) {
    super(model);
    this.interestModel = interestModel;
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

      await this.model.update(
        { online: true },
        { where: { email: user.email } }
      );

      if (!existentUser) throw new NotFoundError("Email", "sign in first");

      const pwd = await bcryptCompare(user.password, existentUser.password);
      if (!pwd) throw new ValidationError("Wrong email/password combination");

      existentUser.dataValues.token = await jwtSign(user);

      res.json({ user: existentUser });
    } catch (error) {
      next(error);
    }
  }

  // How do I change online status ??

  async signOut(req, res) {
    try {
      console.log(req.body.email);
      // update the user's online status to false in the database
      await this.model.update(
        { online: false },
        { where: { email: req.body.email } }
      );

      // send a successful response
      res.status(200).send({ message: "Logged out successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "An error occurred while logging out." });
    }
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

      await this.model.update(
        { online: true },
        { where: { email: user.email } }
      );

      if (!existentUser) throw new NotFoundError("Email", "sign in first");

      const pwd = await bcryptCompare(user.password, existentUser.password);
      if (!pwd) throw new ValidationError("Wrong email/password combination");

      existentUser.dataValues.token = await jwtSign(user);

      res.json({ user: existentUser });
    } catch (error) {
      next(error);
    }
  }

  // How do I change online status ??

  async signOut(req, res) {
    try {
      console.log(req.body.email);
      // update the user's online status to false in the database
      await this.model.update(
        { online: false },
        { where: { email: req.body.email } }
      );

      // send a successful response
      res.status(200).send({ message: "Logged out successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "An error occurred while logging out." });
    }
  }

  // create one user profile, or if user profile already exists, get one user profile

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
          selectedInterestIds, //array of ids [1,3,2]
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

  // note: for user and interest, have to do it as transaction. if the interest did not exist, then cannot create user also.

  // edit user profile details
  // delete user profile details

  // retrieve recommendations - hardcoded for now as 4 random users
  async getRecommendations(req, res) {
    try {
      const output = await this.model.findAll();
      return res.json(output);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = UsersController;
