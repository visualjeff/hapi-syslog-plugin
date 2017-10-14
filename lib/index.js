'use strict';

const dgram = require("dgram");
const EventEmitter = require("events");
const net = require("net");
const os = require("os");
const util = require("util");

const Joi = require('joi');

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
    syslogHostname: Joi.string().default(os.hostname()),
    transport: Joi.string().default(Transport.Udp),
    port: Joi.string().default(514),
    tcpTimeout: Joi.number().default(10000),
    rfc3164: Joi.boolean().default(false),
    appName: Joi.string().default(process.title.substring(process.title.lastIndexOf("/") + 1, 48)),
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
            constructor(options) {
                super();
                this.getTransportRequests = [];
                this.options = options;
            }

            buildFormattedMessage(message, options, timestamp) {
                const date = (typeof this.timestamp === 'undefined') ? new Date() : this.timestamp;
                const pri = (options.facility * 8) + options.severity;
                const newline = message[message.length - 1] === os.EOL ? "" : os.EOL;
                let formattedMessage;
                if (typeof options.rfc3164 !== 'boolean' || options.rfc3164) {
                    // RFC 3164 uses an obsolete date/time format and header.
                    const elems = date.toString().split(/\s+/);
                    let month = elems[1];
                    let day = elems[2];
                    let time = elems[4];
                    // BSD syslog requires leading 0's to be a space.
                    if (day[0] === "0") {
                        day = ` ${day.substr(1, 1)}`;
                    }
                    timestamp = `${month} ${day} ${time}`;
                    formattedMessage = `<${pri}>${timestamp} ${options.syslogHostname} ${message}${newline}`;
                } else {
                    // RFC 5424 obsoletes RFC 3164 and requires RFC 3339 (ISO 8601) timestamps and slightly different header.
                    const msgid = (typeof options.msgid === 'undefined') ? '-' : options.msgid;
                    formattedMessage = `<${pri}>1 ${options.dateFormatter.call(this, date)} ${options.syslogHostname} ${options.appName} ${process.pid} ${msgid} - ${message}${newline}`;
                }
                return new Buffer(formattedMessage);
            };

            close() {
                if (this.transport_) {
                    if (this.transport === Transport.Tcp)
                        this.transport_.destroy();
                    if (this.transport === Transport.Udp)
                        this.transport_.close();
                    delete this.transport_;
                } else {
                    this.onClose();
                }
                return this;
            };

            log(payload) {
		const message = payload.data;
                const timestamp = new Date(payload.timestamp);
                const options = Object.assign({}, this.options);
                const cb = function(error) {
                    if (error) {
                        console.log(error);
                    }
                };

                let fm = this.buildFormattedMessage(message, options, timestamp);
                this.getTransport((error, transport) => {
                    if (error) {
                        return cb(error);
                    }
                    try {
                        if (options.transport === Transport.Tcp) {
                            transport.write(fm, (error) => {
                                if (error) {
                                    return cb(new Error(`net.write() failed: ${error.message}`));
                                }
                                return cb();
                            });
                        } else if (options.transport === Transport.Udp) {
                            transport.send(fm, 0, fm.length, options.port, options.target, (error, bytes) => {
                                if (error) {
                                    return cb(new Error(`dgram.send() failed: ${error.message}`));
                                }
                                return cb();
                            });
                        } else {
                            return cb(new Error(`unknown transport ${options.transport} specified to Client`));
                        }
                    } catch (err) {
                        onError(err);
                        return cb(err);
                    }
                });
                return this;
            };

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

                let af = net.isIPv6(this.target) ? 6 : 4;

                const doCb = (error, transport) => {
                    while (this.getTransportRequests.length > 0) {
                        let nextCb = this.getTransportRequests.shift();
                        nextCb(error, transport);
                    }
                    this.connecting = false;
                };

                if (this.options.transport === Transport.Tcp) {
                    let options = {
                        host: target,
                        port: port,
                        family: af
                    };

                    let transport;
                    try {
                        transport = net.createConnection(options, () => {
                            let transport_ = transport;
                            doCb(null, transport_);
                        });
                    } catch (err) {
                        doCb(err);
                        onError(err);
                    }

                    if (!transport) {
                        return;
                    }

                    transport.setTieout(this.tcpTimeout, () => {
                        let err = new Error("connection timed out");
                        emit("error", err);
                        doCb(err);
                    });

                    transport.on("end", () => {
                        let err = new Error("connection closed");
                        emit("error", err);
                        doCb(err);
                    });

                    transport.on("close", onClose.bind(this));
                    transport.on("error", (err) => {
                        doCb(err);
                        me.onError(err);
                    });

                    transport.unref();
                } else if (this.options.transport === Transport.Udp) {
                    let transport_;
                    try {
                        transport_ = dgram.createSocket(`udp${af}`);
                    } catch (err) {
                        doCb(err);
                        this.onError(err);
                    }

                    if (!transport_) {
                        return;
                    }

                    transport_.on("close", this.onClose.bind(this));
                    transport_.on("error", (err) => {
                        onError(err);
                        doCb(err);
                    });

                    transport_.unref();

                    doCb(null, transport_);
                } else {
                    doCb(new Error(`unknown transport ${this.options.transport} specified to Client`));
                }
            };

            onClose() {
                if (this.transport_) {
                    delete this.transport_;
                }
                this.emit('close');
                return this;
            };

            onError(error) {
                if (this.transport_) {
                    delete this.transport_;
                }
                this.emit("error", error);
                return this;
            };
        }

	//Create an instance of our client
        internals.syslogClient = new Client(validateOptions.value);

	//handle logging from requests
        server.on('request', (request, event, tags) => {
            internals.syslogClient.log(event);
        });

	//handle logging from the server
        server.on('log', (payload) => {
            internals.syslogClient.log(payload);
        });

        next();
    }
};

hapiSyslogPlugin.register.attributes = {
    pkg: require('../package.json')
};

module.exports = hapiSyslogPlugin;

