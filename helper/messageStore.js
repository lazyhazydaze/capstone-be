const { Op } = require("sequelize");

class MessageStore {
  constructor(messageModel, userModel) {
    this.userModel = userModel;
    this.messageModel = messageModel;
  }

  saveMessage(message) {
    // note: async-await not required since no need return stuff
    const { content, from, to, chatroomId } = message;
    console.log(message);
    this.messageModel.create({
      chatroom_id: chatroomId,
      content: content,
      from_id: from,
      to_id: to,
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
