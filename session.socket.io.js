module.exports = SessionSockets;

function SessionSockets(io, sessionStore, cookieParser, key) {
  key = typeof key === 'undefined' ? 'connect.sid' : key;
  var sessionSockets = this;
  this.io = io;

  this.on = function(event, callback) {
    return bind(event, callback, io.sockets);
  };

  this.of = function(namespace) {
    return {
      on: function(event, callback) {
        return bind(event, callback, io.of(namespace));
      }
    };
  };

  this.getSession = function(socket, callback) {
    cookieParser(socket.handshake, {}, function (parseErr) {
      var sessionLookupMethod = sessionStore.load || sessionStore.get;
      sessionLookupMethod.call(sessionStore, findCookie(socket.handshake), function (storeErr, session) {
        var err = resolveErr(parseErr, storeErr, session);
        callback(err, session, socket);
      });
    });
  };

  function bind(event, callback, namespace) {
    namespace.on(event, function (socket) {
      sessionSockets.getSession(socket, function (err, session) {
        callback(err, socket, session);
      });
    });
  }

  function findCookie(handshake) {
    if (handshake)
      return (handshake.secureCookies && handshake.secureCookies[key]) ||
             (handshake.signedCookies && handshake.signedCookies[key]) ||
             (handshake.cookies && handshake.cookies[key]);
  }

  function resolveErr(parseErr, storeErr, session) {
    var err = parseErr || storeErr || null;
    if (!err && !session) err = new Error('Could not lookup session by key: ' + key);
    return err;
  }
}
