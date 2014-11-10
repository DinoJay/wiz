/** @jsx React.DOM */              

var d3 = require('d3');
var d3_cloud = require('Vis/d3.layout.cloud');
var d3tooltip = require('d3-tooltip');
var d3Cloud = {};
var $ = require('jquery');

d3Cloud.create = function(el, state, callback, stop_load_screen) { 
  //TODO: props to include as arg
  d3.select(el).append("svg")
    .attr("width", 800)
    .attr("height", 500)
  .append("g")
  .attr("transform", "translate(430,260)");
  
  this.update(el, state, callback, stop_load_screen);
};

d3Cloud.update = function(el, state, callback, stop_load_screen){
  
  var cloud_layout = d3_cloud.cloud().size([800, 500])
    .words(state.data)
    .padding(1)
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .font("Impact")
    .text(function(d) { return d.key; })
    .fontSize(function(d) { return d.size; })
  .on("end", function(d){
      this.new_draw(d, callback, stop_load_screen);
    }.bind(this))
    .start();

};

d3Cloud.new_draw = function(words, callback, stop_load_screen){
  var tooltip = d3tooltip(d3);
  var cloud = d3.select("g").selectAll("g text")
                        .data(words, function(d) { return d.text; });
  //Entering words
  // TODO: Cloud layout obsolete
  cloud.enter()
    .append("text")
    .on("click", function(d) {
      callback(d);
    })
    .on("mouseover", function(d) {
        var html = d.size;

        tooltip.html(html);
        tooltip.show();
      })
      .on("mouseout", function(){
        tooltip.hide();
      })
    .style("font-family", "Impact")
    .attr("text-anchor", "middle")
    .attr('font-size', 1)
    .attr('class', 'Word')
    .text(function(d) { return d.key; });

  //Entering and existing words
  cloud
    .transition()
        .duration(200)
        .style("font-size", 
               function(d) { return d.size + "px"; })
        .style("fill", function(d) {return d.color;})
        .attr("class", "Hover")
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
