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
UDPClient.prototype.sendMsg = function(start, end, name, callback) {
    if (start !== end) {
        var _this = this,
            message = new Buffer(name + ': ' + start),
            client = dgram.createSocket('udp4');

        client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
            if (err) throw err;
            client.close();

            // TODO
            // setTimeout ? setImmediate ? process.nextTick ?
            setTimeout(function() {
                _this.sendMsg(++start, end, name, callback);
            }, 0);
        });
    } else {
        callback();
    }

    /**
    if (start !== end) {
        var _this = this;
        _this.msgArr.push(name + ': ' + start);
        setImmediate(function() {
            _this.sendMsg(++start, end, name, callback);
        });

    } else {
        callback();
    }
    **/

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
                        end = start + reqEach;
                    _this.sendMsg(start, end, name, function() {
                        worker_process.disconnect();
                    });
                }
            });

            worker_process.on('error', function(err) {
                console.log(err);
                throw err;
            });

            worker_process.on('disconnect', function() {
                console.timeEnd(name);
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
new UDPClient().init();
