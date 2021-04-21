const histWidth = $("#stateHist").width();
const histHeight = $("#stateHist").height();
const histMargin = {top: 40, left: 30, bottom: 30, right: 10};

const histClipWidth = histWidth - histMargin.left - histMargin.right;
const histClipHeight = histHeight - histMargin.top - histMargin.bottom;

const rectPadding = 1;
const nBins = 25;

const histSvg = d3.select("#stateHist").append("svg")
    .attr("width", histWidth)
    .attr("height", histHeight)
    .append('g')
    .attr("transform", "translate(" + histMargin.left + "," + histMargin.top + ")");

const histTitle = d3.select("#stateHist > svg")
    .append('text')
    .attr("class", 'rightTitle')
    .text("Country/State Daily Confirmed Histogram");

let histXScale = d3.scaleLinear()
    .range([0, histClipWidth]);

let histYScale = d3.scaleLinear()
    .range([histClipHeight, 0]);

let histXAxis = histSvg.append("g")
    .attr('class', 'axis_x')
    .attr("transform", "translate(" + 0 + "," + histClipHeight + ")");

let histYAxis = histSvg.append('g')
    .attr("class", 'axis_y');

let histrect_g = histSvg.append('g')
    .attr("class", 'hist');

function updateHist(data, container, key, nBins) {
    histXScale.domain(d3.extent(data));

    var histogram = d3.histogram()
        .value(d => d)   // I need to give the vector of value
        .domain(histXScale.domain())  // then the domain of the graphic
        .thresholds(histXScale.ticks(nBins)); // then the numbers of bins

    var bins = histogram(data);
    histYScale.domain([0, d3.max(bins, function(d) { return d.length; })]);

    histXAxis
        .transition()
        .duration(1000)
        .call(
            d3.axisBottom(histXScale)
                .ticks(null, 's')
        );

    histYAxis
        .transition()
        .duration(1000)
        .call(
            d3.axisLeft(histYScale)
                .tickFormat(d3.format("d"))
                .ticks(6)
        );

     // Join the rect with the bins data
    var update = container.selectAll("rect")
        .data(bins);

    // Manage the existing bars and eventually the new ones:
    update
        .enter()
        .append("rect") // Add a new rect for each new elements
        .merge(update) // get the already existing elements as well
        .transition() // and apply changes to all of them
        .duration(1000)
        // .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + histXScale(d.x0) + "," + histYScale(d.length) + ")"; })
        .attr("width", function(d) { return Math.abs(histXScale(d.x1) - histXScale(d.x0) - rectPadding); })
        .attr("height", function(d) { return histClipHeight - histYScale(d.length); })
        .style("fill", key ? stateColorMap[key] : '#555');

    // If less bar in the new histogram, I delete the ones not in use anymore
    update
        .exit()
        .remove()
}

