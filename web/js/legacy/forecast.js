const forecastWidth = $("#tabview_stream").width();
const forecastHeight = $("#tabview_stream").height();
const forecastMargin = {top: 20, right: 10, bottom: 20, left: 35};

const forecastClipWidth = forecastWidth - forecastMargin.left - forecastMargin.right;
const forecastClipHeight = forecastHeight - forecastMargin.top - forecastMargin.bottom;

let forecastSvg = d3.select("#tabview_forecast")
    .append("svg")
    .attr("width", forecastWidth)
    .attr("height", forecastHeight)
    .append('g')
    .attr("transform", "translate(" + forecastMargin.left + "," + forecastMargin.top + ")");

let forecastClipPath = forecastSvg.append("defs")
    .append("svg:clipPath")
    .attr("id", "forecastClip")
    .append("svg:rect")
    .attr("width", forecastClipWidth)
    .attr("height", forecastClipHeight)
    .attr("x", 0)
    .attr("y", 0);

let forecastXScale = d3.scaleTime()
    .range([0, forecastClipWidth])
    .clamp(true);

let forecastYScale = d3.scaleLinear()
    .range([forecastClipHeight, 0]);

let forecastPath_g = forecastSvg.append('g')
    .attr("class", 'forecastPath_g');

let forecastXAxis_g = forecastSvg.append('g')
    .attr("class", 'axis_x')
    .attr("transform", "translate(0," + forecastClipHeight + ")");

let forecastYAxis_g = forecastSvg.append('g')
    .attr("class", 'axis_y');

let forecastPath = d3.line()
    .x(function (d) {
        return forecastXScale(d.date);
    })
    .y(function (d) {
        return forecastYScale(d.confirmed);
    })
    .curve(d3.curveBasis);


d3.csv("./data/data_processed/forecast.csv", function (error, data) {
    if (error) throw error;
    forecastData = data;
});

function buildForcast(plotData, keys, container) {
    let pathData = plotData.map(d3.values).map(d => d[0]);
    let mergeData = d3.merge(pathData);

    forecastXScale.domain(d3.extent(mergeData, d => d.date));
    forecastYScale.domain(d3.extent(mergeData, d => d.confirmed));

    forecastXAxis_g
        .transition()
        .duration(1000)
        .call(d3.axisBottom(forecastXScale));

    forecastYAxis_g
        .transition()
        .duration(1000)
        .call(
            d3.axisLeft(forecastYScale)
                .ticks(8, 's')
        );

    updateFoecastPath(pathData, container);
}

function updateFoecastPath(data, container) {
    let update = container.selectAll(".forecastPath")
        .data(data),
        enter = update.enter(),
        exit = update.exit();

    update
        .transition()
        .duration(1000)
        .attrTween("d", function (d) {
            let previous = d3.select(this).attr("d");
            let current = forecastPath(d);
            return d3.interpolatePath(previous, current);
        });

    enter
        .append('path')
        .attr("class", 'forecastPath')
        .style("clip-path", "url(#forecastClip)")
        .transition()
        .duration(1000)
        .attrTween("d", function (d) {
            let previous = d3.select(this).attr("d");
            let current = forecastPath(d);
            return d3.interpolatePath(previous, current);
        })
        .style("fill", "none")
        .style("stroke", (d, i) => streamColor(i));

    exit
        .style("opacity", 0)
        .remove();
}
