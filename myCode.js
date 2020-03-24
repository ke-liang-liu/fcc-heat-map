let marginLeft = 70,
  marginRight = 50,
  marginTop = 100,
  marginBottom = 100,
  cellWidth = 5,
  cellHeight = 35;

let tooltipDiv = d3.select("body").append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("visibility", "hidden")

const formatTime = d3.timeFormat('%B / %Y');

d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(data => {
    // baseTemperature: 8.66
    // data.monthlyVariance (3153)
    // {year: 1778, month: 1, variance: -0.376}

    let arr = data.monthlyVariance;
    let minYear = d3.min(arr, d => d.year);
    let maxYear = d3.max(arr, d => d.year);
    let width = cellWidth * (maxYear - minYear);
    let height = cellHeight * 12;

    let svg = d3.select("body")
      .append("svg")
      .attr("width", width + marginLeft + marginRight)
      .attr("height", height + marginTop + marginBottom);

    //title
    svg.append("text")
      .attr("id", "title")
      .attr("x", (width / 2))
      .attr("y", marginTop / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "30px")
      .text("Monthly Global Land-Surface Temperature");
    svg.append("text")
      .attr("id", "description")
      .attr("x", (width / 2))
      .attr("y", marginTop / 2 + 30)
      .attr("text-anchor", "middle")
      .style("font-size", "20px")
      .text(minYear + ' - ' + maxYear);

    //*******************************

    //yaxis
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var yScale = d3.scaleBand()
      .domain(months)
      .range([0, height])

    var yAxis = d3.axisLeft(yScale)
      .tickSizeOuter(0);

    svg.append('g')
      .classed("axis", true)
      .attr("id", "y-axis")
      .attr("transform", "translate(" + marginLeft + "," + marginTop + ")")
      .call(yAxis);

    // x scale
    var xScale = d3.scaleBand()
      .domain(d3.range(minYear, maxYear))
      .range([0, width]);

    var xAxis = d3.axisBottom(xScale)
      .tickValues(xScale.domain().filter(function (year) {
        return year % 10 === 0;
      }))
      .tickFormat(function (year) {
        var date = new Date(0);
        date.setUTCFullYear(year)  //setFullYear()
        return d3.utcFormat("%Y")(date); //timeFormat()
      })
      .tickSizeOuter(0)

    svg.append('g')
      .classed("axis", true)
      .attr("id", "x-axis")
      .attr("transform", "translate(" + marginLeft + "," + (marginTop + height) + ")")
      .call(xAxis);

    //legend
    var legendColors = ["#FFEBEE", "#FFCDD2", "#EF9A9A", "#E57373", "#EF5350", "#F44336", "#E53935", "#D32F2F", "#C62828", "#B71C1C"];
    // var legendColors = ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"].reverse();
    var legendWidth = 400;
    var legendHeight = 300 / legendColors.length;

    var variance = data.monthlyVariance.map(item => item.variance);

    var minTemperature = data.baseTemperature + d3.min(variance);
    var maxTemperature = data.baseTemperature + d3.max(variance);

    var domainArr = (function (min, max, count) {
      var arrLocal = [];
      var step = (max - min) / count;
      var base = min;
      for (var i = 1; i < count; i++) {
        arrLocal.push(base + i * step);
      }
      return arrLocal;
    })(minTemperature, maxTemperature, legendColors.length)

    var colorThresholdScale = d3.scaleThreshold().domain(domainArr).range(legendColors);

    var legendXLinearScale = d3.scaleLinear()
      .domain([minTemperature, maxTemperature])
      .range([0, legendWidth]);

    var legendXAxis = d3.axisBottom(legendXLinearScale)
      .tickSize(38)
      .tickValues(colorThresholdScale.domain())
      .tickFormat(d3.format(".1f"))
      .tickSizeOuter(27)

    var legend = svg.append("g")
      .classed("legend", true)
      .attr("id", "legend")
      .attr("transform", "translate(" + (marginLeft) + "," + (marginTop + height + marginBottom - 2 * legendHeight) + ")");

    legend.append("g")
      .selectAll("rect")
      .data(colorThresholdScale.range().map(function (color) {
        var d = colorThresholdScale.invertExtent(color);
        if (d[0] == null) d[0] = legendXLinearScale.domain()[0];
        if (d[1] == null) d[1] = legendXLinearScale.domain()[1];
        return d;
      }))
      .enter().append("rect")
      .style("fill", function (d, i) { return colorThresholdScale(d[0]) })
      .attr('x', (d, i) => legendXLinearScale(d[0]))
      .attr('y', 0)
      .attr('width', (d, i) => legendXLinearScale(d[1]) - legendXLinearScale(d[0]))
      .attr('height', legendHeight)

    legend.append("g")
      .attr("transform", "translate(" + 0 + "," + 0 + ")")
      .call(legendXAxis);

    //map rects of each months
    svg.append('g')
      .selectAll('rect')
      .data(arr)
      .enter()
      .append('rect')
      .classed('cell', true)
      .attr('data-month', d => d.month - 1)
      .attr('data-year', d => d.year)
      .attr('data-temp', d => d.variance)
      .attr('x', d => cellWidth * (d.year - minYear) + marginLeft)
      .attr('y', d => cellHeight * (d.month - 1) + marginTop)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', (d) => {
        return colorThresholdScale(data.baseTemperature + d.variance)
      })
      .on('mouseover', d => {
        var date = new Date(d.year, d.month - 1);
        tooltipDiv.transition()
          .duration(200)
          .style('visibility', 'visible');
        tooltipDiv.html(formatTime(date) + '<br/>' + d3.format(".2f")(data.baseTemperature + d.variance) + '&#8451;')
          .style('left', d3.event.pageX + 'px')
          .style('top', d3.event.pageY - 38 + 'px')
          .attr('data-year', d.year)
      })
      .on('mouseout', () => {
        tooltipDiv.transition()
          .duration(500)
          .style('visibility', 'hidden');
      });
  })


