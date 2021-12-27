const app = require('../app');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const Message = require('../database/models/messageModel');

const connectedUsers = {};

io.on('connection', (socket) => {
    const socketId = socket.id;

    socket.on('users:connect', (data) => {
        const user = {...data, activeRoom: null, socketId };

        connectedUsers[socketId] = user;

        socket.emit('users:list', Object.values(connectedUsers));
        socket.broadcast.emit('users:add', user);
    });

    socket.on('message:add', (data) => {
        const {senderId, recipientId, roomId } = data;

        socket.emit('message:add', data);
        socket.broadcast.to(roomId).emit('message:add', data);

        addMessageHistory(senderId, recipientId, data);
        if (senderId !== recipientId) {
            addMessageHistory(recipientId, senderId, data);
        }
    });

    socket.on('message:history', async (data) => {
        const message = await Message.findOne({senderId: data.userId, recipientId: data.recipientId});

        socket.emit('message:history', message.data);
    });

    socket.on('disconnect', () => {
        delete connectedUsers[socketId];
        socket.broadcast.emit('users:leave', socketId);
    });
});

async function addMessageHistory(senderId, recipientId, data) {

    const issetMessage = await Message.findOne({senderId: senderId, recipientId: recipientId});

    if (issetMessage === null) {
        const message = await new Message({senderId: senderId, recipientId: recipientId, data: data});
        message.save();
    } else {
        const issetMessage = await Message.findOne({senderId: senderId, recipientId: recipientId});

        await Message.findOneAndUpdate({
            senderId: senderId,
            recipientId: recipientId
        },
        {
            data: [ ...issetMessage.data, data ]
        }, {new: true});
    }
};

module.exports = server;