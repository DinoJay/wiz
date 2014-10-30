 /** @jsx React.DOM */ 
var d3 = require('d3');
var crossfilter = require('crossfilter');
var React = require('react');
var Griddle = require('griddle-react');
var Chart = require('Vis/Chart');
var Cloud = require('Vis/Cloud');
var fontSize = d3.scale.log().range([10, 100]);
var Nyt_api = require('Vis/NYT_api');
// Bootstrap
var Input = require('react-bootstrap/Input');
var Row = require('react-bootstrap/Row');
var Col = require('react-bootstrap/Col');
var Label = require('react-bootstrap/Label');

var id = 0;
// number of api requests to make
var page_limit = 100;

// additional stylesheets
require("./Application.less");
require('Vis/grid/griddle.less');                                             
Array.prototype.uniqueKeywords = function() {
    var unique = [];
    for (var i = 0; i < this.length; i++) {
        if (!unique.containsKeyword(this[i])) {
            unique.push(this[i]);
        }
    }
    return unique;
};
Array.prototype.containsKeyword = function(str) {                 
    var i = this.length;                                                 
    while (i--) {if (this[i].value == str) return true;}
    return false; 
};        

var columnMeta = [
  {
    "columnName": "id",
    "order": 1,
    "locked": false,
    "visible": true
  },
  {
    "columnName": "article",
    "order": 2,
    "locked": false,
    "visible": true
  },
  {
    "columnName": "key",
    "order": 1,
    "locked": false,
    "visible": true
  }
];

var Application = React.createClass({
  getInitialState: function() {
    return {
      cloud_data: [],
      init_data: [],
      grid_data: [],
      start_year: 2014,
      end_year: 2014,
      word_clicked: false
    }; 
  }, 
  
  DataMethod: function(filterString, sortColumn, sortAscending, 
                              page, pageSize, callback) {
      callback({
        results : this.state.grid_data,
        pageSize : 20,
        totalResults: 200
      });
  },

  getDefaultProps: function(){ 
    return { cloud_data: [],
            start_year: 2014,
            month: 10,
            end_year: 2014,
           };
  },

  nest_data: function(data){
    var nested_data = d3.nest().key(function(d){return d.text;})
                           .entries(data, d3.map);
    nested_data.forEach(function(d){
      d.count = d.values.length;
      d.size = fontSize(d.count/(5*1));

      var pub_dates = [];
      d.values.forEach(function(d){
        pub_dates = pub_dates.concat(d.pub_date);
      });
      d.pub_dates = pub_dates;
    });

    nested_data.sort(function(a, b){return b.count-a.count;});
      return nested_data.slice(0, 120);
  },
  
  grid_data: function(data){
    var grid_data = d3.nest().key(function(d){return d.headline;})
      .entries(data, d3.map);
    grid_data.forEach(function(d){
      d.article = d.key;
      d.id = id++;
    });
    return grid_data;
  },

  loadCloud: function(interval){
    var counter = 0;
    var init_data;
    var t = setInterval(function(){
      if(counter/1000 <= 20) init_data = [ "Please", "Wait!"];
      else if (counter/1000 <= 40) init_data = ["It", "Takes", "Time..."];
           else if (counter/1000 <= 80) init_data = ["Don't", "Worry!"];
                else init_data = ["Almost", "Done", "Promised", ":-)"];

      init_data = init_data.map(function(d) {
            return {key: d, size: 100 + Math.random()};
      });
      counter += 1000;
      this.setState({cloud_data: init_data});
    }.bind(this), interval);
    return t;
  },

  componentDidMount: function(){
  // make an initial load cloud
    var t = this.loadCloud(1000);
    Nyt_api.get_data(this.props.start_year, 10, page_limit, 
      function(cloud_data){
        var nested_data = this.nest_data(cloud_data);
        this.setState({cloud_data: nested_data,
                      init_cloud_data: nested_data,
                      grid_data: this.grid_data(cloud_data)
                      });
        clearInterval(t);
    }.bind(this));
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var start_year = this.props.start_year;
    var end_year = this.props.end_year;
    console.log("start_year"+start_year);
    // TODO: proper validation
    if (! start_year || !end_year) {
      console.log("wrong values");
      return;
    }
    // function call runs every second
    var t = this.loadCloud(1000);
    Nyt_api.get_data(this.props.start_year, 10, page_limit, 
      function(cloud_data){
        var nested_data = this.nest_data(cloud_data);
        this.setState({cloud_data: this.nest_data(cloud_data),
                        init_cloud_data: nested_data,
                        grid_data: nested_data
                      });
        clearInterval(t);
    }.bind(this));
    return;
  },
  // TODO: layout obsolete
  word_click_handler: function(d, layout){
    if(!this.state.clicked){
      alert(d.count);
      var cloud_filter = crossfilter(this.state.cloud_data);
      var keyDimension = cloud_filter.dimension(function(d) { 
        return d.key; 
      });
      keyDimension.filter(d.text);
      var sel_word = keyDimension.top(Infinity)[0];
      var keywords = [];
      sel_word.values.forEach(function(d){
        keywords = keywords.concat(d.keywords);
      });
      var nested_keywords = d3.nest().key(function(d){return d.value;})
                              .entries(keywords, d3.map);
      nested_keywords.forEach(function(d){
        d.size = 15 + d.values.length * 10;
      });

      var grid_data = sel_word.values.map(function(d){
        d.article = d.headline;
        return d;
      });
      nested_keywords.push({key: d.text, size: 50});
      console.log("sel_word");
      console.log(sel_word);
      this.setState({cloud_data: nested_keywords,
                     init_cloud_data: this.state.cloud_data,
                     init_grid_data: this.state.grid_data,
                     grid_data: grid_data,
                     clicked: true
                    });
    }else{
      console.log(this.state.init_grid_data);
      this.setState({cloud_data:this.state.init_cloud_data, 
                     grid_data: this.state.init_grid_data,
                     clicked:false
                    });
    }
  },

  render: function() {
    console.log("cloud data");
    console.log(this.state.cloud_data);
    console.log("grid data");
    console.log(this.state.grid_data);
    // TODO: headline filter
    return (
      <div>
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
              ref="start_year" defaultValue="2014"
              onChange={function(event) {
                  this.props.start_year = event.target.value;
                }.bind(this)
              }
            />
          </Col>
          <Col xs={3}>
            <input type="number" className="form-control" 
              ref="end_year" defaultValue="2014"
              onChange={function(event) {
                  this.props.end_year = event.target.value;
                }.bind(this)
              } />
          </Col>
          <Col xs={3}>
            <input type="submit" bsStyle='primary' 
              value="Submit" />
          </Col>
        </form>
        </Row>
      </Input>
      <Col xs={9}> 
        <Cloud data={this.state.cloud_data}
          callback={this.word_click_handler}/> 

          <Griddle
            columns={["id", "article"]}
            getExternalResults={this.DataMethod}
            resultsPerPage={40}
            showSettings={true}
            columnMetadata={columnMeta}
            tableClassName="table"
          />
      </Col>
      </div>
</div>

</div>
  );
}
});
React.renderComponent(<Application />, document.body);
module.exports = Application;
