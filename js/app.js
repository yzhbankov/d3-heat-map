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
var margin = {top: 20, right: 90, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([0, height]),
    z = d3.scale.linear()
        .range([d3.rgb("#0906f6"), d3.rgb("#FFA500"), d3.rgb("#FF0000")])
        .domain([0, 0.5, 1]);

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

// Compute the scale domains.
x.domain(d3.extent(data, function(d) { return d.date}));
y.domain(d3.extent(data, function(d) { return d.month; }));
z.domain([0, d3.max(data, function(d) { return d.variance + baseTemp; })]);

// Extend the x- and y-domain to fit the last bucket.
// For example, the y-bucket 3200 corresponds to values [3200, 3300].
x.domain([x.domain()[0], +x.domain()[1]]);
y.domain([y.domain()[0], y.domain()[1]]);

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
    .style("fill", function(d) { return z(d.variance+baseTemp); });

// Add a legend for the color values.
var legend = svg.selectAll(".legend")
    .data(z.ticks(20).reverse())
    .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(" + (width + 20) + "," + (20 + i * 20) + ")"; });

legend.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .style("fill", z);
console.log(z(0.5));
legend.append("text")
    .attr("x", 26)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text(String);

svg.append("text")
    .attr("class", "label")
    .attr("x", width + 20)
    .attr("y", 10)
    .attr("dy", ".35em")
    .text("Count");

// Add an x-axis with label.
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis().scale(x).ticks(d3.time.months).tickFormat(formatDate).orient("bottom"))
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .attr("text-anchor", "end")
    .text("Date");

// Add a y-axis with label.
svg.append("g")
    .attr("class", "y axis")
    .call(d3.svg.axis().scale(y).orient("left"))
    .append("text")
    .attr("class", "label")
    .attr("y", 6)
    .attr("dy", ".71em")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .text("Value");
