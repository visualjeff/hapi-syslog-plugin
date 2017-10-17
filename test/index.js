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

    it('schema validation passes', (done) => {

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
/*
    it('schema validation passes', (done) => {

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

            expect(err).to.be.undefined();
        });
        done();
    });

    it('schema validation fails because of extra option value', (done) => {

        const server = new Hapi.Server();

        //Configure http
        server.connection({
            host: '0.0.0.0',
            port: 3000
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
*/
});
