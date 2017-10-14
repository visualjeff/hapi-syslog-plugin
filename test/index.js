'use strict';

const Code = require('code');
const Hapi = require('hapi');
const Lab = require('lab');
const Fs = require('fs');

// Declare internals
const internals = {};

// Test shortcuts
const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Hapi require https with port options', () => {

    it('schema validation passes', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions
        });

        server.register({

            register: require('../'),
            options: {}
        }, (err) => {

            expect(err).to.be.undefined();
        });
        done();
    });

    it('schema validation passes', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions
        });

        server.register({
            register: require('../'),
            options: {
                proxy: false
            }
        }, (err) => {

            expect(err).to.be.undefined();
        });
        done();
    });

    it('schema validation fails because of extra option value', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions
        });

        server.register({
            register: require('../'),
            options: {
                proxy: false,
                dumb: 'foo'
            }
        }, (err) => {

            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('ValidationError');
            expect(err.details[0].message).to.equal('"dumb" is not allowed');
        });
        done();
    });

    it('Error because http protocol was not setup', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions
        });

        server.register({
            register: require('../'),
            options: {
                proxy: false
            }
        }, (err) => {

            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('Error');
            expect(err.message).to.equal('http connection is not configured or missing from the server?');
        });
        done();
    });

    it('Error because https protocol was not setup', (done) => {

        const server = new Hapi.Server();

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
        });

        server.register({
            register: require('../'),
            options: {
                proxy: false
            }
        }, (err) => {

            expect(err).to.be.an.instanceof(Error);
            expect(err.name).to.equal('Error');
            expect(err.message).to.equal('https connection is not configured or missing from the server?');
        });
        done();
    });

    it('validate the 301 redirect', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000,
            labels: 'http'
        });

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions,
            labels: 'https'
        });

        server.register([{
            register: require('../'),
            options: {
                proxy: false
            }
        }, {
            register: require('../example/routes/applicationRoutes')
        }], (err) => {

            if (err) {
                throw err;
            }
        });
        const options = {
            method: 'GET',
            url: '/'
        };
        server.select('http').inject(options, (response) => {

            expect(response.statusCode).to.equal(301);
        });

        done();
    });


    it('Follow the 301 redirect', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000,
            labels: 'http'
        });

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions,
            labels: 'https'
        });

        server.register([{
            register: require('../'),
            options: {
                proxy: false
            }
        }, {
            register: require('../example/routes/applicationRoutes')
        }], (err) => {

            if (err) {
                throw err;
            }
        });
        const options = {
            method: 'GET',
            url: '/'
        };
        server.select('http').inject(options, (response) => {

            expect(response.statusCode).to.equal(301);
            server.select('https').inject(options, (response1) => {

                expect(response1.statusCode).to.equal(200);
                expect(response1.result).to.equal('Hello HTTPS world!');
            });
        });

        done();
    });

    it('exercise proxy headers', (done) => {

        const server = new Hapi.Server();

        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const tlsOptions = {
            passphrase: '',
            //Self signed certs for example only
            key: Fs.readFileSync('./example/certs/server.key'),
            cert: Fs.readFileSync('./example/certs/server.crt')
        };

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000,
            labels: 'http'
        });

        //Configure https
        server.connection({
            host: '0.0.0.0',
            port: 4000,
            tls: tlsOptions,
            labels: 'https'
        });

        server.register([{
            register: require('../'),
            options: {
                proxy: true //Note the default is true
            }
        }, {
            register: require('../example/routes/applicationRoutes')
        }], (err) => {

            if (err) {
                throw err;
            }
        });
        const options = {
            method: 'GET',
            url: '/',
            headers: {
                'x-forwarded-proto': 'http',
                'x-forwarded-host': 'myproxy:3000'
            }
        };
        server.select('http').inject(options, (response) => {

            expect(response.statusCode).to.equal(301);
            delete options.headers;
            server.select('https').inject(options, (response1) => {

                expect(response1.statusCode).to.equal(200);
                expect(response1.result).to.equal('Hello HTTPS world!');
            });
        });

        done();
    });
});
