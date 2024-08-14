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







app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

httpServer.listen(port, () => {
    console.log('server running at ' + port);
});