 /** @jsx React.DOM */ 
var d3 = require('d3');
var crossfilter = require('crossfilter');
var React = require('react');
//var Griddle = require('griddle-react');
var DataTable = require('react-data-components').DataTable;
var Mygrid = require('./Vis/my_grid');
var Chart = require('Vis/Chart');
var Cloud = require('Vis/Cloud');
var fontSize = d3.scale.log().range([10, 100]);
var Nyt_api = require('Vis/NYT_api');
var $ = require('jquery');

var stop_word_removal = require('./Vis/stopwords');
// d3
var scale = d3.scale.linear();
scale.domain([0, 60]);
scale.range([10, 120]);
scale.clamp(true);
var fill = d3.scale.category20(); 

var columns = [
  { title: 'Article', prop: 'article'}
];

var id = 0;
// number of api requests to make
var page_limit = 100;

// additional stylesheets
require("./Application.less");

var Application = React.createClass({
  getInitialState: function() {
    return {
      cloud_data: [[]],
      grid_data: [],
      clicked_words: []
    }; 
  }, 

  getDefaultProps: function(){ 
    return { cloud_data: [],
            start_year: 2014,
            end_year: 2014,
            news_desk: "National",
            data: []
           };
  },
  
  nest_data: function(data, limit, clicked_words){
    var nested_data = d3.nest().key(function(d){return d.key;})
                           .entries(data, d3.map);
    console.log("clicked words inside function");
    console.log(clicked_words);
    nested_data.forEach(function(d, i){
      d.count = d.values.length;
      d.size = scale(d.count);
      d.clicked = false;
      d.color = fill(i);
      if (clicked_words.indexOf(d.key) !== -1){
        console.log("pass");
        d.clicked = true;
        d.size = scale(d.count)+40;
      }     
    });
    nested_data.sort(function(a, b){return b.count-a.count;});
      return nested_data.slice(0, limit);
  },
  
  grid_data: function(data){
    console.log("Flat Data");
    console.log(data);
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
    var init_data = [];
    var t = setInterval(function(){
      if(counter/1000 <= 20) init_data = [ "Please", "Wait!"];
      else if (counter/1000 <= 40) init_data = ["It", "Takes", "Time..."];
           else if (counter/1000 <= 80) init_data = ["Don't", "Worry!"];
                else init_data = ["Almost", "Done", "Promised", ":-)"];

      init_data = init_data.map(function(d,i) {
       return {
          key: d,
          size: 100 + Math.random(),
          color: fill(i)
        };
      });
      counter += 1000;
      console.log("INIT DATA");
      console.log(init_data);
      this.setState({cloud_data: [init_data]});
    }.bind(this), interval);
    return t;
  },

  componentDidMount: function(){
  // make an initial load cloud
    var t = this.loadCloud(1000);
    this.forceUpdate();
    var spit_data = [];
    Nyt_api.get_data(this.props.start_year, 10, page_limit,
    this.props.news_desk, function(cloud_data){
        var nested_data = this.nest_data(cloud_data, 180, []);
        clearInterval(t);
        var cl_data = this.state.cloud_data.slice(0);
        cl_data.push(nested_data);
        if (this.isMounted()) {
            this.setState({cloud_data: cl_data,
                           init_cloud_data: nested_data,
                           grid_data: this.grid_data(cloud_data)
                          });
            this.forceUpdate();
        }
    }.bind(this));
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var start_year = this.props.start_year;
    var end_year = this.props.end_year;
    // TODO: proper validation
    // function call runs every second
    if (! start_year || !end_year) {
      console.log(this.state.start_year);
      return;
    }
    var t = this.loadCloud(1000);
    Nyt_api.get_data(this.props.start_year, 10, page_limit, 
                     this.props.news_desk, function(cloud_data){
        var nested_data = this.nest_data(cloud_data, 150, ["ebola"]);
        var cl_data = this.state.cloud_data.slice(0);
        cl_data.push(nested_data);
        this.setState({cloud_data: cl_data,
                       grid_data: this.grid_data(cloud_data)
                      });
        this.forceUpdate();
        clearInterval(t);
    }.bind(this));
    return;
  },
  // TODO: layout obsolete
  word_click_handler: function(d){
    var clicked_words;
    if(!d.clicked){
      clicked_words = this.state.clicked_words.slice(0);
      clicked_words.push(d.key);

      var cloud_filter = crossfilter(this.state.cloud_data[
        this.state.cloud_data.length -1]);
      var keyDimension = cloud_filter.dimension(function(d) { 
        return d.key; 
      });
      console.log("clicked word");
      console.log(d);
      
      var sel_doc = keyDimension.filter(d.key).top(Infinity)[0];
      var sel_docs = [];
      sel_doc.values.forEach(function(doc){
        var hdln_no_stop_words = stop_word_removal(doc.headline
                                                      .toLowerCase());
          hdln_no_stop_words.match(/\S+/g).forEach(function(w){
            sel_docs.push({
              key: w,
              headline: doc.headline,
            });
          });
      });
      console.log("selected docs");
      console.log(sel_docs);
      
      console.log("clicked_words");
      console.log(clicked_words);

      var nested_docs = this.nest_data(sel_docs, 100, clicked_words);
      console.log("nested docs");
      console.log(nested_docs);

      var cl_data = this.state.cloud_data.slice(0);
      cl_data.push(nested_docs);

      this.setState({cloud_data: cl_data,
                     grid_data: this.grid_data(sel_docs),
                     clicked_words: clicked_words
                    });
      this.forceUpdate();
    }else{
      clicked_words = this.state.clicked_words.slice();
      clicked_words.pop();

      var cl_data_len = this.state.cloud_data.length;
      var cloud_data = this.state.cloud_data.slice(0, cl_data_len-1);
      var flatted_data = [];
      cloud_data[cl_data_len-2].forEach(function(d){
       flatted_data = flatted_data.concat(d.values);
      });
      this.setState({cloud_data: cloud_data, 
                     grid_data: this.grid_data(flatted_data),
                     clicked_words: clicked_words
                    });
      d.clicked = false;
      this.forceUpdate();
    }
  },

  render: function() {
    console.log("cloud data");
    console.log(this.state.cloud_data);
    console.log("grid data");
    console.log(this.state.grid_data);
    // TODO: headline filter
    var cloud_data = this.state.cloud_data.slice(0);
    cloud_data = cloud_data.pop();
    console.log("CLOUD LIST");
    console.log(cloud_data);

    return (
      <div className="container">
        <form onSubmit={this.handleSubmit} className="form-group">
          <label className="col-lg-3 control-label">
            start year 
          </label>
          <div className="col-lg-3">
            <input type="number" className="form-control"
              ref="start_year" defaultValue="2014"
              onChange={function(event) {
                  this.props.start_year = event.target.value;
                }.bind(this)
              }
            />
          </div>
            <input type="number" className="form-control" 
              ref="end_year" defaultValue="2014"
              onChange={function(event) {
                  this.props.end_year = event.target.value;
                }.bind(this)
              } 
            />
            <select className="form-control" 
              defaultValue={this.props.news_desk}
              onChange={function(event) {
                          this.props.news_desk = event.target.value;
                       }.bind(this)
             }>
               <option value="National">National</option>
               <option value="Sports">Sports</option>
               <option value="Foreign">Foreign</option>
               <option value="Culture">Culture</option>
               <option value="Society">Society</option>
            </select>
            <input type="submit" bsStyle='primary' 
              value="Submit" />
        </form>
          <div className="col-lg-6"> 
            <Cloud data={cloud_data}
              callback={this.word_click_handler}/> 
          </div>
          <div className="col-lg-6"> 
            <DataTable className="container" keys={[ 'id', 'article' ]} 
              columns={columns} initialData={this.state.grid_data}
              initialPageLength={5}
              initialSortBy={{ prop: 'article', order: 'desc' }}
              pageLengthOptions={[ 5, 20, 50 ]}
            />
          </div>
        </div>
  );
}
});
React.render(<Application />, document.body);
module.exports = Application;
