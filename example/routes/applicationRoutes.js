'use strict';


const routes = {
    register: (server, options, next) => {

        server.route({
            method: 'GET',
            path: '/',
            config: {
                auth: false, //Public access allowed
                description: 'Route is website root'
            },
            handler: (request, reply) => {
                request.log(['info'],'A request has been invoked!');
		reply('Hello world!');
            }
        });
        next();
    }
};

routes.register.attributes = {
    name: 'applicationRoutes',
    version: '1.0.0'
};

module.exports = routes;
