let streamWidth = $('#streamGraph').width(),
    streamHeight = $('#streamGraph').height(),
    streamMargin = {left: 30, top: 10, right: 10, bottom: 20},
    streamClipWidth = streamWidth - streamMargin.left - streamMargin.right,
    streamClipHeight = streamHeight - streamMargin.top - streamMargin.bottom;

let streamSvg = d3.select('#streamGraph').append('svg')
    .attr('width', streamWidth)
    .attr('height', streamHeight)
    .append('g')
    .attr('transform', `translate(${streamMargin.left}, ${streamMargin.top})`);

let streamZoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([0, 0], [streamClipWidth, streamClipHeight])
    .on('zoom', streamZoomed);

let zoomBackground = streamSvg.append("rect")
    .attr('class', 'zoombackground')
    .attr("width", streamClipWidth)
    .attr("height", streamClipHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .call(streamZoom);

let streamXScale = d3.scaleTime()
    .domain(timeDomain)
    .range([0, streamClipWidth])
    .clamp(true);

let streamYScale = d3.scaleLinear()
    .range([streamClipHeight, 0]);

let streamArea = d3.area()
    .x(d => streamXScale(d.data.date))
    .y0(d => streamYScale(d[0]))
    .y1(d => streamYScale(d[1]));

let stream_g = streamSvg.append('g')
    .attr('class', 'stream_g');

let splitline_g = streamSvg.append("g")
    .attr("class", 'splitline_g');

let streamXAxis = streamSvg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${streamClipHeight})`)
    .call(
        d3.axisBottom(streamXScale)
    );

let streamYAxis = streamSvg.append('g')
    .attr('class', 'y-axis');

function streamZoomed(event) {
    let transform = event.transform;
    let zoom = Math.round(transform.k);
    let keys = Object.keys(zoomMap);
    keys = keys.slice((zoom - 1) * 6, keys.length);
    if (!zoomSwitch) {
        drawStream(stream_g, streamData_confirmed, streamYScale, streamYAxis, keys);
    } else {
        drawStream(stream_g, streamData_death, streamYScale, streamYAxis, keys);
    }
}

function streamDataTransform(data, key) {
    return d3.rollups(data, v => d3.sum(v, e => e[key]), d => d.date, d => d.state)
        .map(function ([date, values]) {
            let t = {};
            t['date'] = date;
            values.forEach(function (s) {
                t[s[0]] = s[1];
            });
            return t;
        });
}

function drawStream(g, streamData, yScale, yAxis, keys) {
    let streamStack = d3.stack()
        .keys(keys)
        .offset(d3.stackOffsetNone)
        .order(d3.stackOrderDescending);

    let series = streamStack(streamData);

    updateStream(g, series, yScale, yAxis, streamData);
}

function updateStream(g, series, yScale, yAxis, originalData) {
    yScale.domain([
        d3.min(series, d => d3.min(d, d => d[0])),
        d3.max(series, d => d3.max(d, d => d[1]))
    ]);

    yAxis
        .transition()
        .duration(500)
        .call(
            d3.axisLeft(yScale)
                .tickSize(2)
                .ticks(6, 's')
        );

    g.selectAll('.stream')
        .data(series)
        .join(
            enter => enter.append('path')
                .attr('class', 'stream')
                .transition()
                .duration(500)
                .attr('fill', ({key}) => stateColorMap[key])
                .attr("opacity", 0.6)
                .attr('d', streamArea)
                .selection(),
            update => update
                .attr('class', 'stream')
                .transition()
                .duration(500)
                .attr('fill', ({key}) => stateColorMap[key])
                .attr("opacity", 0.6)
                .attr('d', streamArea)
                .selection(),
            exit => exit.remove()
        )
        .on('click', function (event, d) {
            if (event.ctrlKey || event.metaKey) {
                selectedKeys.push(d.key);
                if (selectedKeys.length === 2) {
                    drawStream(g, _.cloneDeep(originalData), yScale, yAxis, _.cloneDeep(selectedKeys));
                }
            }
        })
        .on('mouseover', function (event, d) {
            d3.select(this).style("opacity", 1);
            d3.select("#streamTooltip")
                .style("display", "block")
                .style("transform", "translate(" + event.x + "px," + event.y + "px)")
                .html(d.key);
            drawLollipop(lollipopGs, lollipopData, d.key, lollipopXScale, lollipopYScale);
            drawHist(histGs, histData.get(d.key).values(), d.key, histXScale, histYScale, nBins);
            drawDRArea(drGs, drData.get(d.key), d.key, drXScale, drYScale);
        })
        .on('mouseout', function (event, d) {
            d3.select(this).style("opacity", 0.6);
            d3.select("#streamTooltip").style("display", "none");
            drawLollipop(lollipopGs, initLollipop, null, lollipopXScale, lollipopYScale);
            drawHist(histGs, initHist.values(), null, histXScale, histYScale, nBins);
            drawDRArea(drGs, initDR, null, drXScale, drYScale);
        })
}

