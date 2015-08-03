var io = require('socket.io-client');
var socket = io('http://localhost:3030');

var DEVICE_NAME = 'tester';

socket.emit('register', DEVICE_NAME);

socket.on('connected', function(data) {
  console.log('connected', data);
});

socket.on('registered', function(data) {
  console.log('registered', data);
});

socket.on('data', function(data) {
  console.log('server sent', data);
});

var counter = 0;
setInterval(function() {
  socket.emit('data', {
    counter: counter++,
    random: Math.random()
  });
}, 2000);
