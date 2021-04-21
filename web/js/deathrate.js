let drWidth = $('#rate').width(),
    drHeight = $('#rate').height(),
    drMargin = {left: 40, top: 10, bottom: 20, right: 10},
    drClipWidth = drWidth - drMargin.left - drMargin.right,
    drClipHeight = drHeight - drMargin.top - drMargin.bottom;

let drSvg = d3.select('#rate').append('svg')
    .attr('width', drWidth)
    .attr('height', drHeight)
    .append('g')
    .attr('transform', `translate(${drMargin.left}, ${drMargin.top})`);

let drXScale = d3.scaleTime()
    .range([0, drClipWidth]);

let drYScale = d3.scaleLinear()
    .range([drClipHeight, 0]);

let drArea_g = drSvg.append('g')
    .attr('class', 'drArea_g');

let drXAxis = drSvg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${drClipHeight})`);

let drYAxis = drSvg.append('g')
    .attr('class', 'y-axis');

let drGs = {
    area_g: drArea_g,
    xaxis: drXAxis,
    yaxis: drYAxis
}

function drawDRArea(gs, data, key, xScale, yScale) {
    xScale.domain(d3.extent(data.keys()));
    yScale.domain([0, d3.max(data.values())]);

    gs.xaxis
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale));

    gs.yaxis
        .transition()
        .duration(500)
        .call(d3.axisLeft(yScale));

    let area = d3.area()
        .x(d => xScale(d[0]))
        .y0(drClipHeight)
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis);

    gs.area_g.selectAll('path')
        .data([[...data.entries()]])
        .join(
            enter => enter.append('path')
                .transition()
                .duration(500)
                .attr("fill", key ? stateColorMap[key] : '#555')
                .attr("fill-opacity", 1)
                .attr("stroke", "none")
                .attr('d', area)
                .selection(),
            update => update
                .transition()
                .duration(500)
                .attr("fill", key ? stateColorMap[key] : '#555')
                .attr("fill-opacity", 1)
                .attr("stroke", "none")
                .attr('d', area)
                .selection(),
            exit => exit.remove()
        )
}