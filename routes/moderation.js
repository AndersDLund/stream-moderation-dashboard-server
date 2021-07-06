const router = require('express').Router();

const StreamChat = require('stream-chat').StreamChat;
const chatClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET);

router.route('/flagged').post((req, res) => {
    const { filter, options } = req.body;
    chatClient.queryMessageFlags(filter, options).then((flaggedMessages) => {
        res.status(200).send(JSON.stringify(flaggedMessages.flags));
    }).catch((err) => {
        res.status(401).send(`[ERROR]: ${err}`);
    });
});

module.exports = router;