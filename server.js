require('dotenv').config()

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const StreamChat = require('stream-chat').StreamChat;

const app = express();
const port = process.env.PORT || 6000;
const chatClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET);

//middleware
app.use(cors());
app.use(bodyParser.json());

//routes
const moderationRouter = require('./routes/moderation');
app.use('/moderation', moderationRouter);

app.post("/webhook", (req, res) => {
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        let parsedBody = JSON.parse(body);
        if (parsedBody.type === 'message.flagged') {
            chatClient.sendUserCustomEvent('admin', {
                type: 'flagged_message',
                content: JSON.stringify(parsedBody),
            }).then((res) => {
                console.log(res, 'EVENT SENT');
            })
        }
    })
    res.status(200).send('OK');
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})