let marginLeft = 50,
  marginRight = 50,
  marginTop = 100,
  marginBottom = 100,
  cellWidth = 5,
  cellHeight = 30;

let tooltipDiv = d3.select("body").append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);


d3.json('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
  .then(data => {
    // data.monthlyVariance
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


    svg.selectAll('rect')
      .data(arr)
      .enter()
      .append('rect')
      .attr('x', d => cellWidth * (d.year - minYear) + marginLeft)
      .attr('y', d => cellHeight * (d.month - 1) + marginTop)
      .attr('width', cellWidth)
      .attr('height', cellHeight)
      .attr('fill', (d) => {
        return "hsl(" + d.variance * 360 + ",100%,50%)";
      })
    //*******************************

    //yaxis
    var yScale = d3.scaleOrdinal()
      .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) //months




  })

