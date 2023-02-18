const { Op } = require("sequelize");
const { Sequelize } = require("../db/models");

class RecoController {
  constructor(chatModel, chatRequestModel, userInterestModel) {
    this.chatModel = chatModel;
    this.chatRequestModel = chatRequestModel;
    this.userInterestModel = userInterestModel;
  }

  async test(req, res) {
    try {
      const newInterest = await this.userInterestModel.findAll();
      // const newInterest = this.userInterestModel.rawAttributes;
      return res.json(newInterest);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }
  // create new interest
  async getRecommendations(req, res) {
    const { userid } = req.params;
    try {
      const allInterest = await this.userInterestModel.findAll({
        where: { user_id: userid },
      });
      const arrayInterest = allInterest.map(({ interest_id }) => interest_id);
      console.log(arrayInterest);

      const userarray = [];
      userarray.push(userid);
      //Get all chats
      const allChats = await this.chatModel.findAll({
        where: { [Op.or]: [{ user1_id: userid }, { user2_id: userid }] },
      });
      allChats.forEach(({ user1_id, user2_id }) => {
        if (!userarray.includes(user1_id)) {
          userarray.push(user1_id);
        }
        if (!userarray.includes(user2_id)) {
          userarray.push(user2_id);
        }
      });

      //Get all chat request
      //1. Sent from me (means i've seen this recommendation and responded to it)
      //2. if the request has me inside and is rejected. (either party rejected, no point matching them)

      const allChatRequest = await this.chatRequestModel.findAll({
        where: {
          [Op.or]: [
            { sender_id: userid },
            {
              [Op.and]: [{ recipient_id: userid }, { is_rejected: true }],
            },
          ],
        },
      });

      allChatRequest.forEach(({ sender_id, recipient_id }) => {
        if (!userarray.includes(sender_id)) {
          userarray.push(sender_id);
        }
        if (!userarray.includes(recipient_id)) {
          userarray.push(recipient_id);
        }
      });

      const allReco = await this.userInterestModel.findAll({
        attributes: [
          "user_id",
          [
            Sequelize.fn("COUNT", Sequelize.col("userinterest.interest_id")),
            "InterestCount",
          ],
        ],
        where: {
          [Op.and]: [
            { interest_id: arrayInterest },
            { [Op.not]: [{ user_id: userarray }] },
          ],
        },
        group: ["user_id"],
        order: [["InterestCount", "DESC"]],
        limit: 5,
      });

      return res.json(allReco);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = RecoController;
