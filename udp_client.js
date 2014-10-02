var config = require('./udp_config'),
    cluster = require('cluster'),
    os = require('os'),
    dgram = require('dgram');

/**
 * UDP 客户端
 */
function UDPClient() {
    return;
}

/**
 * 发送信息
 */
UDPClient.prototype.sendMsg = function(index, limit, name) {
    var _this = this,
        message = new Buffer(index+' from '+name);

    if (index !== limit) {
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
            // if (err) throw err;
            client.close();

            _this.sendMsg(++index, limit, name);
        });
    } else {
        console.timeEnd(name);
    }

    return;
}

/**
 * 执行入口
 */
UDPClient.prototype.init = function(name) {
    var _this = this,
        cpusNum = os.cpus().length,
        reqEach = config.reqNum / cpusNum;

    // _this.sendMsg(0, config.reqNum, name); return;
    console.time(name);
    if (cluster.isMaster) {
        os.cpus().forEach(function(val, key) {
            var worker_process = cluster.fork();
            worker_process.on('message', function(msg) {
                if (msg.cmd && msg.cmd === 'notify') {
                    var start = key * reqEach,
                        limit = start + reqEach;
                    _this.sendMsg(start, limit, name);
                }
            });
        });
    } else if (cluster.isWorker) {
        process.send({
            cmd: 'notify'
        });
    }

    return;
}

/**
 * 实例化
 */
var client = new UDPClient();
client.init('UDPClient');
