let histWidth = $('#hist').width(),
    histHeight = $('#hist').height(),
    histMargin = {top: 10, left: 30, bottom: 20, right: 10},
    histClipWidth = histWidth - histMargin.left - histMargin.right,
    histClipHeight = histHeight - histMargin.top - histMargin.bottom,
    binPadding = 1, nBins = 25;

let histSvg = d3.select('#hist').append('svg')
    .attr('width', histWidth)
    .attr('height', histHeight)
    .append('g')
    .attr('transform', `translate(${histMargin.left}, ${histMargin.top})`);

let histXScale = d3.scaleLinear()
    .range([0, histClipWidth]);

let histYScale = d3.scaleLinear()
    .range([ histClipHeight, 0]);

let hist_g = histSvg.append('g')
    .attr('class', 'hist_g');

let histXAxis = histSvg.append("g")
    .attr('class', 'x-axis')
    .attr("transform", `translate(0, ${histClipHeight})`);

let histYAxis = histSvg.append('g')
    .attr("class", 'y-axis');

let histGs = {
    hist_g: hist_g,
    xaxis: histXAxis,
    yaxis: histYAxis
};

function drawHist(gs, data, key, xScale, yScale, nBins) {
    let bins = d3.bin()
        .thresholds(nBins)
        (data);

    xScale.domain([bins[0].x0, bins[bins.length - 1].x1]);
    yScale.domain([0, d3.max(bins, d => d.length)]).nice();

    gs.xaxis
        .transition()
        .duration(500)
        .call(
            d3.axisBottom(xScale)
                .tickSizeOuter(0)
        );

    gs.yaxis
        .transition()
        .duration(500)
        .call(
            d3.axisLeft(yScale)
        );

    gs.hist_g.selectAll('rect')
        .data(bins)
        .join(
            enter => enter.append('rect')
                .transition()
                .duration(500)
                .attr("fill", key ? stateColorMap[key] : '#555')
                .attr('x', d => xScale(d.x0) + binPadding)
                .attr('y', d => yScale(d.length))
                .attr('width', d => xScale(d.x1) - xScale(d.x0) - binPadding)
                .attr('height', d => yScale(0) - yScale(d.length))
                .selection(),
            update => update
                .transition()
                .duration(500)
                .attr("fill", key ? stateColorMap[key] : '#555')
                .attr('x', d => xScale(d.x0) + binPadding)
                .attr('y', d => yScale(d.length))
                .attr('width', d => xScale(d.x1) - xScale(d.x0) - binPadding)
                .attr('height', d => yScale(0) - yScale(d.length))
                .selection(),
            exit => exit.remove()
        )
}

