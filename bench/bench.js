var count = 1e7;

var SessionSocket = require('../session.socket.io');
var EventEmitter = require('events').EventEmitter;

// stubs
var io = { sockets: new EventEmitter() };
var sessionStore = {
  load: function(cookie, fn) {
    fn(undefined, {test: 'hi'})
  }
}
var cookieParser = function(handshake, idk, fn) {
  fn();
}
var stubsocket = {
  handshake: {
    secureCookies: '123'
  }
}
//
var s = new SessionSocket(io, sessionStore, cookieParser, 'key');
var type, startTime, d = 0;

function run() {
  startTime = process.hrtime();
  for (var i = 0; i < count; i++) {
    io.sockets.emit('connection', stubsocket);
  }
}

function done() {
  var elapsed = process.hrtime(startTime);
  var time = elapsed[0] + elapsed[1] / 1e9;
  var opcount = count / time;
  console.log('op/s: ', Math.round(opcount), ' | time: ', time);
}

if (process.argv[2] === 'session') {
  type = s;
} else {
  type = io.sockets; 
}

type.on('connection', function() {
  d++;
  if (d === count) done();
})

run();