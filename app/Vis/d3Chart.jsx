/** @jsx React.DOM */                                                      

var d3 = require('d3');
var d3Chart = {};
//test_data = [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9];
/*
var data = [                                                             
  {date: new Date("10/15/2014"), value: 2},                          
  {date: new Date("10/14/2014"), value: 1},                          
  {date: new Date("10/10/2014"), value: 8},                          
  {date: new Date("10/07/2014"), value: 5},                          
  {date: new Date("10/05/2014"), value: 2},                          
  {date: new Date("10/04/2014"), value: 0},                          
  {date: new Date("10/03/2014"), value: 0},                          
  {date: new Date("10/02/2014"), value: 10},                         
  {date: new Date("10/01/2014"), value: 1},                          
  ];      
*/
require('./d3Chart.less');


d3Chart.create = function(el, props, state) {
  //var svg = d3.select(el).append('svg')
  //    .attr('class', 'd3')
  //    .attr('width', props.width)
  //    .attr('height', props.height);

  //svg.append('g')
  //    .attr('class', 'd3-points');

  //this.update(el, state);
  var width = props.width,
    height = props.height,
    margin = {top: 20, right: 30, bottom: 30, left: 40},
    innerHeight = height - margin.top - margin.bottom,
    innerWidth = width - margin.left - margin.right;

  var svg = d3.select(el).append("svg")
    .attr("width", width)
    .attr("height", height);
    
  var chart = svg.append("g")
    .attr('class', 'chart')
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  this.update(el, state);
  //add the bars
  
};

d3Chart.update = function(el, state) {
  // Re-compute the scales, and render the data points
  this._drawBars(el, state.data);
};

d3Chart.destroy = function(el) {
  // Any clean-up would go here
  // in this example there is nothing to do
};

d3Chart._scales = function(el, domain) {
  if (!domain) {
    return null;
  }

  var width = el.offsetWidth;
  var height = el.offsetHeight;

  var x = d3.scale.linear()
    .range([0, width])
    .domain(domain.x);

  var y = d3.scale.linear()
    .range([height, 0])
    .domain(domain.y);

  var z = d3.scale.linear()
    .range([5, 20])
    .domain([1, 10]);

  return {x: x, y: y, z: z};
};


d3Chart._drawBars = function(el, data) {
  function calcBarHeight(d) {
    return innerHeight - yScale(d.value);
  }
  function calcBarName(d) {
    return (d.date.getDate()) + "/" + (d.date.getMonth() + 1);
  } 
  var width = 500,
          height = 400,
          margin = {top: 20, right: 30, bottom: 30, left: 40},
          innerHeight = height - margin.top - margin.bottom,
          innerWidth = width - margin.left - margin.right;

  var yScale = d3.scale.linear()
          .domain([0, d3.max(data, function (d) {
              return d.value;
          })])
          .range([innerHeight, 0]);
  var xScale = d3.scale.ordinal()
          .domain(data.map(calcBarName))
          .rangeRoundBands([0, innerWidth], 0.05, 0.2);
  var xAxisDef = d3.svg.axis()
          .scale(xScale)
          .orient("bottom");
  var yAxisDef = d3.svg.axis()
          .scale(yScale)
          .orient("left")
          .ticks(5);
  /*
  var g = d3.select(el).selectAll('.d3-points');

  var point = g.selectAll('.d3-point')
    .data(data, function(d) { return d.id; });

  // ENTER
  point.enter().append('circle')
      .attr('class', 'd3-point');

  // ENTER & UPDATE
  point.attr('cx', function(d) { return scales.x(d.x); })
      .attr('cy', function(d) { return scales.y(d.y); })
      .attr('r', function(d) { return scales.z(d.z); });

  // EXIT
  point.exit()
      .remove();

  */

  var chart = d3.select(el).select(".chart");
  chart.select(".y-axis").remove();
  chart.select(".x-axis").remove();

  var bar = chart.selectAll("g")
          .data(data);
  
  bar
    .enter().append("g").append("rect")
    .attr("class", "chart-bar")
    .attr("transform", function (d, i) {
        return "translate(" + xScale(calcBarName(d)) + ",0)";
    })
//fill in the bars with color and do nice rising transition
//setting y at the bottom for the transition effect
    .attr("y", innerHeight) 
      //setting height 0 for the transition effect
    .attr("height", 0)     
    .attr("width", xScale.rangeBand())
    .style("fill", "rgb(234, 229, 229)")
    .transition()
        .duration(700)
        .ease("linear")
        .attr("height", calcBarHeight)
        .attr("y", function(d){return yScale(d.value);})
        .style("fill", "rgb(70, 130, 180)");

    //add the x axis to the chart
  var xAxis = chart.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0," + innerHeight + ")")
    .call(xAxisDef);
   
  //add the y axis to the chart
  var yAxis = chart.append("g")
    .attr("class", "y-axis axis")
    .call(yAxisDef)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("class", "axis-text")
      .attr("y", 10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Entries");

  bar.exit().remove();

};

module.exports = d3Chart;
