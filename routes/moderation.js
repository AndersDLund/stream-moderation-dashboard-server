
const router = require('express').Router();
const Sentiment = require('sentiment');

const StreamChat = require('stream-chat').StreamChat;
const chatClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET);
const admin = "Ryan";

router.route('/flagged').post((req, res) => {
    const { filter, options } = req.body;
    chatClient.queryMessageFlags(filter, options).then((flaggedMessages) => {
        res.status(200).send(JSON.stringify(flaggedMessages.flags));
    }).catch((err) => {
        console.log(err)
        res.status(401).send(`[ERROR]: ${err}`);
    });
});


// User Actions //
// test payload: {"userID" : ["Tyler1", "BigBoi"]}
router.route('/user/ban').post(async(req, res) => {
    const user_id  = req.body.userID;
    const size = user_id.length
    console.log(user_id)
    try {
      if(size === 1) {
        let banUserRes = await chatClient.banUser(user_id[0], { 
            banned_by_id: admin,
            reason: 'Unruly Behavior', 
        });
      }
      else{
        let newArray = user_id.map(function(element){
           chatClient.banUser(element, { banned_by_id: admin, reason: 'Unruly Behavior', });
           console.log(element)
        });
        console.log(newArray[0])
      }       
        res.status(200).json({
          payload: "Banned user(s) from all channels: " + user_id,
        });
      } catch (error) {
        res.sendStatus(400);
        res.status(401).send(`[ERROR]: ${error}`);
      }
});

// Test data: {"userID" : "Tyler1"}
router.route('/user/ban24').post(async(req, res) => {
  const user_id  = req.body.userID;
  const size = user_id.length
  try {
    if (size===1) {
      let banUser24Res = await chatClient.banUser(user_id[0], { 
        banned_by_id: admin, 
        timeout: 24*60, 
        ip_ban:  true, 
        reason: 'Please come back tomorrow', 
     });
    }
      // 777 NEW SECTION 777 //
      else{
        let newArray = user_id.map(function(element){
           chatClient.banUser(element, { banned_by_id: admin, timeout: 24*60, ip_ban:true, reason: 'Please come back tomorrow', });
           console.log(element)
        });
        console.log(newArray[0])
      }
        res.status(200).json({
          payload: "Banned user(s) from App for 24 hours: " + user_id,
        });
      } catch (error) {
        res.status(401).send(`[ERROR]: ${error}`);
      }
});


// Test data: {"userID" : "Tyler1"}
router.route('/user/delete').post(async(req, res) => {
    const user_id  = req.body.userID;
    const size = user_id.length
    try {
      if(size===1) {
        let deleteUserRes = await chatClient.deleteUser(user_id, { 
        }); 
      }
      else {
        let newArray = user_id.map(function(element){
          chatClient.deleteUser(element, {});
        });
      }
        res.status(200).json({
          payload: "Deleted user(s): " + user_id,
        });
      } catch (error) {
        res.status(401).send(`[ERROR]: ${error}`);
      }
});

// Test data: {"userID" : "Tyler1"}
router.route('/user/deleteUserAndMessages').post(async(req, res) => {
    const user_id  = req.body.userID;
    const size = user_id.length
    try {
      if(size===1) {
        let deleteUserAndAllMsgsRes = await chatClient.deleteUser(user_id, { 
            delete_conversation_channels: true, 
            mark_messages_deleted: true, 
            hard_delete: true, 
        });
      }
      else {
        let newArray = user_id.map(function(element){
          chatClient.deleteUser(element, { 
            delete_conversation_channels: true, 
            mark_messages_deleted: true, 
            hard_delete: true, 
        });
       });
      }
        res.status(200).json({
          payload: "Deleted all user data and messages for user(s): " + user_id,
        });
      } catch (error) {
        console.log(error)
        res.status(401).send(`[ERROR]: ${error}`);
      }
});

// Message Actions //
// Test data: {"messageID" : "8d5fa752-83a3-4bda-992c-d226f5e3b2ca"}
router.route('/message/delete').post(async(req, res) => {
    const message_id  = req.body.messageID;
    const size = message_id.length
    console.log(message_id)
    try {
      if(size === 1) {
        let deletedMsgRes = await chatClient.deleteMessage(message_id, true);
        // console.log(del)
      }
      else {
        let newArray = message_id.map(function(element){
          chatClient.deleteMessage(element, true);
          // console.log(new)
        });
      }
      res.status(200).json({
        payload: "Deleted message(s) with ID(s): " + message_id,
      });
      }
      catch (error) {
        res.status(401).send(`[ERROR]: ${error}`);
      }
});

router.route('/message/unflag').post((req, res) => {

});

router.route('/sentiment').post((req, res) => {
  const sentiment = new Sentiment();
  const result = sentiment.analyze(req.body.text);
  res.status(200).send(JSON.stringify(result));
})

module.exports = router;