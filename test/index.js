'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Plugin = require('../');
const Net = require('net');
const ApplicationRoutes = require('../example/routes/applicationRoutes');

// Declare internals
const internals = {};

// Test shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Hapi logging to syslog', () => {

    it('Default configurations passed schema validation', (done) => {
        const server = new Hapi.Server();
        const receiver = Net.createServer((client) => {
            client.on('data', (data) => {
                const message = data.toString();
                expect(message.search('test')).to.not.equal(-1);
                expect(message.search('Server listening at')).to.not.equal(-1);
                receiver.close();
		receiver.unref();
		server.stop();
                done();
            });
        });
        receiver.on('error', (err) => {
            throw err;
        });
        receiver.listen('/tmp/echo.sock');

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 1,
                port: '/tmp/echo.sock',
                tcpTimeout: 5000,
                rfc3164: false,
                appName: 'test',
                dateFormatter: (date) => date.toISOString(),
                facility: 23,
                severity: 7
            }
        }, (err) => {
            expect(err).to.be.undefined();
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
    });

    it('Default configurations passed schema validation', (done) => {
        const server = new Hapi.Server();
        const receiver = Net.createServer((client) => {
            client.on('data', (data) => {
                const message = data.toString();
                expect(message.search('test')).to.equal(-1);
                expect(message.search('Server listening at')).to.not.equal(-1);
		receiver.close();
                receiver.unref();
		server.stop();
                done();
            });
        });
        receiver.on('error', (err) => {
            throw err;
        });
        receiver.listen('/tmp/echo.sock');

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 1,
                port: '/tmp/echo.sock',
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (date) => date.toISOString(),
                facility: 23,
                severity: 7
            }
        }, (err) => {
            expect(err).to.be.undefined();
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
    });
    
    it('Default configurations passed schema validation', (done) => {
	const server = new Hapi.Server();
        const receiver = Net.createServer((client) => {
            client.on('data', (data) => {
                const message = data.toString();
                expect(message.search('2017-10-19T18:01:07.499Z')).to.not.equal(-1);
                expect(message.search('Server listening at')).to.not.equal(-1);
                receiver.close();
		receiver.unref();
		server.stop();
                done();
            });
        });
        receiver.on('error', (err) => {
            throw err;
        });
        receiver.listen('/tmp/echo.sock');

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 1,
                port: '/tmp/echo.sock',
                tcpTimeout: 5000,
                rfc3164: false,
                appName: 'test',
                dateFormatter: (date) => '2017-10-19T18:01:07.499Z',
                facility: 23,
                severity: 7
            }
        }, (err) => {
            expect(err).to.be.undefined();
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
    });

    it('Default configurations passed schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {}
        }, (err) => {
            expect(err).to.be.undefined();
        });
        done();
    });

    it('Custom parameters pass schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 1,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.undefined();
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 99,
                syslogHostname: 'localhost',
                transport: 1,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"target" must be a string');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'not a valid hostname',
                syslogHostname: 'localhost',
                transport: 1,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"target" must be a valid hostname');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 98,
                transport: 1,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"syslogHostname" must be a string');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'not a valid hostname',
                transport: 1,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"syslogHostname" must be a valid hostname');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 'abc',
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"transport" must be a number');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 1.2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"transport" must be an integer');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 9,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"transport" must be less than or equal to 2');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 'abc',
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"tcpTimeout" must be a number');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 1.2,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"tcpTimeout" must be an integer');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: 'astring',
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"rfc3164" must be a boolean');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: 123,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"rfc3164" must be a boolean');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 123,
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"appName" must be a string');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: true,
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"appName" must be a string');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: '(d) => date.toISOString()',
                facility: 23,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"dateFormatter" must be a Function');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 'info',
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"facility" must be a number');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 1.2,
                severity: 6
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"facility" must be an integer');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 'error'
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"severity" must be a number');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 2,
                port: 514,
                tcpTimeout: 5000,
                rfc3164: true,
                appName: 'test',
                dateFormatter: (d) => date.toISOString(),
                facility: 23,
                severity: 6.2
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"severity" must be an integer');
        });
        done();
    });

    it('schema validation fails because of extra unexpected option value', (done) => {
        const server = new Hapi.Server();

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                dumb: 'foo'
            }
        }, (err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"dumb" is not allowed');
        });
        done();
    });
    
    it('Default configurations passed schema validation', (done) => {
        const server = new Hapi.Server();
        const receiver = Net.createServer((client) => {
            client.on('data', (data) => {
                const message = data.toString();
		expect(message.search('A request has been invoked!')).to.not.equal(-1);
		receiver.close();
		receiver.unref();
		server.stop();
                done();
            });
        });
        receiver.on('error', (err) => {
            throw err;
        });
        receiver.listen('/tmp/echo.sock');

        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register([{
            register: Plugin,
            options: {
                target: 'localhost',
                syslogHostname: 'localhost',
                transport: 1,
                port: '/tmp/echo.sock',
                tcpTimeout: 5000,
                rfc3164: false,
                appName: 'test',
                dateFormatter: (date) => date.toISOString(),
                facility: 23,
                severity: 7
            }
        }, {
            register: ApplicationRoutes
	}], (err) => {
            expect(err).to.be.undefined();
        });

        server.start((err) => {
            if (err) {
                expect(err).to.be.undefined();
            }
        });

        const options = {
            method: 'GET',
            url: '/'
        };
        server.inject(options, (response) => {
            expect(response.statusCode).to.equal(200);
	    expect(response.result).to.equal('Hello world!');
        });
    });

});
