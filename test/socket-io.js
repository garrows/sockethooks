var deviceName = 'tester';

var io = require('socket.io-client');
var socket = io('http://localhost:3030/?name=' + deviceName);
// var socket = io('http://sockethooks.garrows.com/?name=' + deviceName);

socket.on('connected', function(data) {
  console.log('SocketHook ready. Go to', data.url);
});

socket.on('data', function(data) {
  console.log('Your sockethook was hit:', data);
});

socket.on('error', function(data) {
  console.log('Error', data);
});
