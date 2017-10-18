'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Plugin = require('../');

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

        //Configure http
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Tcp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 99,
		syslogHostname: 'localhost',
		transport: 'Tcp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'not a valid hostname',
		syslogHostname: 'localhost',
		transport: 'Tcp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 98,
		transport: 'Tcp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'not a valid hostname',
		transport: 'Tcp',
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

        //Configure http
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
            expect(err.details[0].message).to.equal('"transport" must be a string');
        });
        done();
    });
    
    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
		port: 'abc',
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
            expect(err.details[0].message).to.equal('"port" must be a number');
        });
        done();
    });
    
    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
		port: 1.2,
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
            expect(err.details[0].message).to.equal('"port" must be an integer');
        });
        done();
    });

    it('Custom parameters fail schema validation', (done) => {
        const server = new Hapi.Server();

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: Plugin,
            options: {
                target: 'localhost',
		syslogHostname: 'localhost',
		transport: 'Udp',
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

        //Configure http
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

});
