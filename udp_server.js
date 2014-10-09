var config = require('./udp_config'),
    fs = require('fs'),
    cluster = require('cluster'),
    os = require('os'),
    dgram = require('dgram'),
    server = dgram.createSocket('udp4');

/**
 * UDP 服务器
 */
function UDPServer() {
    return;
}

/**
 * 服务器事件监听
 */
UDPServer.prototype.onEvent = function() {
    var _this = this;
    server.on('listening', function () {
        var address = server.address();
        console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });

    server.on('message', function (message, remote) {
        var client = dgram.createSocket('udp4'),
            msg = new Buffer(message);

        client.send(msg, 0, msg.length, config.terminalPort, config.terminalHost, function(err, bytes) {
            if (err) throw err;
            client.close();
        });
    });

    server.on('error', function(err) {
        console.log(err);
        throw err;
    });

    return;
}

/**
 * 启动服务器
 */
UDPServer.prototype.startUp = function(port, host) {
    var _this = this;
    // fs.unlink(config.log, function() {
    server.bind(port, host);
    // });

    return;
}

/**
 * 执行入口
 */
UDPServer.prototype.init = function() {
    var _this = this;
    if (cluster.isMaster) {
        os.cpus().forEach(function(val, key) {
            cluster.fork();
        });
    } else if (cluster.isWorker) {
        _this.startUp(config.serverPort, config.serverHost);
        _this.onEvent();
    }

    return;
}

/**
 * 实例化
 */
new UDPServer().init();
