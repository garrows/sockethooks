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
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));
app.set('json spaces', 3);

app.get('/devices', function(req, res) {
  res.json(devices);
});

app.get('/thing', function(req, res, next) {
  //Hacky attempt for less code
  req.request = req;
  clientConnected(req, function(error, socket) {
    if (error) next(error);
    socket.send = function(eventName, data) {
      data.event = eventName;
      req.client.write(JSON.stringify(data));
    };
    clientPostConnection(socket);
  });
});

app.all('/devices/:deviceName', function(req, res) {
  var device = devices[req.params.deviceName];

  if (!device) {
    res.status(404).send('Device not found. Did you remember to start your client?');
    return;
  }

  device.socket.send('data', {
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

function clientConnected(socket, next) {
  socket.name = (socket.request._query && socket.request._query.name) || (socket.request.query && socket.request.query.name);

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

  if (typeof next === 'function') next(null, socket);
}

io.use(function(socket, next) {
  clientConnected(socket, function(error, socket) {
    socket.send = function(eventName, data) {
      data.event = eventName;
      socket.emit(eventName, data);
    };
    return next(error, socket);
  });
});

function clientPostConnection(socket) {
  console.log('Connection', socket.name);


  socket.send('connected', {
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

  function clientDisconnected() {
    console.log('Disconnect', socket.name);
    if (!devices[socket.name]) return console.warn('Cant find device', socket.id);
    io.sockets.emit(devices[socket.name].info.name, {
      connected: false,
      reason: 'disconnect'
    });
    delete devices[socket.name];
  }
  socket.on('disconnect', clientDisconnected); //Socket.io
  socket.on('close', clientDisconnected); //HTTP
}

io.on('connection', clientPostConnection);

// server.on('request', function(request, response) {
//   if (request.httpVersion === '3.0') {
//     console.log('HTTP 3.0 client connected');
//     response.writeHead(200, {
//       'Content-Type': 'application/json'
//     });
//     response.write('{"okay":true}');
//   }
//   request.on('close', function() {
//     console.log('HTTP 3.0 client disconnected');
//   });
// });
// server.on('checkContinue', function(request, response) {
//   console.log('checkContinue!!!!!!!!');
// });
// server.on('upgrade', function(request, socket, head) {
//   console.log('upgrade!!!!!!!!');
// });
server.on('clientError', function(exception, socket) {
  console.log('clientError!!!!!!!!', exception);
});
// var net = require('net');
// var server = net.createServer(function(c) { //'connection' listener
//   console.log('client connected');
//   c.on('end', function() {
//     console.log('client disconnected');
//   });
//   c.write('hello\r\n');
//   c.pipe(c);
// });
// server.listen(port + 1, function() { //'listening' listener
//   console.log('server bound');
// });
