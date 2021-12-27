const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderId: String,
    recipientId: String,
    data: Array
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;