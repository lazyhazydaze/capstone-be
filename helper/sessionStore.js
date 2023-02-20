const { Op } = require("sequelize");

class SessionStore {
  constructor(userModel, chatModel) {
    this.userModel = userModel;
    this.chatModel = chatModel;
  }

  // findSession(id) {
  //   return this.sessions.get(id);
  // }

  async saveSession(userID, online) {
    //this.sessions.set(id, session);
    //update online status
    let output = await this.userModel.findByPk(userID);
    if (output) {
      await output.update({
        updated_at: new Date(),
        online: online,
      });
    }
  }

  async findAllSessions(userID) {
    console.log(userID);
    let sessions = await this.chatModel.findAll({
      where: { [Op.or]: [{ user1_id: userID }, { user2_id: userID }] },
      include: [
        { model: this.userModel, as: "user1" },
        { model: this.userModel, as: "user2" },
      ],
    });
    //console.log("what are sessions?? : ", sessions[0].dataValues.id);
    let filteredarray = [];
    sessions.forEach((object) => {
      if (object.dataValues.user1_id == userID) {
        filteredarray.push({
          id: object.dataValues.user2_id,
          username: object.dataValues.user2.username,
          online: object.dataValues.user2.online,
          chatid: object.dataValues.id,
          profilepic: object.dataValues.user2.profilepic,
        });
      } else {
        filteredarray.push({
          id: object.dataValues.user1_id,
          username: object.dataValues.user1.username,
          online: object.dataValues.user1.online,
          chatid: object.dataValues.id,
          profilepic: object.dataValues.user1.profilepic,
        });
      }
    });
    console.log("what is filteredarray?? : ", filteredarray);
    return filteredarray;
  }
}

module.exports = {
  SessionStore,
};
