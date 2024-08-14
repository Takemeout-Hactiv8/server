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
    })
})

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

httpServer.listen(port, () => {
    console.log('server running at ' + port);
});