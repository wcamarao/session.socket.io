module.exports = function(io, sessionStore, cookieParser, key) {
  key = key || 'connect.sid';

  this.on = function(event, callback) {
    io.sockets.on(event, function (socket) {
      cookieParser(socket.handshake, {}, function (parseErr) {
        sessionStore.get(findCookie(socket.handshake), function (storeErr, session) {
          var err = resolve(parseErr, storeErr, session);
          callback(err, socket, session);
        });
      });
    });
  };

  function findCookie(handshake) {
    return (handshake.secureCookies && handshake.secureCookies[key])
        || (handshake.signedCookies && handshake.signedCookies[key])
        || (handshake.cookies && handshake.cookies[key]);
  }

  function resolve(parseErr, storeErr, session) {
    if (parseErr) return parseErr;
    if (!storeErr && !session) return { error: 'could not look up session by key: '+key };
    return storeErr;
  }
};
