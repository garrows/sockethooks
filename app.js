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

app.all('/devices/:deviceName', function(req, res) {
  var device = devices[req.params.deviceName];

  if (!device) {
    res.status(404).send('Device not found. Did you remember to start your client?');
    return;
  }

  device.socket.emit('data', {
    method: req.method,
    query: req.query,
    body: req.body
  });
  res.json(device.info);
});

var port = parseInt(process.env.PORT || 3030);
app.set('port', port);

server.listen(port);

var host = (process.env.SERVER || 'http://sockethooks.garrows.com');
server.on('listening', function() {
  console.log('Started server ' + host + ':' + port);
});

var devices = {};

io.use(function(socket, next) {
  socket.name = socket.request._query.name;

  console.log('Connecting', socket.name);

  if (!socket.name) return next(new Error('Device name required. Add \'?name=\''));

  var server = 'http://' + (socket.request.headers.host || host);

  devices[socket.name] = {
    info: {
      id: socket.id,
      name: socket.name,
      url: server + '/devices/' + socket.name
    },
    socket: socket
  };

  //Broadcast for homepage
  io.sockets.emit(devices[socket.name].info.name, {
    connected: true,
    reason: 'connected'
  });

  next();
});

io.on('connection', function(socket) {
  console.log('Connection', socket.name);


  socket.emit('connected', {
    url: devices[socket.name].info.url
  });

  //Homepage probing for connection status
  socket.on('probe', function(data) {
    var connected = Object.keys(devices).some(function(id) {
      return devices[id].info.name === data;
    });
    console.log('probe', data, connected);
    io.sockets.emit(data, {
      connected: connected,
      reason: 'probe'
    });
  });

  socket.on('disconnect', function() {
    console.log('Disconnect', socket.name);
    if (!devices[socket.name]) return console.warn('Cant find device', socket.id);
    io.sockets.emit(devices[socket.name].info.name, {
      connected: false,
      reason: 'disconnect'
    });
    delete devices[socket.name];
  })
});
