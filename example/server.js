'use strict';

const Hapi = require('hapi');
const hapiSyslogPlugin = require('../');
const applicationRoutes = require('./routes/applicationRoutes');
const server = new Hapi.Server();

//Configure http
server.connection({
    host: '0.0.0.0',
    port: 3000
});

//Register the plugin and a simple hello world route
server.register([{
    register: applicationRoutes
},{
    register: hapiSyslogPlugin,
    options: {
    }
}], (err) => {

    if (err) {
        throw err;
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }

    server.connections.forEach((connection) => {

        const protocol = connection.info.protocol;
        const host = connection.info.host;
        const port = connection.info.port;
        server.log(['info', 'server'], `Server listening at ${protocol}://${host}:${port}`);
    });
});
