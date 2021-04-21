const flowHistWidth = $(".flowhist").width();
const flowHistHeight = $(".flowhist").height();
const flowHistMargin = {top: 12, left: 30, bottom: 25, right: 5};

const fHistClipWidth = flowHistWidth - flowHistMargin.left - flowHistMargin.right;
const fHistClipHeight = flowHistHeight - flowHistMargin.top - flowHistMargin.bottom;

d3.select("#left-week")
    .attr("transform", "translate(" + fHistClipWidth + "," + (flowHistHeight - 10) + ")");

d3.select("#right-week")
    .attr("transform", "translate(" + fHistClipWidth + "," + (flowHistHeight - 10) + ")");


const leftSvg = d3.select("#left-flowhist > svg")
    .append("g")
    .attr("transform", "translate(" + flowHistMargin.left + "," + flowHistMargin.top + ")");

const rightSvg = d3.select("#right-flowhist > svg")
    .append("g")
    .attr("transform", "translate(" + flowHistMargin.left + "," + flowHistMargin.top + ")");

var leftHistXScale = d3.scaleBand()
    .range([0, fHistClipWidth - 30])
    .padding(0.2);

var leftHistYScale =  d3.scaleLinear()
    .range([fHistClipHeight, 0]);

var rightHistXScale = d3.scaleBand()
    .range([0, fHistClipWidth - 30])
    .padding(0.2);

var rightHistYScale =  d3.scaleLinear()
    .range([fHistClipHeight, 0]);

var leftXAxis = d3.axisBottom(leftHistXScale);
var leftYAxis = d3.axisLeft(leftHistYScale)
    .tickSize(2)
    .ticks(6);

var rightXAxis = d3.axisBottom(rightHistXScale);
var rightYAxis = d3.axisLeft(rightHistYScale)
     .tickSize(2)
     .ticks(6);

var leftXAxis_g = leftSvg.append('g')
    .attr("class", 'axis_x')
    .attr("transform", "translate(" + 0 + "," + fHistClipHeight + ")");
var leftYAxis_g = leftSvg.append('g')
    .attr("class", 'axis_y');

var rightXAxis_g = rightSvg.append('g')
    .attr("class", 'axis_x')
    .attr("transform", "translate(" + 0 + "," + fHistClipHeight + ")");
var rightYAxis_g = rightSvg.append('g')
    .attr("class", 'axis_y');

var leftStateTitle_g = leftSvg.append("g")
    .attr("class", 'stateTitle')
    .attr("transform", "translate(" + (fHistClipWidth / 2 - 35) + "," + "0)");
var rightStateTitle_g = rightSvg.append("g")
    .attr("class", 'stateTitle')
    .attr("transform", "translate(" + (fHistClipWidth / 2 - 35) + "," + "0)");


function updateFLowHist(data, g, xScale, yScale, xAxis, yAxis, xAxis_g, yAxis_g, title_g, index, maxY) {
    let stateTitle = [data.map(d => d.state)[0]];
    xScale.domain(data.map(d => d.index));
    yScale.domain([0, maxY]);

    updateStateTitle(stateTitle, title_g);

    xAxis_g
        .call(xAxis)
        .call(g => g.select(".domain").remove());

    yAxis_g
        .call(yAxis);

    let update = g.selectAll(".flowBar")
        .data(data),
        enter = update.enter(),
        exit = update.exit();

    update
        .attr("x", d => xScale(d.index))
        .attr("y", d => yScale(d.rate))
        .attr("width", xScale.bandwidth())
        .attr("height", d => fHistClipHeight - yScale(d.rate))
        .attr("fill", d => stateColorMap[d.state]);

    enter
        .append("rect")
        .attr("id", d => 'flowBar' + d.index)
        .attr("class", 'flowBar')
        .attr("x", d => xScale(d.index))
        .attr("y", d => yScale(d.rate))
        .attr("width", xScale.bandwidth())
        .attr("height", d => fHistClipHeight - yScale(d.rate))
        .attr("fill", d => stateColorMap[d.state])
        .merge(update);

    exit.remove();
}

function updateStateTitle(data, g) {
    let update = g.selectAll(".stateTitle")
        .data(data),
        enter = update.enter(),
        exit = update.exit();

    update
        // .style("color", '#fff')
        .text(d => d);

    enter
        .append("text")
        .attr("class", 'stateTitle')
        // .style("color", '#fff')
        .text(d => d);

    exit.remove();
}
