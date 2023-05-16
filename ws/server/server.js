const websocket = require('ws');
const http = require('http');
const PORT = 5500;

const httpServer = http.createServer();
const server = new websocket.Server({
    noServer: true
})

server.on('connection', (socket) => {
    let username;
    let isfirstMessage = true;
    const { clients } = server; // clients is a set
    console.log('First message on connection', isfirstMessage)
    console.log('New connection established');
    console.log('Number of clients', clients.size);

    socket.on('message', (data) => {
        let clientMessage = data.toString();
        console.log(clientMessage);
        console.log('First message on message:', isfirstMessage);

        if (isfirstMessage) {
            username = clientMessage;

            clients.forEach((client) => {
                if (client.readyState === 1) {
                  client.send(`${username} has joined!`);
                }
            });

            isfirstMessage = false;
        } else {
            clients.forEach((client) => {
                if (client.readyState === 1 && client !== socket) {
                  client.send(`${username}: ${clientMessage}`);
                  console.log('message sent to clients');
                }
              });
        }
        //sender = socket;
    })    

    socket.on('close', () => {
        clients.delete(socket);
        console.log('client has disconnected');
        console.log('Number of clients',clients.size); 

        clients.forEach((client) => {
            if (client.readyState == 1 && client !== socket) client.send(`${username} has disconnected`)
        })
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

