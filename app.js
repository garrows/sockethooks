var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var logger = require('morgan');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.set('json spaces', 3);

app.get('/devices', function(req, res) {
  res.json(devices);
});

app.all('/devices/:deviceId', function(req, res) {
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
      res.status(404).send('Device not found. Did you remember to start your client?');
      return;
    }
  }

  var socket = sockets[device.id];
  socket.emit('data', {
    method: req.method,
    query: req.query,
    body: req.body
  });
  res.json(device);
});

var port = parseInt(process.env.PORT || 3030);
app.set('port', port);

server.listen(port);

var host = (process.env.SERVER || 'http://sockethooks.garrows.com');
server.on('listening', function() {
  console.log('Started server ' + host + ':' + port);
});

var devices = {};
var sockets = {};
io.on('connection', function(socket) {
  console.log('Connection', socket.id);
  devices[socket.id] = {
    id: socket.id,
    name: null,
    url: host + '/devices/' + socket.id + '?data1=one&data2=two',
    data: {}
  };
  sockets[socket.id] = socket;

  socket.emit('connected', {
    url: devices[socket.id].url
  });

  socket.on('register', function(data) {
    console.log('Registered', socket.id, data);
    if (typeof data !== 'string') return console.warn('Bad register type', typeof data, data);
    devices[socket.id].name = data;
    devices[socket.id].url = host + '/devices/' + data + '?data1=one&data2=two';
    socket.emit('registered', {
      url: devices[socket.id].url
    });

    //Broadcast for homepage
    io.sockets.emit(devices[socket.id].name, {
      connected: true,
      reason: 'connected'
    });
  });

  //Homepage probing for connection status
  socket.on('probe', function(data) {
    var connected = Object.keys(devices).some(function(id) {
      return devices[id].name === data;
    });
    console.log('probe', data, connected);
    io.sockets.emit(data, {
      connected: connected,
      reason: 'probe'
    });
  });

  socket.on('data', function(data) {
    // console.log('data', data);
    devices[socket.id].data = data;
  });

  socket.on('disconnect', function() {
    console.log('Disconnect', socket.id);
    io.sockets.emit(devices[socket.id].name, {
      connected: false,
      reason: 'disconnect'
    });
    delete devices[socket.id];
    delete sockets[socket.id];
  })
});
