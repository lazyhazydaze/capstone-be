const BaseController = require("./BaseController");

class MessagesController extends BaseController {
  constructor(model, userModel) {
    super(model);
    this.userModel = userModel;
  }

  // get all messages from a specific chatroom

  async getAllMessages(req, res) {
    const { chatroomId } = req.params;

    try {
      const messages = await this.model.findAll({
        where: { chatroom_id: chatroomId },
        include: [{ model: this.userModel, as: "writer" }],
      });
      return res.json(messages);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }

  async sendMessage(req, res) {
    const { chatroomId } = req.params;
    const { content, writerId } = req.body;
    try {
      const message = await this.model.create({
        content: content,
        chatroom_id: chatroomId,
        writer_id: writerId,
      });
      return res.json(message);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = MessagesController;
