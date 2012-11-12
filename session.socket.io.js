module.exports = function (io, sessionStore, cookieParser, key) {
    key = key || 'connect.sid';

    function enhance_event(listener, event, callback) {
        listener.on(event, function (socket) {
            cookieParser(socket.handshake, {}, function (parseErr) {
                sessionStore.load(findCookie(socket.handshake), function (storeErr, session) {
                    var err = resolve(parseErr, storeErr, session);
                    callback(err, socket, session);
                });
            });
        });
    }

    this.on = function (event, callback) {
        enhance_event(io.sockets);
    };

    this.of = function(namespace){
        var channel = io.of(namespace);
        var wrapper = Object.create(channel);
        wrapper.on = function(event, callback){
            enhance_event(channel, event, callback);
        };
        return wrapper;
    };

    function findCookie(handshake) {
        return (handshake.secureCookies && handshake.secureCookies[key])
            || (handshake.signedCookies && handshake.signedCookies[key])
            || (handshake.cookies && handshake.cookies[key]);
    }

    function resolve(parseErr, storeErr, session) {
        if (parseErr) return parseErr;
        if (!storeErr && !session) return { error:'could not look up session by key: ' + key };
        return storeErr;
    }
};