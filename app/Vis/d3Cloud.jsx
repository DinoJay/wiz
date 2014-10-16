/** @jsx React.DOM */              

var d3 = require('d3');
var d3_cloud = require('Vis/d3.layout.cloud');
var d3Cloud = {};
var fill = d3.scale.category20();                                          

/* TESTING */
var test_data = ["Hello", "world", "normally", "you", "want", 
                   "more", "words",
                   "than", "this"].map(function(d) {
        return {text: d, size: 10 + Math.random() * 90};
      })

d3Cloud.create = function(el, state) { //TODO: props to include as arg
  d3.select("body").append("svg")
    .attr("width", 500)
    .attr("height", 500)
  .append("g")
  .attr("transform", "translate(250,250)")
  
  this.update(el, "", state);
};

d3Cloud.update = function(el, cloud, state){
  console.log("state data");
  console.log(state.data);
  d3_cloud.cloud().size([500, 500])
                .words(test_data)
                .padding(5)
                .rotate(function() { return ~~(Math.random() * 2) * 90; })
                .font("Impact")
                .fontSize(function(d) { return d.size; })
                .on("end", this.new_draw)
                .start();
};

d3Cloud.new_draw = function(words){
  var cloud = d3.select("g").selectAll("g text")
                        .data(words, function(d) { return d.text; })

        //Entering words
        cloud.enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return fill(i); })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) { return d.text; });

        //Entering and existing words
        cloud
            .transition()
                .duration(10)
                .style("font-size", function(d) { return d.size + "px"; })
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
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
