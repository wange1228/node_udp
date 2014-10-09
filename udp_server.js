var config = require('./udp_config'),
    fs = require('fs'),
    cluster = require('cluster'),
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
        var msgStr = message + '',
            msgArr = msgStr.split(':'),
            parentPid = msgArr[0],
            childPid = msgArr[1],
            num = msgArr[2],
            filename = parentPid+'_'+childPid+'.txt';

        if (num !== '-1') {
            fs.appendFile(filename, num+'\n', function(err) {
                if (err) throw err;
                console.log('pid: '+childPid+'\t'+'num: '+num);
            });
        } else {
            var source = fs.createReadStream(filename),
                target = fs.createWriteStream('pid_'+parentPid+'.txt', {flags: 'a'});
            source.pipe(target);
            source.on('end', function() {
                fs.unlink(filename);
            });
        }
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
    if (cluster.isMaster) {
        cluster.fork();
    } else if (cluster.isWorker) {
        this.onEvent();
        this.startUp(config.port, config.host);
    }

    return;
}

/**
 * 实例化
 */
new UDPServer().init();
