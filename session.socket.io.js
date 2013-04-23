module.exports = SessionSockets;

function SessionSockets(io, sessionStore, cookieParser, key) {
  key = key || 'connect.sid';

  var self = this;

  this.of = function(namespace) {
    return {
      on: function(event, callback) {
        return bind(self.getSession, event, callback, io.of(namespace));
      }
    };
  };

  this.on = function(event, callback) {
    return bind(self.getSession, event, callback, io.sockets);
  };

  function bind(getsession, event, callback, namespace) {
    namespace.on(event, function(socket) {
      getsession(socket, function (err, session) {
        callback(err, socket, session);
      });
    });
  }

  this.getSession = function(socket, callback) {
    cookieParser(socket.handshake, {}, function (parseErr) {
      sessionStore.load(findCookie(socket.handshake), function (storeErr, session) {
        var err = resolveErr(parseErr, storeErr, session);
        callback(err, session);
      });
    });
  };

  function findCookie(handshake) {
    if (handshake) return (handshake.secureCookies && handshake.secureCookies[key])
                       || (handshake.signedCookies && handshake.signedCookies[key])
                       || (handshake.cookies && handshake.cookies[key]);
  }

  function resolveErr(parseErr, storeErr, session) {
    var err = parseErr || storeErr || null;
    if (!err && !session) err = new Error('Could not lookup session by key: ' + key);
    return err;
  }
}
