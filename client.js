var io = require('socket.io-client');
var socket = io('http://localhost:3030');

var DEVICE_NAME = Math.floor(Math.random() * 10000);

socket.on('connected', function(data) {
  console.log('connected', data);
  socket.emit('register', DEVICE_NAME);
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
