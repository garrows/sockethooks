var React = window.React = require('react'),
  ls = require('local-storage'),
  io = require('socket.io-client'),
  socket = io.connect(window.location.origin + '/?name=browser-probe');

var deviceName = ls('deviceName');
if (!deviceName) {
  deviceName = 'YOUR_NAME_HERE_' + Math.floor(Math.random() * 100000);
  ls('deviceName', deviceName);
}

var RandomName = React.createClass({
  render: function() {
    return <span>&#39;{deviceName}&#39;</span>;
  }
});

var DeviceStatus = React.createClass({
  getInitialState: function() {
    var self = this;

    socket.on(deviceName, function(data) {
      console.log('Client connected', deviceName, data);
      var output = self.state.output;
      if (data.connected) {
        var url = {
          href: window.location.protocol + '//' + window.location.host + '/devices/' + deviceName + '?data1=one&data1=two'
        };
        output = <div>Connected. Try going to &nbsp;
            <a target="_blank" {...url}>{url}</a>
          </div>;
      } else {
        output = <dev>Status: Device not connected.</dev>;
      }
      self.setState({
        connected: data.connected,
        reason: data.reason,
        output: output
      });
    });

    socket.emit('probe', deviceName);

    socket.on('data', function(data) {
      console.log('browser-probe sockethook hit', data);
    });

    return {
      connected: false,
      reason: 'uninitialized',
      output:
      <dev>Status: Device not connected.</dev>
    };
  },
  render: function() {
    return this.state.output;
  }
});

React.render(<RandomName/>, document.getElementById('device-name'));
React.render(<DeviceStatus/>, document.getElementById('device-status'));
