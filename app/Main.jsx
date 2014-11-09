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

var columns = [
  { title: 'Article', prop: 'article'}
];

var id = 0;
// number of api requests to make
var page_limit = 200;

// additional stylesheets
require("./Application.less");

var Application = React.createClass({
  getInitialState: function() {
    return {
      cloud_data: [],
      grid_data: [],
      word_clicked: false
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
  
  nest_data: function(data){
    var nested_data = d3.nest().key(function(d){return d.text;})
                           .entries(data, d3.map);
    nested_data.forEach(function(d){
      d.count = d.values.length;
      d.size = fontSize(d.count/(4));
      console.log(d);
      var context_words = [];

      var pub_dates = [];
      d.values.forEach(function(d){
        pub_dates = pub_dates.concat(d.pub_date);
      });
      d.pub_dates = pub_dates;
      var keywords = [];
      d.values.forEach(function(d){
        keywords = keywords.concat(d.keywords);
      });
    });
    nested_data.sort(function(a, b){return b.count-a.count;});
      return nested_data.slice(0, 150);
  },
  
  grid_data: function(data){
    var grid_data = d3.nest().key(function(d){return d.headline;})
      .entries(data, d3.map);
    grid_data.forEach(function(d){
      d.article = d.key;
      d.id = id++;
      d.key = id;
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
    var spit_data = [];
    Nyt_api.get_data(this.props.start_year, 10, page_limit,
    this.props.news_desk, function(cloud_data){
        var nested_data = this.nest_data(cloud_data);
        clearInterval(t);
        if (this.isMounted()) {
            this.setState({cloud_data: nested_data,
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
        var nested_data = this.nest_data(cloud_data);
        this.replaceState({cloud_data: nested_data,
                           init_cloud_data: nested_data,
                           grid_data: this.grid_data(cloud_data)
                          });
        this.forceUpdate();
        clearInterval(t);
    }.bind(this));
    return;
  },
  // TODO: layout obsolete
  word_click_handler: function(d, layout){
    if(!this.state.clicked){
      alert(d.pub_dates);
      var cloud_filter = crossfilter(this.state.cloud_data);
      var keyDimension = cloud_filter.dimension(function(d) { 
        return d.key; 
      });
      console.log(d);
      
      var sel_docs = [];
      d.values.forEach(function(doc){
        doc.context_words.forEach(function(word){
          var sel_doc = keyDimension.filter(word).top(Infinity)[0];
          if (sel_doc) sel_docs.push(sel_doc);
        });
      });
      console.log("selected docs");
      console.log(sel_docs);
      
      var other_words = [];

      var nested_docs = d3.nest().key(function(d){return d.text;})
                                 .entries(sel_docs, d3.map);
      console.log("nested docs");
      console.log(nested_docs);
      nested_docs.forEach(function(d){
        d.size = 15 + d.values.length * 10;
      });
      var sel_articles = [];
      nested_docs.forEach(function(doc){
        doc.values.forEach(function(d){
          d.values.forEach(function(d){ 
            d.article = d.headline;
            sel_articles.push(d);
          });
        });
      });

      console.log("selected articles");
      console.log(sel_articles);
      this.setState({cloud_data: nested_docs,
                     init_cloud_data: this.state.cloud_data,
                     init_grid_data: this.state.grid_data,
                     grid_data: sel_articles,
                     clicked: true
                    });
      this.forceUpdate();
    }else{
      this.setState({cloud_data:this.state.init_cloud_data, 
                     grid_data: this.state.init_grid_data,
                     clicked:false
                    });
      this.forceUpdate();
    }
  },

  render: function() {
    console.log("cloud data");
    console.log(this.state.cloud_data);
    console.log("grid data");
    console.log(this.state.grid_data);
    // TODO: headline filter
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
              } />
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
            <Cloud data={this.state.cloud_data}
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
