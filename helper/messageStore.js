const { Op } = require("sequelize");

class MessageStore {
  constructor(messageModel, userModel) {
    this.userModel = userModel;
    this.messageModel = messageModel;
  }

  async saveMessage(message) {
    // note: async-await not required since no need return stuff
    const { content, from_id, to_id, chatroom_id } = message;
    console.log(message);
    return await this.messageModel.create({
      chatroom_id,
      content,
      from_id,
      to_id,
    });
  }

  async findMessagesForUser(userID) {
    const messages = await this.messageModel.findAll({
      where: { [Op.or]: [{ from_id: userID }, { to_id: userID }] },
    });
    return messages;
  }
}

module.exports = {
  MessageStore,
};
