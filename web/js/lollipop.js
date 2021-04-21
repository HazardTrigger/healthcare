let lollipopWidth = $('#lollipop').width(),
    lollipopHeight = $('#lollipop').height(),
    lollipopMargin = {left: 30, top: 20, bottom: 50, right: 10},
    lollipopClipWidth = lollipopWidth - lollipopMargin.left - lollipopMargin.right,
    lollipopClipHeight = lollipopHeight - lollipopMargin.top - lollipopMargin.bottom;

let lollipopSvg = d3.select('#lollipop').append('svg')
    .attr('width', lollipopWidth)
    .attr('height', lollipopHeight)
    .append('g')
    .attr('transform', `translate(${lollipopMargin.left}, ${lollipopMargin.top})`);

let lollipopXScale = d3.scaleBand()
    .range([0, lollipopClipWidth]);

let lollipopYScale = d3.scaleLinear()
    .range([lollipopClipHeight, 0]);

let lollipopStick_g = lollipopSvg.append('g')
    .attr("class", 'lollipopStick_g');

let lollipopCircle_g = lollipopSvg.append('g')
    .attr("class", 'lollipopCircle_g');

let lollipopNumber_g = lollipopSvg.append('g')
    .attr("class", 'lollipopNumber_g');

let lollipopXAxis = lollipopSvg.append('g')
    .attr('class', 'x-axis')
    .attr("transform", `translate(0, ${lollipopClipHeight})`);

let lollipopYAxis = lollipopSvg.append('g')
    .attr("class", 'y-axis');

let lollipopGs = {
    stick: lollipopStick_g,
    circle: lollipopCircle_g,
    count: lollipopNumber_g,
    xaxis: lollipopXAxis,
    yaxis: lollipopYAxis
}

function lollipopDataTransform(data) {
    return d3.rollup(data, v => v[v.length - 1].confirmed, d => d.state, d => d.county)
}

function drawLollipop(gs, data, key, xScale, yScale) {
    data = key ? new Map([...data.get(key).entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) : new Map([...data.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20));
    xScale.domain(data.keys());
    yScale.domain(d3.extent(data.values()));

    gs.xaxis
        .transition()
        .duration(500)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0) rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", '8px');

    gs.yaxis
        .transition()
        .duration(500)
        .call(
            d3.axisLeft(lollipopYScale)
                .tickSize(3)
                .ticks(null, 's')
        );

    drawStick(gs.stick, [...data.entries()], key, xScale, yScale);
    drawCircles(gs.circle, [...data.entries()], key, xScale, yScale);
    drawCount(gs.count, [...data.entries()], key, xScale, yScale)
}

function drawStick(g, data, key, xScale, yScale) {
    g.selectAll('.stick')
        .data(data)
        .join(
            enter => enter.append('line')
                .attr('class', 'stick')
                .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .attr("y1", lollipopClipHeight)
                .attr("stroke", key ? stateColorMap[key] : '#fff')
                .transition()
                .duration(500)
                .attr("y2", d => yScale(d[1]))
                .selection(),
            update => update
                .attr('class', 'stick')
                .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .attr("y1", lollipopClipHeight)
                .attr("stroke", key ? stateColorMap[key] : '#fff')
                .transition()
                .duration(500)
                .attr("y2", d => yScale(d[1]))
                .selection(),
            exit => exit.remove()
        )
}

function drawCircles(g, data, key, xScale, yScale) {
    g.selectAll('.pop')
        .data(data)
        .join(
            enter => enter.append('circle')
                .attr('class', 'pop')
                .attr("fill", key ? stateColorMap[key] : '#fff')
                .attr("stroke", "none")
                .attr("cx", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .transition()
                .duration(500)
                .attr("cy", d => yScale(d[1]))
                .attr("r", 4)
                .selection(),
            update => update
                .attr('class', 'pop')
                .attr("fill", key ? stateColorMap[key] : '#fff')
                .attr("stroke", "none")
                .attr("cx", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .transition()
                .duration(500)
                .attr("cy", d => yScale(d[1]))
                .attr("r", 4)
                .selection(),
            exit => exit.remove()
        )
}

function drawCount(g, data, key, xScale, yScale) {
    g.selectAll('text')
        .data(data)
        .join(
            enetr => enetr.append('text')
                .attr("fill", key ? stateColorMap[key] : '#fff')
                .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .attr("dy", '-1em')
                .style("text-anchor", "middle")
                .style("font-size", '8px')
                .transition()
                .duration(1000)
                .attr("y", d => yScale(d[1]))
                .text(d => d3.format(',d')(Math.round(d[1])))
                .selection(),
            update => update
                .attr("fill", key ? stateColorMap[key] : '#fff')
                .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
                .attr("dy", '-1em')
                .style("text-anchor", "middle")
                .style("font-size", '8px')
                .transition()
                .duration(1000)
                .attr("y", d => yScale(d[1]))
                .text(d => d3.format(',d')(Math.round(d[1])))
                .selection(),
            exit => exit.remove()
        )
}