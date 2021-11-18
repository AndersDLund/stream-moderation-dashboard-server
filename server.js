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
    console.log(req.body);
    let body = '';

    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {
        let parsedBody = JSON.parse(body);
        console.log(parsedBody);
        if (parsedBody.type === 'message.flagged') {
            console.log('FLAGGED!!!!!!!!');
            chatClient.sendUserCustomEvent('admin', {
                type: 'flagged_message',
                content: JSON.stringify(parsedBody),
            });
        }
        res.status(200).send('OK');
    })
})

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})