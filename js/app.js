/**
 * Created by Iaroslav Zhbankov on 30.01.2017.
 */

var xhr = new XMLHttpRequest();
xhr.open('GET', 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json', false);
xhr.send();
if (xhr.status != 200) {
    alert(xhr.status + ': ' + xhr.statusText);
} else {
    var response = JSON.parse(xhr.responseText);
}
var baseTemp=response.baseTemperature;

var month = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
var margin = {top: 80, right: 90, bottom: 150, left: 80},
    width = 1200 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

var tooltip = d3.select(".graph").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var svg = d3.select(".graph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Coerce the CSV data to the appropriate types.
var data = response.monthlyVariance.map(function(item) {
    var d = {};
    d.date = item.year;
    d.month = item.month;
    d.variance = +item.variance;
    return d;
});
var x = d3.scale.linear().range([0, width]),
    y = d3.scale.linear().range([0, height]),
    z = d3.scale.quantile()
        .domain([d3.min(data, function(d) { return d.variance + baseTemp; }), d3.max(data, function(d) { return d.variance + baseTemp; })])
        .range(["#5A4FA2","#1c80bd","#44c2a4","#8edd96","#e7f589","#fffea9","#fed87b","#fda650","#f46133","#d52e41","#9e0023"]);

// Compute the scale domains.
x.domain(d3.extent(data, function(d) { return d.date}));
y.domain(d3.extent(data, function(d) { return d.month+1; }));

// Extend the x- and y-domain to fit the last bucket.
// For example, the y-bucket 3200 corresponds to values [3200, 3300].
x.domain([x.domain()[0], +x.domain()[1]]);
y.domain([1, y.domain()[1]]);

// Display the tiles for each non-zero bucket.
// See http://bl.ocks.org/3074470 for an alternative implementation.
svg.selectAll(".tile")
    .data(data)
    .enter().append("rect")
    .attr("class", "tile")
    .attr("x", function(d) { return x(d.date); })
    .attr("y", function(d) { return y(d.month); })
    .attr("width", x(1)-x(0))
    .attr("height",  y(1)-y(0))
    .style("fill", function(d) {return z(d.variance+baseTemp); })
    .on("mouseover", function (d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9)
            .style("text-align", "center");
        tooltip.html("<div><h3>" + d.date + "-" + month[d.month] + "</h3></div>" +
            "<div><h4>" + Math.round((d.variance + baseTemp)*1000)/1000 + " &#8451;</h4></div>" +
            "<div><h5>" + Math.round((d.variance)*1000)/1000 + " &#8451;</h5></div>")
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY) + 40 + "px");
    })
    .on("mouseout", function (d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

// Add a legend for the color values.
var legend = svg.selectAll(".legend")
    .data(z.quantiles().map(function(item){return Math.round(item*10)/10}), function(d) {return d;})
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (620 + i*40) + "," + (height + 50) + ")"; });

legend.append("rect")
    .attr("width", 40)
    .attr("height", 20)
    .style("fill", z);

legend.append("text")
    .attr("x", 26)
    .attr("y", 10)
    .attr("class", "legend-text")
    .attr("dy", "2em")
    .attr("dx", "-1em")
    .text(String);

svg.append("text")
    .attr("class", "title")
    .attr("x", width/2-270)
    .attr("y", -60)
    .attr("dy", ".35em")
    .text("Monthly Global Land-Surface Temperature");

svg.append("text")
    .style("font-size", "20px")
    .attr("x", width/2-40)
    .attr("y", -20)
    .attr("dy", ".35em")
    .text("1753-2015");

// Add an x-axis with label.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis().scale(x).tickFormat(function(d){return ((new Date(d.toString())).getFullYear())}).orient("bottom"))
    .append("text")
    .attr("class", "label")
    .attr("x", width/2+50)
    .attr("y", 45)
    .attr("text-anchor", "end")
    .text("Years");


// Add a y-axis with label.
var monthes = svg.selectAll(".monthes")
    .data(month)
    .enter()
    .append("text")
    .text(function(d) {
        return d;
    })
    .attr("x", 0)
    .attr("y", function(d, i) {
        return i * 34.5;
    })
    .style("text-anchor", "end")
    .attr("transform", "translate(-6,-10)")
    .attr("class", "monthLabel scales axis axis-months");

console.log(y);