class ChatsController {
  constructor(model, userModel, chatModel) {
    this.model = model;
    this.userModel = userModel;
    this.chatModel = chatModel;
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
}

module.exports = ChatsController;
