 /** @jsx React.DOM */ 
var d3 = require('d3');
var React = require('react');
var Chart = require('Vis/Chart');
var Nyt_api = require('Vis/NYT_api');
var Input = require('react-bootstrap/Input');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
// global data
processed_data = [];
require("./Application.less");
var sampleData = [
  {id: '5fbmzmtc', x: 7, y: 41, z: 6},
  {id: 's4f8phwm', x: 11, y: 45, z: 9},
  {id: 's4f8psssm', x: 11, y: 90, z: 9}
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
    Nyt_api.get_data('2013', '2014', function(data){
      this.setState({data: sampleData,
                    domain: {x: [0, 30], y: [0, 100]}
      });
    }.bind(this));
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var start_year = this.refs.start_year.getDOMNode().value.trim();
    var end_year = this.refs.end_year.getDOMNode().value.trim();
    if (! start_year || !end_year) {
      return;
    }
    Nyt_api.get_data(start_year, end_year, function(data){
      processed_data = d3.nest().key(function(d){return d.value;})
                             .entries(data, d3.map);
      processed_data.forEach(function(d){
                          d.count = d.values.length;
                         });
      processed_data.sort(function(a, b){
          return b.count - a.count;
        });
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
        <Input label="Input wrapper" help="Use this when you need something other than the available input types." wrapperClassName="wrapper">
      <Row>
        <Col xs={6}>
          <input type="text" className="form-control" />
        </Col>
        <Col xs={6}>
          <input type="text" className="form-control" />
        </Col>
      </Row>
    </Input>
        <Chart data={this.state.data} domain={this.state.domain} />
      </div>
    );
  }
});                                                                     
React.renderComponent(<Application />, document.body);
module.exports = Application;
