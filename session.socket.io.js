module.exports = SessionSockets;

function SessionSockets(io, sessionStore, cookieParser, key) {
  key = key || 'connect.sid';

  this.of = function(namespace) {
    return {
      on: function(event, callback) {
        return bind.call(this, event, callback, io.of(namespace));
      }.bind(this)
    };
  };

  this.on = function(event, callback) {
    return bind.call(this, event, callback, io.sockets);
  };

  function bind(event, callback, namespace) {
    namespace.on(event, function (socket) {
      this.getSession(socket, function (err, session) {
        callback(err, socket, session);
      });
    }.bind(this));
  }

  this.getSession = function(socket, callback) {
    cookieParser(socket.handshake, {}, function (parseErr) {
      sessionStore.load(findCookie(socket.handshake), function (storeErr, session) {
        var err = resolve(parseErr, storeErr, session);
        callback(err, session);
      });
    });
  };

  function findCookie(handshake) {
    if (handshake) return (handshake.secureCookies && handshake.secureCookies[key])
                       || (handshake.signedCookies && handshake.signedCookies[key])
                       || (handshake.cookies && handshake.cookies[key]);
  }

  function resolve(parseErr, storeErr, session) {
    if (parseErr) return parseErr;
    if (storeErr) return storeErr;
    if (!session) return new Error('Could not lookup session by key: ' + key);
    return null;
  }
}
