# SocketHooks

http://sockethooks.garrows.com

Translate HTTP requests to socket messages.

Cool for internet of things and connecting Pebble watches to robots.

### Setup

`npm install socket.io-client`

```
var io = require('socket.io-client');
var socket = io('http://sockethooks.garrows.com');

socket.emit('register', 'YOUR_NAME_HERE');

socket.on('registered', function(data) {
  console.log('SocketHook ready. Go to', data.url);
});

socket.on('data', function(data) {
  console.log('Your sockethook was hit:', data);
});
```


Running the above code will print out a url which you can open in your browser to fire your SocketHook.
