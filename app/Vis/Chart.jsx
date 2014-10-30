/** @jsx React.DOM */                                                   
// Chart.js
var d3Chart = require('./d3Chart');
var React = require('react');

//var nyt_api = require('./NYT_api');                                      

//nyt_api.get_data('2013', '2014', function(data){
//alert(data); 
//});

var Chart = React.createClass({
  propTypes: {
    data: React.PropTypes.array,
    domain: React.PropTypes.object,
  },

  componentDidMount: function() {
    var el = this.getDOMNode();
    d3Chart.create(el, {width: this.props.width, 
                        height: this.props.height}, 
                        this.getChartState());
  },

  componentDidUpdate: function() {
    var el = this.getDOMNode();
    d3Chart.update(el, this.getChartState());
  },

  getChartState: function() {
    return {
      data: this.props.data
    };
  },

  componentWillUnmount: function() {
    var el = this.getDOMNode();
    //d3Chart.destroy(el);
  },

  render: function() {
    return (
      <div> 
        <div className="Chart"></div>
      </div>
    );
  }
});
module.exports = Chart;                                                  
