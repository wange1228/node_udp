var config = require('./udp_config'),
    cluster = require('cluster'),
    os = require('os'),
    dgram = require('dgram');

/**
 * UDP 客户端
 */
function UDPClient() {
    // this.msgArr = [];
    return;
}

/**
 * 发送信息
 */
UDPClient.prototype.sendMsg = function(start, end, name, callback) {
    if (start !== end) {
        var _this = this,
            childPid = name,
            parentPid = process.pid,
            message = new Buffer(parentPid + ':' + childPid + ':' + start),
            client = dgram.createSocket('udp4');

        client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
            if (err) throw err;
            client.close();

            // setTimeout ? setImmediate ? process.nextTick ?
            setTimeout(function() {
                _this.sendMsg(++start, end, name, callback);
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
        reqEach = config.reqNum / cpusNum;
        // name = process.pid;

    console.time(process.pid);
    if (cluster.isMaster) {
        os.cpus().forEach(function(val, key) {
            var worker_process = cluster.fork();
            worker_process.on('message', function(msg) {
                if (msg.cmd && msg.cmd === 'notify') {
                    var start = key * reqEach,
                        end = start + reqEach,
                        name = worker_process.process.pid;
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
                // _this.msgArr = [];
                var client = dgram.createSocket('udp4'),
                    childPid = worker_process.process.pid,
                    parentPid = process.pid,
                    message = new Buffer(parentPid + ':' + childPid + ':' + '-1');
                client.send(message, 0, message.length, config.port, config.host, function(err, bytes) {
                    if (err) throw err;
                    client.close();
                    console.timeEnd(parentPid);
                });
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
