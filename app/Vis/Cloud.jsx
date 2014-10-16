/** @jsx React.DOM */                                                     
var React = require('react');
var d3Cloud = require('./d3Cloud');
var cloud_init;

var Cloud = React.createClass({
  componentDidMount: function() {
        var el = this.getDOMNode();
        //TODO: props
        //this.props.base_cloud = 
        cloud_init = d3Cloud.create(el, this.getCloudState()); 
  },

  componentDidUpdate: function() {
        var el = this.getDOMNode();
        d3Cloud.update(el, cloud_init, this.getCloudState());
  },

  getCloudState: function() {
    return {
      data: this.props.data
    };
      
  },

  componentWillUnmount: function() {
        var el = this.getDOMNode();
        //d3Cloud.destroy(el);
  },

  render: function() {
    return (
      <div className="Cloud"></div>
    );
      
  }
});
module.exports = Cloud;
