var React = window.React = require('react');

var RandomName = React.createClass({
  render: function() {
    return <span>&#39;{this.props.prefix}{Math.floor(Math.random() * 10000)}&#39;</span>;
  }
});

React.render(<RandomName prefix="YOUR_NAME_HERE_"/>, document.getElementById('device-name'));
