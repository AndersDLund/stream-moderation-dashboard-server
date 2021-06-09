require('dotenv').config()

const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());

//routes
const moderationRouter = require('./routes/moderation');

app.use('/moderation', moderationRouter);

app.listen(port, () => {
    console.log(`server running on port ${port}`);
})
