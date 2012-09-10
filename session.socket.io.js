module.exports = function(io, sessionStore, cookieParser, key) {
  key = key || 'connect.sid';

  this.on = function(event, callback) {
    io.sockets.on(event, function (socket) {
      cookieParser(socket.handshake, {}, function (parseErr) {
        sessionStore.get(findCookie(socket.handshake), function (storeErr, session) {
          callback(parseErr || storeErr, socket, session);
        });
      });
    });
  };

  function findCookie(handshake) {
    return (handshake.secureCookies && handshake.secureCookies[key])
        || (handshake.signedCookies && handshake.signedCookies[key])
        || (handshake.cookies && handshake.cookies[key]);
  }
};
