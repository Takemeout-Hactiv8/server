const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const port = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:5173'
    }
});

let room = [
    {
        name: 'Global Room',
        user: [
            {
                socketId: '999999999999',
                name: 'MASTER'
            }
        ]
    }
];

io.on("connection", (socket) => {
    room.forEach(e => {
        if (e.user.length < 1) {
            room = room.filter((element) => {
                return element.name !== e.name
            })
            io.emit('update-room', room)
        }
    });
    console.log(room);
    socket.emit('newCome', room);

    socket.on('sendChat', (chat, room) => {
        if (room === " ") {
            io.emit('chat-update', {
                sender: socket.id,
                chat: chat
            })
        } else {
            io.to(room).emit('chat-update', {
                sender: socket.id,
                chat: chat
            })
        }
    });

    socket.on('add-room', (roomName) => {
        room.push({ name: roomName, user: [] });

        io.emit('update-room', room)
    });

    socket.on('join-room', (roomName) => {
        if (room.find((e) => e.name === roomName)) {
            room.find((e) => e.name === roomName).user.push({
                socketId: socket.id,
                name: socket.handshake.auth.name
            })
            console.log(room.find((e) => e.name === roomName).user, '<<< fi room ' + roomName)
        } else {
            room.push({
                name: roomName,
                user: [{
                    socketId: socket.id,
                    name: socket.handshake.auth.name
                }]
            })
        }
        socket.join(roomName)
        io.emit('update-room', room)
        io.to(roomName).emit('room-user', room.find((e) => e.name === roomName));
    });

    socket.on('room-out', (roomName) => {
        room.find((e) => e.name === roomName).user = room.find((e) => e.name === roomName).user.filter(ou => {
            return ou.socketId !== socket.id;
        })
        io.to(roomName).emit('room-user', room.find((e) => e.name === roomName));
        io.emit('update-room', room)
    })
})

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

httpServer.listen(port, () => {
    console.log('server running at ' + port);
});