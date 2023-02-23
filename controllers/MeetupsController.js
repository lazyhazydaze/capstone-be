const BaseController = require("./BaseController");
const { Op } = require("sequelize");

class MeeetupsController extends BaseController {
  constructor(model, chatModel, userModel) {
    super(model);
    this.chatModel = chatModel;
    this.userModel = userModel;
  }

  // create a meetup
  async createNewMeetup(req, res) {
    const { chatId } = req.params;
    const { title, tag, datetime, location, comment, authorId } = req.body;
    try {
      const newMeetup = await this.model.create({
        chat_id: chatId,
        author_id: authorId,
        title,
        tag,
        datetime,
        location,
        comment,
        pending: true,
        accepted: false,
        rejected: false,
      });
      return res.json(newMeetup);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  async getAllConfirmed(req, res) {
    const { userId } = req.params;

    try {
      const meetups = await this.model.findAll({
        include: {
          model: this.chatModel,
          as: "chat",
          where: { [Op.or]: [{ user1_id: userId }, { user2_id: userId }] },
        },
        where: { accepted: true },
      });

      return res.json(meetups);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  async getAllMeetupsByUser(req, res) {
    const { userId } = req.params;
    try {
      const allMeetups = await this.model.findAll({
        // where: { chat_id: arrayChats },
        include: [
          {
            model: this.chatModel,
            as: "chat",
            where: {
              [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
            },
            include: [
              { model: this.userModel, as: "user1", attributes: ["firstname"] },
              { model: this.userModel, as: "user2", attributes: ["firstname"] },
            ],
          },
          { model: this.userModel, as: "author", attributes: ["firstname"] },
        ],
      });
      return res.json(allMeetups);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // retrieve meetups per chatroom
  async getAllMeetupsChatroom(req, res) {
    const { chatId } = req.params;
    try {
      const meetups = await this.model.findAll({
        where: { chat_id: chatId },
        include: [{ model: this.chatModel, as: "chat" }],
      });
      return res.json(meetups);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // reject meetup
  async rejectMeetup(req, res) {
    const { meetupId } = req.params;
    try {
      let output = await this.model.findByPk(meetupId);
      if (output) {
        await output.update({
          updated_at: new Date(),
          pending: false,
          rejected: true,
        });
        output = await this.model.findByPk(meetupId);
        return res.json(output);
      }
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // accept meetup
  async acceptMeetup(req, res) {
    const { meetupId } = req.params;
    try {
      let output = await this.model.findByPk(meetupId);
      if (output) {
        await output.update({
          updated_at: new Date(),
          pending: false,
          accepted: true,
        });
        output = await this.model.findByPk(meetupId);
        return res.json(output);
      }
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }
}
module.exports = MeeetupsController;
