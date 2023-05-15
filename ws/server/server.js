const websocket = require('ws');
const http = require('http');
const { disconnect } = require('process');
const PORT = 5500;

const httpServer = http.createServer((req, res) => {
    if (req.url == '/favicon.ico') {
        res.writeHead(200); 
        res.end();
    }
});
const server = new websocket.Server({
    noServer: true
})

let auth = []

server.on('connection', (socket) => {
    const { clients } = server; // clients is a set
    auth.push({socket, id: clients.size });
    console.log('New connection established');
    console.log('Number of clients', clients.size);

    socket.on('message', (data) => {
        if (typeof data == 'string') data = data.toString();
        console.log(auth.find((user) => user.socket == socket).id)
        console.log(data);

        //sender = socket;

        clients.forEach((client) => {
            if (client.readyState == 1 && client !== socket) client.send(data.toString())
        })
    })    

    socket.on('close', () => {
        disconnectedUser = auth.filter((user) => user.socket == socket)
        auth = auth.filter((client) => client.socket != socket);

        console.log(auth);
        console.log(auth.length);
        console.log(disconnectedUser)

        clients.delete(socket);
        console.log('client has disconnected');
        console.log('Number of clients',clients.size); 

        clients.forEach((client) => {
            if (client.readyState == 1 && client !== socket) client.send(`User ${disconnectedUser[0].id} has disconnected`)
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

