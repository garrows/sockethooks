# SocketHooks

Translate HTTP requests to socket messages.

Cool for internet of things and connecting Pebble watches to robots.

### Setup

`npm install socket.io-client`

```
var io = require('socket.io-client');
var socket = io('http://sockethooks.garrows.com');

var DEVICE_NAME = Math.floor(Math.random() * 10000);

socket.on('connected', function(data) {
  console.log('Connected', data);
  socket.emit('register', DEVICE_NAME);
});

socket.on('data', function(data) {
  console.log('Got data:', data);
});

// Send some to the server
var counter = 0;
setInterval(function() {
  socket.emit('data', {
    counter: counter++,
    random: Math.random()
  });
}, 2000);
```


It should print out a url. Open that in your browser to send data and get the data its sent to you.
