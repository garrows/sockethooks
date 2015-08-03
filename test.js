var io = require('socket.io-client');
var socket = io('http://localhost:3030');

socket.emit('register', 'tester');

socket.on('registered', function(data) {
  console.log('SocketHook ready. Go to', data.url);
});

socket.on('data', function(data) {
  console.log('Your sockethook was hit:', data);
});
