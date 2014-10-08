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
UDPClient.prototype.sendMsg = function(index, limit, name, callback) {
    if (index !== limit) {
        var _this = this,
            message = new Buffer(name + ': ' + index),
            client = dgram.createSocket('udp4');

        client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
            if (err) throw err;
            client.close();

            setTimeout(function() {
                _this.sendMsg(++index, limit, name, callback);
            }, 0);
        });
    } else {
        callback();
    }

    return;
}

/**
 * 执行入口
 */
UDPClient.prototype.init = function() {
    var _this = this,
        cpusNum = os.cpus().length,
        reqEach = config.reqNum / cpusNum,
        name = 'pid ' + process.pid;

    console.time(name);
    if (cluster.isMaster) {
        os.cpus().forEach(function(val, key) {
            var worker_process = cluster.fork();
            worker_process.on('message', function(msg) {
                if (msg.cmd && msg.cmd === 'notify') {
                    var start = key * reqEach,
                        limit = start + reqEach;
                    _this.sendMsg(start, limit, name, function() {
                        worker_process.disconnect();
                        console.timeEnd(name);
                    });
                }
            });

            worker_process.on('error', function(err) {
                console.log(err);
                throw err;
            });

            /**
            worker_process.on('disconnect', function() {
                throw 'disconnect';
            });
            **/
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
new UDPClient().init();
