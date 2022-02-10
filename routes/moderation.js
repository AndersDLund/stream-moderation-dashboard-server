
const router = require('express').Router();
const Sentiment = require('sentiment');

const StreamChat = require('stream-chat').StreamChat;
const chatClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET);

router.route('/flagged').post((req, res) => {
  const { filter, options } = req.body;
  chatClient.queryMessageFlags(filter, options).then((flaggedMessages) => {
    res.status(200).send(JSON.stringify(flaggedMessages.flags));
  }).catch((err) => {
    console.log(err);
    res.status(err.response.data.StatusCode).send(`[ERROR]: ${err}`);
  });
});

// User Actions
router.route('/user/ban').post(async (req, res) => {
  const { userIds } = req.body;

  if (userIds.length) {
    try {
      await Promise.all(userIds.map(async (id) => {
        return await chatClient.banUser(id, { banned_by_id: 'admin', reason: 'Breach of policy' });
      }));
      res.status(200).send(JSON.stringify({ payload: `Banned ${userIds.length} users.` }))
    } catch (error) {
      res.status(error.response.data.StatusCode).send(JSON.stringify({ payload: error.response.data.message }));
    }
  }
});

router.route('/user/ban24').post(async (req, res) => {
  const { userIds } = req.body;

  if (userIds.length) {
    try {
      userIds.forEach(id => chatClient.banUser(id, { banned_by_id: 'admin', timeout: 24 * 60, ip_ban: true, reason: 'Breach of policy' }));
      return res.status(200).send(JSON.stringify({ payload: `Banned ${userIds.length} users for 24 hours.` }))
    } catch (error) {
      return res.status(400).send(JSON.stringify({ payload: error }));
    }
  }

  return res.status(400).send(JSON.stringify({ payload: 'no messages selected' }))
});

router.route('/user/delete').post(async (req, res) => {
  const { userIds } = req.body;

  if (userIds.length) {
    try {
      userIds.forEach(id => chatClient.deleteUser(id, {}));
      return res.status(200).send(JSON.stringify({ payload: `Deleted ${userIds.length} Users.` }))
    } catch (error) {
      return res.status(400).send(JSON.stringify({ payload: error }));
    }
  }
  return res.status(400).send(JSON.stringify({ payload: 'no messages selected' }))
});

router.route('/user/deleteUserAndMessages').post(async (req, res) => {
  const { userIds } = req.body;
  if (userIds.length) {
    try {
      userIds.forEach(id => chatClient.deleteUser(id, {
        delete_conversation_channels: true,
        mark_messages_deleted: true,
        hard_delete: true
      }));
      return res.status(200).send(JSON.stringify({ payload: `Deleted ${userIds.length} Users.` }))
    } catch (error) {
      return res.status(400).send(JSON.stringify({ payload: error }));
    }
  }
  return res.status(400).send(JSON.stringify({ payload: 'no messages selected' }))
});

// Message Actions

router.route('/message/delete').post(async (req, res) => {
  const { messages } = req.body;
  const messageIds = messages.map(element => element.message.id);
  if (messages.length) {
    try {
      messages.forEach(element => chatClient.deleteMessage(element.message.id, true));
      return res.status(200).send(JSON.stringify({ payload: `Deleted ${messageIds.length} message(s): ${messageIds}` }));
    } catch (error) {
      return res.status(error.response.data.StatusCode).send(JSON.stringify({ payload: error }));
    }
  }
  return res.status(400).send(JSON.stringify({ payload: 'no messages selected' }))
});

// not sure if unflagged endpoint actually works...
router.route('/message/unflag').post((req, res) => {
  const { messages } = req.body;
  const messageIds = messages.map(element => element.message.id);

  if (messages.length) {
    try {
      messages.forEach(element => chatClient.unflagMessage(element.message.id, { user_id: 'admin' }).then((res) => {
        console.log(res);
      }));
      return res.status(200).send(JSON.stringify({ payload: `Unflagged ${messageIds.length} message(s): ${messageIds}` }));
    } catch (error) {
      console.log(error);
      return res.status(400).send(JSON.stringify({ payload: error }));
    }
  }
  return res.status(400).send(JSON.stringify({ payload: 'no messages selected' }))
});

router.route('/sentiment').post((req, res) => {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(req.body.text);
  res.status(200).send(JSON.stringify(result));
})

module.exports = router;