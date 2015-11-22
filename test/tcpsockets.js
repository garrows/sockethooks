var net = require('net'),
  deviceName = 'tester',
  host = 'localhost',
  port = 3030,
  exiting = false,
  client;

function connect() {
  client = net.connect({
      host: host,
      port: port
    },
    function() {
      console.log('SocketHook ready. Go to http://' + host + ':' + port + '/devices/' + deviceName);

      var hostAddress = host + (port === 80 ? '' : port);
      client.write(
        'GET /thing?name=' + deviceName + ' HTTP/1.1\n' +
        'Host: ' + hostAddress + '\n\n'
      );

    });

  client.on('data', function(data) {
    console.log('Your socket was hit:', data.toString());
  });

  function reconnect() {
    if (exiting) return;
    setTimeout(function() {
      if (exiting) return;
      console.log('Reconnecting...');
      connect();
    }, 1000);
  }

  client.on('end', function() {
    console.log('Disconnected.');
    reconnect();
  });

  client.on('error', function(error) {
    console.log('Errored.', error);
    reconnect();
  });
}
connect();

process.on('SIGINT', function() {
  exiting = true;
  if (client) client.end();
});
