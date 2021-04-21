const lollipopWidth = $("#rankLollipop").width();
const lollipopHeight = $("#rankLollipop").height();
const lollipopMargin = {top: 50, right: 10, bottom: 50, left: 35};

const lollipopClipWidth = lollipopWidth - lollipopMargin.left - lollipopMargin.right;
const lollipopClipHeight = lollipopHeight - lollipopMargin.top - lollipopMargin.bottom;

const lollipopSvg = d3.select("#rankLollipop").append('svg')
    .attr("width", lollipopWidth)
    .attr("height", lollipopHeight)
    .append('g')
    .attr("transform", "translate(" + lollipopMargin.left + "," + lollipopMargin.top + ")");

const lollipopTitle = d3.select("#rankLollipop > svg")
    .append('text')
    .attr("class", 'rightTitle')
    .text("State/County Rank");

let lollipopXScale = d3.scaleBand()
    .range([0, lollipopClipWidth]);

let lollipopYScale = d3.scaleLinear()
    .range([lollipopClipHeight, 0]);

let lollipopXAxis = lollipopSvg.append('g')
    .attr('class', 'axis_x')
    .attr("transform", "translate(" + 0 + "," + lollipopClipHeight + ")");

let lollipopYAxis = lollipopSvg.append('g')
    .attr("class", 'axis_y');

let lollipopStick_g = lollipopSvg.append('g')
    .attr("class", 'lollipopStick_g');

let lollipopCircle_g = lollipopSvg.append('g')
    .attr("class", 'lollipopCircle_g');

let lollipopNumber_g = lollipopSvg.append('g')
    .attr("class", 'lollipopNumber_g');

function updateLollipop(data, key) {
    data.sort((a, b) => b.value - a.value);

    let xExtent = d3.extent(data, d => d.value);
    lollipopYScale.domain([xExtent[0], xExtent[1]]);
    data = data.slice(0, 20);
    lollipopXScale.domain(data.map(d => d.key));

    lollipopXAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(lollipopXScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", '8px');

    lollipopYAxis
        .transition()
        .duration(1000)
        .call(
            d3.axisLeft(lollipopYScale)
                .tickSize(3)
                .ticks(null, 's')
        );

    updateStick(data, key);
    updateLollipopCircles(data, key);
    updateCountyNumber(data, key);
}

function updateStick(data, key) {
    let update = lollipopStick_g.selectAll(".stick")
        .data(data);

    update
        .enter().append("line") // Add a new rect for each new elements
        .attr("class", 'stick')
        .merge(update) // get the already existing elements as well
        .attr("x1", d => lollipopXScale(d.key) + lollipopXScale.bandwidth() / 2)
        .attr("x2", d => lollipopXScale(d.key) + lollipopXScale.bandwidth() / 2)
        .attr("y1", lollipopClipHeight)
        .attr("stroke", key ? stateColorMap[key] : '#fff')
        .transition()
        .duration(1000)
        .attr("y2", d => lollipopYScale(d.value));

    update
        .exit()
        .remove();
}

function updateLollipopCircles(data, key) {
    let update = lollipopCircle_g.selectAll(".pop")
        .data(data);

    update
        .enter().append("circle") // Add a new rect for each new elements
        .attr("class", 'pop')
        .merge(update) // get the already existing elements as well
        .attr("fill", key ? stateColorMap[key] : '#fff')
        .attr("stroke", "none")
        .attr("cx", d => lollipopXScale(d.key) + lollipopXScale.bandwidth() / 2)
        .transition()
        .duration(1000)
        .attr("cy", d => lollipopYScale(d.value))
        .attr("r", 4);

    update
        .exit()
        .remove();
}

function updateCountyNumber(data, key) {
    let update = lollipopNumber_g.selectAll('text')
        .data(data);

    update
        .enter().append('text')
        .merge(update)
        .attr("fill", key ? stateColorMap[key] : '#fff')
        .attr("x", d => lollipopXScale(d.key) + lollipopXScale.bandwidth() / 2)
        .attr("dy", '-1em')
        .style("text-anchor", "middle")
        .style("font-size", '8px')
        .transition()
        .duration(1000)
        .attr("y", d => lollipopYScale(d.value))
        .text(d => d3.format(',d')(Math.round(d.value)));

    update
        .exit()
        .remove();

}
