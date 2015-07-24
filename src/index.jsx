// var React = window.React = require('react'),
//   async = require('async'),
//   io = require('socket.io-client');
//
// var HelloMessage = React.createClass({
//   render: function() {
//     return <div>Hello {this.props.name}</div>;
//   }
// });
//
// React.render(<HelloMessage name="Glen"/>, document.getElementById('container'));
//
// var socket = io.connect();
// socket.on('news', function(data) {
//   console.log(data);
//   socket.emit('my other event', {
//     my: 'data'
//   });
// });
