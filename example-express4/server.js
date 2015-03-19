var http = require('http')
  , path = require('path')
  , express = require('express')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , expressSession = require('express-session')
  , app = express();

var myCookieParser = cookieParser('secret');
var sessionStore = new expressSession.MemoryStore();

app.set('views', path.resolve('views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(myCookieParser);
app.use(expressSession({ secret: 'secret', store: sessionStore }));

var server = http.Server(app)
  , io = require('socket.io')(server);

var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, myCookieParser);

app.get('/', function(req, res) {
  req.session.foo = req.session.foo || 'bar';
  res.render('index');
});

sessionSockets.on('connection', function (err, socket, session) {
  socket.emit('session', session);

  socket.on('foo', function(value) {
    session.foo = value;
    session.save();
    socket.emit('session', session);
  });
});

server.listen(3000);
