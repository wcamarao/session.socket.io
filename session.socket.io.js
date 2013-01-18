module.exports = function(io, sessionStore, cookieParser, key) {
  key = key || 'connect.sid';

  this.of = function(namespace) {
    return {
      on: function(event, callback) {
        return bind(event, callback, io.of(namespace));
      }
    };
  };

  this.on = function(event, callback) {
    return bind(event, callback, io.sockets);
  };

  function bind(event, callback, namespace) {
    namespace.on(event, function (socket) {
      cookieParser(socket.handshake, {}, function (parseErr) {
        sessionStore.load(findCookie(socket.handshake), function (storeErr, session) {
          var err = resolve(parseErr, storeErr, session);
          callback(err, socket, session);
        });
      });
    });
  }

  function findCookie(handshake) {
    return (handshake.secureCookies && handshake.secureCookies[key])
        || (handshake.signedCookies && handshake.signedCookies[key])
        || (handshake.cookies && handshake.cookies[key]);
  }

  function resolve(parseErr, storeErr, session) {
    if (parseErr) return parseErr;
    if (!storeErr && !session) return new Error ('could not look up session by key: ' + key);
    return storeErr;
  }
};
