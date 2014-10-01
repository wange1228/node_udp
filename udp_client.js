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
UDPClient.prototype.sendMsg = function(index, limit) {
    var _this = this,
        message = new Buffer(index+'');

    if (index !== limit) {
        var client = _this.dgram.createSocket('udp4');
        // console.log(client);return;
        client.send(message, 0, message.length, _this.config.port, _this.config.host, function(err, bytes) {
            if (err) throw err;
            client.close();

            _this.sendMsg(++index, limit);
        });
    } else {
        console.timeEnd('udp');
    }

    return;
}

/**
 * 执行入口
 */
UDPClient.prototype.init = function() {
    console.time('udp');
    this.sendMsg(0, 1000);

    return;
}

var client = new UDPClient();
client.init();
