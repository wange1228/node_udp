var config = require('./udp_config'),
    fs = require('fs'),
    dgram = require('dgram'),
    udp4 = dgram.createSocket('udp4');

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
    udp4.on('listening', function () {
        var address = udp4.address();
        console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });

    udp4.on('message', function (message, remote) {
        fs.appendFile(config.log, message+'\n', function(err) {
            if (err) throw err;
            console.log(message+'');
        });
    });

    return;
}

/**
 * 启动服务器
 */
UDPServer.prototype.startUp = function(port, host) {
    var _this = this;
    fs.unlink(config.log, function() {
        udp4.bind(port, host);
    });

    return;
}

/**
 * 执行入口
 */
UDPServer.prototype.init = function() {
    this.onEvent();
    this.startUp(config.port, config.host);

    return;
}

/**
 * 实例化
 */
var server = new UDPServer();
server.init();
