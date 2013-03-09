var path = require('path')
  , expect = require('expect.js')
  , SessionSockets = require(path.resolve('session.socket.io'))
  , jonnySocket = stub({ foo: 'bar' });

describe('SessionSockets', function () {
  this.timeout(1);

  beforeEach(function () {
    this.sessionSockets = new SessionSockets(io(), sessionStore(), cookieParser);
  });

  it('gets the corresponding session for a given socket client', function (done) {
    this.sessionSockets.getSession(jonnySocket, function (err, session) {
      expect(err).to.be(null);
      expect(session.foo).to.equal('bar');
      done();
    });
  });

  it('provides session in connection callbacks on the global namespace', function (done) {
    this.sessionSockets.on('connection', function (err, socket, session) {
      expect(err).to.be(null);
      expect(session.foo).to.equal('bar');
      done();
    });
  });

  it('provides session in connection callbacks on a specific namespace', function (done) {
    this.sessionSockets.of('/foobar').on('connection', function (err, socket, session) {
      expect(err).to.be(null);
      expect(session.foo).to.equal('bar');
      done();
    });
  });

  it('gives a SessionStoreError upon invalid handshakes', function (done) {
    this.sessionSockets.getSession({ handshake: 'invalid' }, function (err, session) {
      expect(err).to.be.a(SessionStoreError);
      expect(session).to.be(null);
      done();
    });
  });

  it('gives a CookieParserError upon invalid lookups', function (done) {
    this.sessionSockets.getSession({ invalid: 'socket' }, function (err, session) {
      expect(err).to.be.a(CookieParserError);
      expect(session).to.be(null);
      done();
    });
  });
});

function stub(attributes) {
  attributes.handshake = { signedCookies: { 'connect.sid': 42 }};
  return attributes;
}

function ns() {
  return {
    on: function(event, callback) {
      if (event === 'connection') callback(jonnySocket);
    }
  };
}

function io() {
  return {
    of: function() { return ns() },
    sockets: ns()
  };
}

function sessionStore() {
  return {
    load: function(cookie, callback) {
      if (cookie) callback(null, jonnySocket);
      else callback(new SessionStoreError(), null);
    }
  };
}

function cookieParser(handshake, options, callback) {
  if (handshake) callback();
  else callback(new CookieParserError());
}

function SessionStoreError() {}
function CookieParserError() {}
