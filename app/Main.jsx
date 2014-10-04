/** @jsx React.DOM */
var React = require('react');
var Chart = require('Vis/Chart');
var Nyt_api = require('Vis/NYT_api');
require("./Application.less");
var sampleData = [
  {id: '5fbmzmtc', x: 7, y: 41, z: 6},
  {id: 's4f8phwm', x: 11, y: 45, z: 9},
  {id: 's4f8psssm', x: 11, y: 90, z: 9}
  // ...
];

var Application = React.createClass({
  getInitialState: function() {
    return {
      data: [],
      domain: {x: [0, 30], y: [0, 100]},
      value: "hello"
    };
  },
  componentDidMount: function(){
    var dis = this;
    Nyt_api.get_data('2013', '2014', function(data){
      dis.setState({data: sampleData,
                    domain: {x: [0, 30], y: [0, 100]}
      });
    });
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var start_year = this.refs.start_year.getDOMNode().value.trim();
    var end_year = this.refs.end_year.getDOMNode().value.trim();
    if (! start_year || !end_year) {
      return;
    }
    //var dis = this;
    Nyt_api.get_data(start_year, end_year, function(data){
      this.setState({data: data,
                    domain: {x: [0, 30], y: [0, 100]}
      });
    }.bind(this));
    return;
  },

  render: function() {
    console.log(this.state.data);
    return (
      <div className="App">
        <form className="commentForm" 
          onSubmit={this.handleSubmit}>
          <input type="text" placeholder="first year" 
            ref="start_year"/>
          <input type="text" placeholder="second year" 
            ref="end_year"/>
          <input type="submit" value="Post" />
        </form>
        <Chart data={this.state.data} domain={this.state.domain} />
      </div>
    );
  }
});                                                                     

React.renderComponent(<Application />, document.body);
module.exports = Application;
