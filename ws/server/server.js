const websocket = require('ws');
const http = require('http');
const PORT = 5500;

const httpServer = http.createServer();
const server = new websocket.Server({
    noServer: true
})

server.on('connection', (socket) => {
    const { clients } = server;
    console.log('connection established');
    console.log('Number of clients', clients.size);

    socket.on('message', (data) => {
        console.log(data.toString());

        let sender = socket;

        clients.forEach((client) => {
            if (client.readyState == 1 && client !== sender) client.send(data.toString())
        })
    })    

    socket.on('close', () => {
        clients.delete(socket);
        console.log('client has disconnected');
        console.log('Number of clients',clients.size)
    })
})

httpServer.on('upgrade', async (request, httpSocket, head) => {
    server.handleUpgrade(request, httpSocket, head, (socket) => {
        server.emit('connection', socket, request)
    })
})

httpServer.listen(PORT, () => {
    console.log('http server running on port', PORT)
})