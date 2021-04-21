const deathRateWidth = $("#deathRate").width();
const deathRateHeight = $("#deathRate").height();
const deathRateMargin = {top: 40, left: 40, bottom: 30, right: 10};

const deathRateClipWidth = deathRateWidth - deathRateMargin.left - deathRateMargin.right;
const deathRateClipHeight = deathRateHeight - deathRateMargin.top - deathRateMargin.bottom;

const deathRateSvg = d3.select("#deathRate").append("svg")
    .attr("width", deathRateWidth)
    .attr("height", deathRateHeight)
    .append('g')
    .attr("transform", "translate(" + deathRateMargin.left + "," + deathRateMargin.top + ")");

const deathRateTitle = d3.select("#deathRate > svg")
    .append('text')
    .attr("class", 'rightTitle')
    .text("Country/State Daily Death Ratio");

let deathRateXScale = d3.scaleTime()
    .range([0, deathRateClipWidth]);

let deathRateYScale = d3.scaleLinear()
    .range([deathRateClipHeight, 0]);

let deathRateXAxis = deathRateSvg.append('g')
    .attr("class", 'axis_x')
    .attr("transform", "translate(" + 0 + "," + deathRateClipHeight + ")");

let deathRateYAxis = deathRateSvg.append('g')
    .attr("class", 'axis_y');

let deathRateArea_g = deathRateSvg.append('g')
    .attr("class", 'deathRateArea_g');

let deathRateLine_g = deathRateSvg.append('g')
    .attr("class", 'deathRateLine_g');

let deathRateCircles_g = deathRateSvg.append('g')
    .attr("class", 'deathRateCircles_g');

function updateDeathRate(data, key) {
    if (key) {
        data = data.map(function (d) {
            return {
                date: dateParse(d.key),
                value: d.value
            };
        });
    }

    deathRateXScale.domain(d3.extent(data, d => d.date));
    deathRateYScale.domain(d3.extent(data, d => d.value));

    deathRateXAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(deathRateXScale));

    deathRateYAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(deathRateYScale));

    let area = d3.area()
        .x(d => deathRateXScale(d.date))
        .y0(deathRateClipHeight)
        .y1(d => deathRateYScale(d.value))
        .curve(d3.curveBasis);

    // let line = d3.line()
    //     .x(d => deathRateXScale(d.date))
    //     .y(d => deathRateYScale(d.value));

    updateArea(data, key, area);
    // updateLine(data, key, line);
    // updateCircles(data, key);

}

function updateArea(data, key, area) {
    let update = deathRateArea_g.selectAll("path")
        .data([data]);

    update
        .enter()
        .append("path") // Add a new rect for each new elements
        .merge(update) // get the already existing elements as well
        .transition()
        .duration(1000)
        .attr("fill", key ? stateColorMap[key] : '#555')
        .attr("fill-opacity", 1)
        .attr("stroke", "none")
        .attrTween("d", function (d) {
            let previous = d3.select(this).attr("d");
            let current = area(d);
            return d3.interpolatePath(previous, current);
        });

    update
        .exit()
        .remove();
}

function updateLine(data, key, line) {
    let update = deathRateLine_g.selectAll("path")
        .data([data]);

    update
        .enter()
        .append("path") // Add a new rect for each new elements
        .merge(update) // get the already existing elements as well
        .transition()
        .duration(1000)
        .attr("fill", "none")
        .attr("stroke", key ? d3.rgb(stateColorMap[key]).brighter() : '#888')
        .attr("stroke-width", 5)
        .attrTween("d", function (d) {
            let previous = d3.select(this).attr("d");
            let current = line(d);
            return d3.interpolatePath(previous, current);
        });

    update
        .exit()
        .remove();
}

function updateCircles(data, key) {
    let update = deathRateCircles_g.selectAll("circle")
        .data(data);

    update
        .enter()
        .append("circle") // Add a new rect for each new elements
        .merge(update) // get the already existing elements as well
        .attr("fill", "#ccc")
        .attr("stroke", "none")
        .transition()
        .duration(500)
        .attr("cx", d => deathRateXScale(d.date))
        .attr("cy", d => deathRateYScale(d.value))
        .attr("r", 3);

    update
        .exit()
        .remove();
}


