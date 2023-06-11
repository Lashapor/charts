let attrs = {
  svgWidth: 900,
  svgHeight: 500,
  margin: { top: 20, right: 150, bottom: 120, left: 150 },
  gradientMen: {
    startColor: "#64b8ce",
    endColor: "#1C7389"
  },
  gradientWomen: {
    startColor: "#ffd723",
    endColor: "#DA9401"
  },
  xAxis: {
    range: 50,
    padding: 0.2,
    paddingInner: 0.5,
    paddingOuter: 0.5,
    tickPadding: 20,
    tickSize: 0,
    rotateAngle: -45,
    dx: -10,
    dy: 0,
    fontSize: 16
  },
  yAxis: {
    range: 50,
    tickColor: "#E2E2E2",
    fontSize: 16,
    tickQuantity: 5,
  },
  legend: {
    x: -80,
    y: 330,
    rectSize: 8,
    spacing: 8,
    textBottomPadding: -1

  },
  barWidth: 30
}

let calc = {};

calc.graphWidth = (attrs.svgWidth - attrs.margin.left - attrs.margin.right);
calc.graphHeight = attrs.svgHeight - attrs.margin.top - attrs.margin.bottom;

const svg = d3
  .select(".bar-chart")
  .append("svg")
  .attr("width", attrs.svgWidth)
  .attr("height", attrs.svgHeight);

const graph = svg
  .append("g")
  .attr("width", calc.graphWidth)
  .attr("height", calc.graphHeight)
  .attr("transform", `translate(${attrs.margin.left}, ${attrs.margin.top})`);

// Gradient color for men's bar
let gradientMen = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradientMen")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "0%")
  .attr("y2", "100%")

gradientMen.append("stop")
  .attr("class", "start")
  .attr("offset", "0%")
  .attr("stop-color", attrs.gradientMen.startColor)
  .attr("stop-opacity", 1);

gradientMen.append("stop")
  .attr("class", "end")
  .attr("offset", "100%")
  .attr("stop-color", attrs.gradientMen.endColor)
  .attr("stop-opacity", 1)

// Gradient color for women's bar

let gradientWomen = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradientWomen")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("y1", "0%")
  .attr("y2", "100%")

gradientWomen.append("stop")
  .attr("class", "start")
  .attr("offset", "0%")
  .attr("stop-color", attrs.gradientWomen.startColor)
  .attr("stop-opacity", 1)

gradientWomen.append("stop")
  .attr("class", "end")
  .attr("offset", "100%")
  .attr("stop-color", attrs.gradientWomen.endColor)
  .attr("sstop-opacity", 1)

d3.json("./assets/data/women-pay.json").then((data) => {
  womenPayChart(data)
})

function womenPayChart(data) {
  data = data.records.map(function (d) {
    return {
      ...d,
      menPercentage: d.men * 100 / (d.men + d.women),
      womenPercentage: d.women * 100 / (d.men + d.women)
    }
  })

  // y Scale
  const y = d3
    .scaleLinear()
    .domain([0, 100])
    .range([calc.graphHeight, 0]);

  const names = d3.map(data, d => d.name);

  const x = d3
    .scaleBand()
    .domain(names)
    .range([0, calc.graphWidth + attrs.xAxis.range])
    .padding([attrs.xAxis.padding])
    .paddingInner([attrs.xAxis.paddingInner])
    .paddingOuter([attrs.xAxis.paddingOuter])
    .align([0.5])

  // join men data to rects
  graph
    .selectAll(".men-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "men-bar")
    .attr("width", attrs.barWidth)
    .attr("height", (d) => (calc.graphHeight - y(d.menPercentage)))
    .attr("fill", "url(#gradientMen)")
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.menPercentage));

  // join women data to rects
  graph
    .selectAll(".women-bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "women-bar")
    .attr("width", attrs.barWidth)
    .attr("height", (d) => (calc.graphHeight - y(d.womenPercentage)))
    .attr("fill", "url(#gradientWomen)")
    .attr("x", (d) => x(d.name) + attrs.barWidth)
    .attr("y", (d) => y(d.womenPercentage));

  // create x axis and call
  const xAxis = d3.axisBottom(x).tickPadding(attrs.xAxis.tickPadding);

  // remove tick lines
  xAxis.tickSize(attrs.xAxis.tickSize);

  // create x axis and call
  const xAxisGroup = graph
    .append("g")
    .attr("class", "axis-group")
    .attr("transform", `translate(0, ${calc.graphHeight})`)
    .attr("id", "x-axis")
    .call(xAxis);

  // Rotate x-axis labels
  xAxisGroup
    .selectAll("text")
    .attr("transform", `rotate(${attrs.xAxis.rotateAngle})`)
    .style("text-anchor", "end")
    .attr("dx", attrs.xAxis.dx + "px")
    .attr("dy", attrs.xAxis.dy + "px")
    .attr("font-size", attrs.xAxis.fontSize)
    .attr("class", "x-axis-group")

  // Update y axis tick format to display as percentage
  const yAxis = d3.axisLeft(y).tickFormat(d => d + " %").ticks(attrs.yAxis.tickQuantity);

  // create y axis and call
  const yAxisGroup = graph
    .append("g")
    .attr("id", "y-axis")
    .call(yAxis);

  // Add lines to the y-axis at every 10% interval
  yAxisGroup
    .selectAll(".tick")
    .append("line")
    .attr("class", "lines")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", calc.graphWidth + attrs.yAxis.range)
    .attr("y2", 0)
    .attr("stroke", attrs.yAxis.tickColor)

  yAxisGroup
    .selectAll("text")
    .attr("font-size", attrs.yAxis.fontSize)
    .attr("class", "y-axis-group")

  yAxisGroup.lower();

  // Add legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${attrs.svgWidth + attrs.legend.x}, ${attrs.legend.y})`);

  // Add "men" legend item
  legend.append("rect")
    .attr("width", attrs.legend.rectSize)
    .attr("height", attrs.legend.rectSize)
    .attr("fill", "url(#gradientMen)")

  legend.append("text")
    .attr("x", attrs.legend.rectSize + attrs.legend.spacing)
    .attr("y", attrs.legend.rectSize - attrs.legend.textBottomPadding)
    .text("Men");

  // Add "women" legend item
  legend.append("rect")
    .attr("width", attrs.legend.rectSize)
    .attr("height", attrs.legend.rectSize)
    .attr("fill", "url(#gradientWomen)")
    .attr("y", attrs.legend.rectSize + attrs.legend.spacing);

  legend.append("text")
    .attr("x", attrs.legend.rectSize + attrs.legend.spacing)
    .attr("y", 2 * attrs.legend.rectSize + attrs.legend.spacing - attrs.legend.textBottomPadding)
    .text("Women");
}