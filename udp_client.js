/**
 * UDP 客户端
 */
function UDPClient() {
    this.config = require('./udp_config');
    this.dgram = require('dgram');

    return;
}

/**
 * 发送信息
 */
UDPClient.prototype.sendMsg = function(index, limit, name) {
    var _this = this,
        message = new Buffer(index+' from '+name);

    if (index !== limit) {
        var client = _this.dgram.createSocket('udp4');
        client.send(message, 0, message.length, _this.config.port, _this.config.host, function(err, bytes) {
            // if (err) throw err;
            client.close();

            _this.sendMsg(++index, limit, name);
        });
    } else {
        console.timeEnd('udp');
    }

    return;
}

/**
 * 执行入口
 */
UDPClient.prototype.init = function(name) {
    // console.log(name);
    console.time('udp');
    this.sendMsg(0, 1000, name);

    return;
}

/**
 * 实例化
 */
var clientA = new UDPClient(),
    clientB = new UDPClient();

clientA.init('UDP Client A');
clientB.init('UDP Client B');
