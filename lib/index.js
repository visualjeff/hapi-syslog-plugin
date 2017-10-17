'use strict';

const Dgram = require('dgram');
const EventEmitter = require('events');
const Net = require('net');
const Os = require('os');

const Joi = require('joi');

const Package = require('../package.json');

const Transport = {
    Tcp: 1,
    Udp: 2
};

const Facility = {
    Kernel: 0,
    User: 1,
    System: 3,
    Audit: 13,
    Alert: 14,
    Local0: 16,
    Local1: 17,
    Local2: 18,
    Local3: 19,
    Local4: 20,
    Local5: 21,
    Local6: 22,
    Local7: 23
};

const Severity = {
    Emergency: 0,
    Alert: 1,
    Critical: 2,
    Error: 3,
    Warning: 4,
    Notice: 5,
    Informational: 6,
    Debug: 7
};

const internals = {};

// JOI Schema for validation and default values
internals.schema = Joi.object().keys({
    target: Joi.string().default('127.0.0.1'),
    syslogHostname: Joi.string().default(Os.hostname()),
    transport: Joi.string().default(Transport.Udp),
    port: Joi.string().default(514),
    tcpTimeout: Joi.number().default(10000),
    rfc3164: Joi.boolean().default(false),
    appName: Joi.string().default(process.title.substring(process.title.lastIndexOf('/') + 1, 48)),
    dateFormatter: Joi.func().default((date) => {
        return date.toISOString();
    }),
    facility: Joi.number().default(Facility.Local0),
    severity: Joi.number().default(Severity.Informational)
});


const hapiSyslogPlugin = {
    register: (server, options, next) => {
        // Validate options agains the JOI schema above
        const validateOptions = internals.schema.validate(options);
        if (validateOptions.error) {
            return next(validateOptions.error);
        }

        class Client extends EventEmitter {
            constructor(opts) {
                super();
                this.getTransportRequests = [];
                this.options = opts;
            }

            buildFormattedMessage(message, opts, date) {
                const pri = (opts.facility * 8) + opts.severity;
                let formattedMessage;
                if (opts.rfc3164) {
                    // RFC 3164 uses an obsolete date/time format and header.
                    const elems = date.toString().split(/\s+/);
                    const month = elems[1];
                    let day = elems[2];
                    const time = elems[4];
                    // BSD syslog requires leading 0's to be a space.
                    if (day[0] === '0') {
                        day = ` ${day.substr(1, 1)}`;
                    }
                    formattedMessage = `<${pri}>${month} ${day} ${time} ${opts.syslogHostname} ${message}`;
                } else {
                    // RFC 5424 obsoletes RFC 3164 and requires RFC 3339 (ISO 8601) timestamps and slightly different header.
                    formattedMessage = `<${pri}>1 ${opts.dateFormatter.call(this, date)} ${opts.syslogHostname} ${opts.appName} ${process.pid} - ${message}`;
                }
                return new Buffer(formattedMessage);
            }

            close() {
                if (transport_) {
                    if (transport === Transport.Tcp) {
                        transport_.destroy();
                    }
                    if (transport === Transport.Udp) {
                        transport_.close();
                    }
                    delete this.transport_;
                } else {
                    onClose();
                }
                return this;
            }

            log(payload) {
                const message = payload.data;
                const timestamp = new Date(payload.timestamp);
                const options = Object.assign({}, this.options);
                const cb = function(error) {
                    if (error) {
                        console.log(error);
                    }
                };

                const fm = this.buildFormattedMessage(message, options, timestamp);
                this.getTransport((error, transport) => {
                    if (error) {
                        return cb(error);
                    }
                    try {
                        if (options.transport === Transport.Tcp) {
                            transport.write(`${fm}${Os.EOL}`, (error) => {
                                if (error) {
                                    return cb(new Error(`Net.write() failed: ${error.message}`));
                                }
                                return cb();
                            });
                        } else if (options.transport === Transport.Udp) {
                            transport.send(fm, 0, fm.length, options.port, options.target, (error, bytes) => {
                                if (error) {
                                    return cb(new Error(`Dgram.send() failed: ${error.message}`));
                                }
                                return cb();
                            });
                        } else {
                            return cb(new Error(`unknown transport ${options.transport} specified to Client`));
                        }
                    } catch (err) {
                        this.onError(err);
                        return cb(err);
                    }
                });
                return this;
            }

            getTransport(cb) {
                if (this.transport_ !== undefined) {
                    return cb(null, this.transport_);
                }

                this.getTransportRequests.push(cb);

                if (this.connecting) {
                    return this;
                } else {
                    this.connecting = true;
                }

                let af = Net.isIPv6(this.target) ? 6 : 4;

                const doCb = (error, transport) => {
                    while (this.getTransportRequests.length > 0) {
                        let nextCb = this.getTransportRequests.shift();
                        nextCb(error, transport);
                    }
                    this.connecting = false;
                };

                if (this.options.transport === Transport.Tcp) {
                    let opts = {
                        host: this.options.target,
                        port: this.options.port,
                        family: af
                    };
                    let transport;
                    try {
                        transport = Net.createConnection(opts, () => {
                            this.transport_ = transport;
                            doCb(null, this.transport_);
                        });
                    } catch (err) {
                        doCb(err);
                        this.onError(err);
                    }

                    if (!transport) {
                        return;
                    }

                    transport.setTimeout(this.options.tcpTimeout, () => {
                        const err = new Error('connection timed out');
                        this.emit('error', err);
                        doCb(err);
                    });

                    transport.on('end', () => {
                        const err = new Error('connection closed');
                        this.emit('error', err);
                        doCb(err);
                    });

                    transport.on('close', this.onClose.bind(this));
                    transport.on('error', (err) => {
                        doCb(err);
                        this.onError(err);
                    });

                    transport.unref();
                } else if (this.options.transport === Transport.Udp) {
                    try {
                        this.transport_ = Dgram.createSocket(`udp${af}`);
                    } catch (err) {
                        doCb(err);
                        this.onError(err);
                    }

                    if (!this.transport_) {
                        return;
                    }

                    this.transport_.on('close', this.onClose.bind(this));
                    this.transport_.on('error', (err) => {
                        this.onError(err);
                        doCb(err);
                    });

                    this.transport_.unref();

                    doCb(null, this.transport_);
                } else {
                    doCb(new Error(`unknown transport ${this.options.transport} specified to Client`));
                }
            }

            onClose() {
                if (this.transport_) {
                    delete this.transport_;
                }
                this.emit('close');
                return this;
            }

            onError(error) {
                if (this.transport_) {
                    delete this.transport_;
                }
                this.emit('error', error);
                return this;
            }
        }

        //Create an instance of our client
        internals.syslogClient = new Client(validateOptions.value);

        //handle logging from requests
        server.on('request', (request, event, tags) => {
            internals.syslogClient.log(event);
        });

        //handle logging from the server
        server.on('log', (payload, event, s) => {
            internals.syslogClient.log(payload);
        });

        next();
    }
};

hapiSyslogPlugin.register.attributes = {
    pkg: Package
};

module.exports = hapiSyslogPlugin;
