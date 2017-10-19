hapi-syslog-plugin
==================

[![Build Status](https://travis-ci.org/visualjeff/hapi-syslog-plugin.png)](https://travis-ci.org/visualjeff/hapi-syslog-plugin)
[![bitHound Overall Score](https://www.bithound.io/github/visualjeff/hapi-syslog-plugin/badges/score.svg)](https://www.bithound.io/github/visualjeff/hapi-syslog-plugin)
[![bitHound Dependencies](https://www.bithound.io/github/visualjeff/hapi-syslog-plugin/badges/dependencies.svg)](https://www.bithound.io/github/visualjeff/hapi-syslog-plugin/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/visualjeff/hapi-syslog-plugin/badges/code.svg)](https://www.bithound.io/github/visualjeff/hapi-syslog-plugin)

> Hapi plugin for routing logging statements from [Hapi's built in logging system](https://hapijs.com/tutorials/logging?lang=en_US) to syslog.


## Usage

Just [load the plugin](http://hapijs.com/tutorials/plugins#loading-a-plugin) and go!

```js
server.register({
  register: require('hapi-syslog-plugin'),
  options: {
  }
})
```

To enable your linux system (debian or ubuntu) to receive TCP or UPD message edit /etc/rsyslog.conf

```
    sudo nano /etc/rsyslog.conf


    # provides UDP syslog reception
    #module(load="imudp")            <== uncomment for UDP
    #input(type="imudp" port="514")  <== uncomment for UDP

    # provides TCP syslog reception
    #module(load="imtcp")            <== uncomment for TCP
    #input(type="imtcp" port="514")  <== uncomment for TCP

```

Save changes (control-x). Now restart the rsyslog service:

```
    sudo service rsyslog restart
```

To view the syslog at runtime:

```
    sudo tail -f /var/log/syslog
```

Additionally... See examples directory for sample usage.

## API

#### `plugin.register(server, [options], next)`

Registers the plugin to run `onRequest` in the [request lifecycle](http://hapijs.com/api#request-lifecycle). 

##### options

Type: `object`  
Default: `{}`

Valid overrides include: 

  target: Defaults to 127.0.0.1
  syslogHostname: Defaults to OS hostname
  transport: Defaults to 2 which is Udp
  port: Defaults to 514
  tcpTimeout: Defaults to 10000
  rfc3164: Defaults to false
  appName: Defaults Node's process.title
  dateFormatter: Function defaults to date.toISOString()
  facility: Defaults to local0 or 16
  severity: Defaults to 6 or Informational

```
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

## License

MIT © [visualjeff](http://github.com/visualjeff)
