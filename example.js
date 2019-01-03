(() => {
    const fs = require('fs');
    const PeerServer = require('peer').PeerServer;
    const server = PeerServer({
        port: 9000,
        ssl: {
            key: fs.readFileSync('/path/to/ssl.key'),
            cert: fs.readFileSync('/path/to/ssl.crt'),
        },
        path: '/myapp',
        proxied: true,
    });
})();

(() => {
    const express = require('express');
    const app = express();
    const { ExpressPeerServer } = require('peer');
    
    app.get('/', (req, res) => {
        res.send('Hello world!');
    });
    
    const server = app.listen(9000);
    const peerServer = ExpressPeerServer(server, { debug: true });

    app.use('/api', peerServer);
})();

(() => {
    const express = require('express');
    const app = express();
    const server = require('http').createServer(app);
    const { ExpressPeerServer } = require('peer');
    const peerServer = ExpressPeerServer(server, { debug: true });

    app.use('/peerjs', peerServer);

    server.listen(9000);
})();
