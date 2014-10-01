/**
 * UDP 服务器
 */
function UDPServer() {
    this.config = require('./udp_config');
    this.dgram = require('dgram');
    this.server = this.dgram.createSocket('udp4');

    return;
}

/**
 * 服务器事件监听
 */
UDPServer.prototype.onEvent = function() {
    var _this = this;
    _this.server.on('listening', function () {
        var address = _this.server.address();
        console.log('UDP Server listening on ' + address.address + ':' + address.port);
    });

    _this.server.on('message', function (message, remote) {
        console.log(message+'');
    });

    return;
}

/**
 * 启动服务器
 */
UDPServer.prototype.startUp = function(port, host) {
    this.server.bind(port, host);

    return;
}

/**
 * 执行入口
 */
UDPServer.prototype.init = function() {
    this.onEvent();
    this.startUp(this.config.port, this.config.host);

    return;
}

var server = new UDPServer();
server.init();
