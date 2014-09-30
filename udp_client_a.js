var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var cluster = require('cluster');
var os = require('os');
var s = new Date().getTime();

if (cluster.isMaster){
    for (var i = 0, n = os.cpus().length; i < n; i += 1){
        cluster.fork();
    }
} else {
    sendMsg(0);
}

function sendMsg(i) {
    var message = new Buffer(i+'');
    var fn = arguments.callee;

    if (i !== 100000) {
        var client = dgram.createSocket('udp4');
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + HOST +':'+ PORT);
            client.close();
            fn(++i);
        });
    } else {
        var d = new Date().getTime();
        console.log(d - s);
    }
}
