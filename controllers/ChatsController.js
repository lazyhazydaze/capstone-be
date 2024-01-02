const { Op } = require("sequelize");

class ChatsController {
  constructor(model, userModel, chatModel, io) {
    this.model = model;
    this.userModel = userModel;
    this.chatModel = chatModel;
    this.io = io;
    this.senderid = new Set();
  }

  async sendSwipe(req, res) {
    const { senderId, recipientId, isRejected } = req.body;
    console.log(req.body);
    console.log(this.senderid);
    if (this.senderid.has(senderId)) {
      return res.status(400).json({ error: true, msg: "request pending" });
    } else {
      this.senderid.add(senderId);
    }
    try {
      //Make sure they dont have an existing chat
      const ifChatExist = await this.chatModel.findOne({
        where: {
          [Op.or]: [
            { user1_id: senderId, user2_id: recipientId },
            { user1_id: recipientId, user2_id: senderId },
          ],
        },
      });
      if (ifChatExist) {
        this.senderid.delete(senderId);
        return res.json(ifChatExist);
      }

      //isRejected = true
      if (isRejected) {
        const ifExist = await this.model.findOne({
          where: {
            [Op.or]: [
              { sender_id: senderId, recipient_id: recipientId },
              { sender_id: recipientId, recipient_id: senderId },
            ],
          },
        });
        if (ifExist) {
          const response = await ifExist.update({
            is_rejected: true,
            updated_at: new Date(),
          });
          this.senderid.delete(senderId);
          return res.json(response);
        }
        const response = await this.model.create({
          sender_id: senderId,
          recipient_id: recipientId,
          is_rejected: true,
          updated_at: new Date(),
          created_at: new Date(),
        });

        this.senderid.delete(senderId);
        return res.json(response);
      }
      //isRejected = false
      else {
        const ifOtherPartyOrMeReject = await this.model.findOne({
          where: {
            [Op.or]: [
              {
                sender_id: senderId,
                recipient_id: recipientId,
                is_rejected: true,
              },
              {
                sender_id: recipientId,
                recipient_id: senderId,
                is_rejected: true,
              },
            ],
          },
        });
        if (ifOtherPartyOrMeReject) {
          this.senderid.delete(senderId);
          return res.json(ifOtherPartyOrMeReject);
        }
        const didISendARequest = await this.model.findOne({
          where: {
            sender_id: senderId,
            recipient_id: recipientId,
            is_rejected: false,
          },
        });
        if (didISendARequest) {
          this.senderid.delete(senderId);
          return res.json(didISendARequest);
        }
        const didOtherPartySendARequest = await this.model.findOne({
          where: {
            sender_id: recipientId,
            recipient_id: senderId,
            is_rejected: false,
          },
        });
        if (didOtherPartySendARequest) {
          await didOtherPartySendARequest.destroy();
          const newChat = await this.chatModel.create({
            user1_id: senderId,
            user2_id: recipientId,
            title: "Helloworld",
            updated_at: new Date(),
            created_at: new Date(),
          });

          const newChat1 = await this.chatModel.findByPk(newChat.id, {
            include: [
              { model: this.userModel, as: "user1" },
              { model: this.userModel, as: "user2" },
            ],
          });
          this.io.to(String(newChat1.user1_id)).emit("New Friend", {
            userID: newChat1.user2_id,
            username: newChat1.user2.username,
            firstname: newChat1.user2.firstname,
            profilepic: newChat1.user2.profilepic,
            connected: newChat1.user2.online,
            chatid: newChat1.id,
            messages: [],
          });
          this.io.to(String(newChat1.user2_id)).emit("New Friend", {
            userID: newChat1.user1_id,
            username: newChat1.user1.username,
            firstname: newChat1.user1.firstname,
            profilepic: newChat1.user1.profilepic,
            connected: newChat1.user1.online,
            chatid: newChat1.id,
            messages: [],
          });
          this.senderid.delete(senderId);
          return res.json(newChat);
        }
        const response = await this.model.create({
          sender_id: senderId,
          recipient_id: recipientId,
          is_rejected: false,
          updated_at: new Date(),
          created_at: new Date(),
        });
        this.senderid.delete(senderId);
        return res.json(response);
      }
    } catch (err) {
      this.senderid.delete(senderId);
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // recommendations should take care of the following scenarios:
  // 1. user should not be given an option to add ownself
  // 2. user should not be given an option to add the person already chatting with
  // 3. recipient unable to send friend request back to the sender
  // 4. user cannot resend to same person
  // 5. user cannot send to person not in database

  async sendChatRequest(req, res) {
    const { senderId, recipientId } = req.body;
    try {
      let output = await this.model.findAll({
        where: { sender_id: recipientId, recipient_id: senderId },
      });
      console.log("output: ", output);
      // if it's a mutual request, automatically accepts and creates chat room.
      if (output.length > 0) {
        const { sender_id, recipient_id } = output[0];
        await output[0].destroy(); // deletes the row
        const newChat = await this.chatModel.create({
          user1_id: sender_id,
          user2_id: recipient_id,
          title: "Helloworld",
        });
        return res.json(newChat);
      } else {
        // Send chat request
        const newRequest = await this.model.create({
          sender_id: senderId,
          recipient_id: recipientId,
        });
        return res.json(newRequest);
      }
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // View chat requests sent by the user

  async getAllRequestSent(req, res) {
    const { senderId } = req.params;
    try {
      const sentRequests = await this.model.findAll({
        where: { sender_id: senderId },
        include: { model: this.userModel, as: "recipient" },
      });
      return res.json(sentRequests);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // View chat requests received by the user

  async getAllRequestReceived(req, res) {
    const { recipientId } = req.params;
    try {
      const receivedRequests = await this.model.findAll({
        where: { recipient_id: recipientId },
        include: { model: this.userModel, as: "sender" },
      });
      return res.json(receivedRequests);
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // Accept friend request
  // Removes from friendrequest table
  // Adds to friendlist table
  async acceptChatRequest(req, res) {
    const id = req.params.tableId;
    try {
      let output = await this.model.findByPk(id);
      if (output) {
        console.log("output: ", output);
        const { sender_id, recipient_id } = output;
        await output.destroy(); // deletes the row
        const newChat = await this.chatModel.create({
          user1_id: sender_id,
          user2_id: recipient_id,
          title: "Placeholder title",
        });
        return res.json(newChat);
      }
    } catch (err) {
      return res.status(400).json({ error: true, msg: err });
    }
  }

  // Reject (recipient POV) or delete (sender POV) chat request
  async rejectChatRequest(req, res) {
    const id = req.params.tableId;
    try {
      let output = await this.model.findByPk(id);
      console.log("output for delete", output);
      if (output) {
        await output.destroy(); // deletes the row
      }
      return res.json(output);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }

  async getOneChat(req, res) {
    const { chatId } = req.params;
    try {
      const output = await this.chatModel.findByPk(chatId, {
        include: [
          {
            model: this.userModel,
            as: "user1",
            attributes: ["firstname", "profilepic", "id"],
          },
          {
            model: this.userModel,
            as: "user2",
            attributes: ["firstname", "profilepic", "id"],
          },
        ],
      });
      return res.json(output);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: true, msg: err });
    }
  }
}

module.exports = ChatsController;
