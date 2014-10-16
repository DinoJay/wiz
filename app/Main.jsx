 /** @jsx React.DOM */ 
var d3 = require('d3');
var React = require('react');
var Chart = require('Vis/Chart');
var d3Cloud = require('Vis/d3Cloud');
var Cloud = require('Vis/Cloud');
var Nyt_api = require('Vis/NYT_api');
var Input = require('react-bootstrap/Input');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var Label = require('react-bootstrap/Label');
var cl= require("Vis/d3.layout.cloud");

/* Testting 
var state = {};
var data = [
      "Hello", "world", "normally", "you", "want", "more", "words",
      "than", "this"].map(function(d) {
      return {text: d, size: 10 + Math.random() * 90};
      });
      //d3Cloud.create("body", state);
*/

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
      start_year: 2013,
      end_year: 2014,
      domain: {x: [0, 30], y: [0, 100]},
    };
  },
  getDefaultProps: function(){
    return {
      data: [],
      start_year: 2013,
      end_year: 2014,
      domain: {x: [0, 30], y: [0, 100]}
    };
  },
  componentDidMount: function(){
    Nyt_api.get_data(this.props.start_year, this.props.end_year, 
                     function(data){
      this.setState({data: data});
    }.bind(this));
  },
  handleChange: function(event) {
    this.setState({start_year: event.target.value});
  },

  handleSubmit: function(e) {
    e.preventDefault();
    this.props.start_year = this.refs.start_year.getDOMNode().value;
    this.props.end_year = this.refs.end_year.getDOMNode().value;
    var start_year = this.props.start_year;
    var end_year = this.props.end_year;
    console.log("start_year"+start_year);
    // TODO: proper validation
    if (! start_year || !end_year) {
      console.log("wrong values");
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
      <div className="container ">
        <div className="col-md-9">
          <Input label="Input wrapper" help="descr" 
            wrapperClassName="wrapper">
        <Row>
          <Col xs={3}>start year </Col>
          <Col xs={3}>end year</Col>
        </Row>
        <Row>
          <form onSubmit={this.handleSubmit}>
          <Col xs={3}>
            <input type="number" className="form-control" 
              ref="start_year" value={this.state.start_year}
              onChange={function(event) {
                  this.setState({start_year: event.target.value});
                }.bind(this)
              }
            />
          </Col>
          <Col xs={3}>
            <input type="number" className="form-control" 
              ref="end_year" value={this.state.end_year}
              onChange={function(event) {
                  this.setState({end_year: event.target.value});
                }.bind(this)
              }
            />
          </Col>
          <Col xs={3}>
            <input type="submit" bsStyle='primary' 
              value="Submit" />
          </Col>
        </form>
        </Row>
      </Input>
      <Cloud data={this.state.data}/> 
        </div>
      </div>
    );
  }
});                                                                     
React.renderComponent(<Application />, document.body);
module.exports = Application;
