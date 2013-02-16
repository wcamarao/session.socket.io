session.socket.io (SessionSockets)
==================================

This tiny node module aims to simplify your socket.io application when using http sessions from express or connect middlewares. It has no dependencies and can be initialized using any session store and cookie parser compatible with express or connect.

It's written and tested using express 3.0.0rc4, connect 2.4.5 and socket.io 0.9.10.

## Quick Start

Import the module and initialize it providing the required parameters

```js
var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
```

Listen to socket connections and get the socket _as provided by socket.io_, together with either the session or an error

```js
sessionSockets.on('connection', function (err, socket, session) {
  //your regular socket.io code goes here
  //and you can still use your io object
});
```

## Running the example

    $ cd example
    $ npm install
    $ node server.js

    Visit http://localhost:3000

## Saving values into the session

```js
sessionSockets.on('connection', function (err, socket, session) {
  session.foo = 'bar';
  //at this point the value is not yet saved into the session
  session.save();
  //now you can read session.foo from your express routes or connect middlewares
});
```

## Namespacing

```js
sessionSockets.of('/chat').on('connection', function (err, socket, session) {
  //the socket here will address messages only to the /chat namespace
});
```

## Get session for a client

```js
io.sockets.clients().forEach(function (socket) {
  // so far we have access only to client sockets
  sessionSockets.getSession(socket, function (err, session) {
    // getSession gives you an error object or the session for a given socket
  });
});
```

## Error handling

Note that now you receive 3 parameters in the connection callback (err, socket, session). The first will be an error object (if an error has occured) from either the cookie parser (when trying to parse the cookie) or the session store (when trying to lookup the session by key); the second will _always be the socket as provided by socket.io_; and the third (if no error has ocurred) will be the corresponding user session for that socket connection.

## Troubleshooting

The cookieParser doesn't need to be the same reference, you can create another instance somewhere else, but it _should_ take the same 'secret', otherwise the cookie id won't be decoded, therefore the session data won't be retrieved.

The sessionStore _must_ be the same instance. It's quite obvious why.

You can always debug the cookies and session data from any socket.handshake. The socket is the same _as provided by socket.io_ and contains all of that information.

## Cookie lookup precedence

When looking up for the cookie in a socket.handshake, SessionSockets will take precedence on the following order:

1. secureCookies
2. signedCookies
3. cookies

## Specifying a session store key

You can specify your own session store key

```js
new SessionSockets(io, sessionStore, cookieParser, 'yourOwnSessionStoreKey');
```

It defaults to 'connect.sid' (which is default for both connect and express).

## A more detailed example

```js
var http = require('http')
  , connect = require('connect')
  , express = require('express')
  , app = express();
```

Below are the two main references you will need to keep

```js
var cookieParser = express.cookieParser('your secret sauce')
  , sessionStore = new connect.middleware.session.MemoryStore();
```

Both will be used by express - so far everything's familiar, except that you need to provide sessionStore when using express.session(). Here you could use Redis or any other store as well.

```js
app.configure(function () {
  //hiding other express configuration
  app.use(cookieParser);
  app.use(express.session({ store: sessionStore }));
});
```

Then you create the server and bind socket.io to it (nothing new here)

```js
var server = http.createServer(app)
  , io = require('socket.io').listen(server);
```

Now instead of listening to io.sockets.on('connection', ...) you will pass it together with the sessionStore and cookieParser

```js
var SessionSockets = require('session.socket.io')
  , sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
```

Which will use it all together to get you what matters

```js
sessionSockets.on('connection', function (err, socket, session) {
  //your regular socket.io code goes here
  //and you can still use your io object
});
```

## License

  (The MIT License)

  Copyright (c) 2012 Wagner Camarao &lt;functioncallback@gmail.com&gt;

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
  OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
  ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
  OR OTHER DEALINGS IN THE SOFTWARE.
