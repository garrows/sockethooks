var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('json spaces', 3);
app.get('/devices', function(req, res) {
  res.json(devices);
});
app.get('/devices/:deviceId', function(req, res) {
  var device = devices[req.params.deviceId];
  if (!device) {

    var deviceIds = Object.keys(devices);
    for (var i = 0; i < deviceIds.length; i++) {
      if (devices[deviceIds[i]].name == req.params.deviceId) {
        device = devices[deviceIds[i]];
        break;
      }
    }
    if (!device) {
      res.status(404).send('Device not found');
      return;
    }
  }
  var socket = sockets[device.id];
  socket.emit('data', req.query);
  res.json(device);
});

var port = parseInt(process.env.PORT || 3030);
app.set('port', port);

server.listen(port);

// module.exports = app;
var host = (process.env.SERVER || 'http://localhost') + ':' + (process.env.PORT || 3030);
server.on('listening', function() {
  console.log('Started server ' + host);
});

var devices = {};
var sockets = {};
io.on('connection', function(socket) {
  console.log('Connection!', socket.id);
  devices[socket.id] = {
    id: socket.id,
    name: null,
    url: host + '/devices/' + socket.id + '?a=1&b=2',
    data: {}
  };
  sockets[socket.id] = socket;

  socket.emit('connected', {
    url: devices[socket.id].url
  });
  socket.on('register', function(data) {
    console.log('register', data);
    devices[socket.id].name = data;
    devices[socket.id].url = host + '/devices/' + data + '?a=1&b=2';
  });
  socket.on('data', function(data) {
    console.log('data', data);
    devices[socket.id].data = data;
  });
  socket.on('disconnect', function() {
    console.log('disconnected');
    delete devices[socket.id];
    delete sockets[socket.id];
  })
});
