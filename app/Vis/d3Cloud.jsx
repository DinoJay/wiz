/** @jsx React.DOM */              

var d3 = require('d3');
var d3_cloud = require('Vis/d3.layout.cloud');
var d3Cloud = {};
var $ = require('jquery');
var fill = d3.scale.category20();                                          

/* TESTING */
var test_data = ["Hello", "world", "normally", "you", "want", 
                   "more", "words",
                   "than", "this"].map(function(d) {
        return {text: d, size: 10 + Math.random() * 90};
      });

  d3Cloud.create = function(el, state, callback) { 
        //TODO: props to include as arg
  d3.select(el).append("svg")
    .attr("width", 500)
    .attr("height", 500)
  .append("g")
  .attr("transform", "translate(250,250)");
  
  this.update(el, state, callback);
};

d3Cloud.update = function(el, state, callback){
  
  var cloud_layout = d3_cloud.cloud().size([500, 500])
    .words(state.data)
    .padding(1)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .text(function(d) { return d.key; })
    .fontSize(function(d) { return d.size; })
  .on("end", function(d){
      this.new_draw(d, callback, cloud_layout);
    }.bind(this))
    .start();
};

d3Cloud.new_draw = function(words, callback, cloud_layout){
  var cloud = d3.select("g").selectAll("g text")
                        .data(words, function(d) { return d.text; });
  //Entering words
  // TODO: Cloud layout obsolete
  cloud.enter()
    .append("text")
    .on("click", function(d) {
      callback(d, cloud_layout);
    })
    .style("font-family", "Impact")
    .style("fill", function(d, i) { return fill(i); })
    .attr("text-anchor", "middle")
    .attr('font-size', 1)
    .text(function(d) { return d.key; });

  //Entering and existing words
  cloud
    .transition()
        .duration(200)
        .style("font-size", 
               function(d) { return d.size + "px"; })
        .attr("transform", function(d) {
          return ("translate(" + [d.x, d.y] + ")rotate(" + 
                  d.rotate + ")");
        })
        .style("fill-opacity", 1);

  //Exiting words
  cloud.exit()
    .transition()
      .duration(200)
      .style('fill-opacity', 1e-6)
      .attr('font-size', 1)
      .remove(); 
};

module.exports = d3Cloud;
