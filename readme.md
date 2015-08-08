# SocketHooks

http://sockethooks.garrows.com

Translate HTTP requests to socket messages.

Handy for connecting internet of things and avoiding port forwarding.

### Setup

`npm install socket.io-client`

```
var deviceName = 'YOUR_NAME_HERE';

var io = require('socket.io-client');
var socket = io('http://sockethooks.garrows.com?name=' + deviceName);

socket.on('connected', function(data) {
  console.log('SocketHook ready. Go to', data.url);
});

socket.on('data', function(data) {
  console.log('Your sockethook was hit:', data);
});```


Running the above code will print out a url which you can open in your browser to fire your SocketHook.
