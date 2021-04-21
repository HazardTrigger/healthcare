const streamHeight = $("#tabview_stream").height(), streamWidth = $("#tabview_stream").width();
const streamMargin = {top: 10, right: 10, bottom: 20, left: 30};
const streamClipHeight = streamHeight - streamMargin.top - streamMargin.bottom;
const streamClipWidth = streamWidth - streamMargin.left - streamMargin.right;

let streamZoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[streamMargin.left, streamMargin.top], [streamClipWidth, streamClipHeight]])
    .on("zoom", streamZoomed);

let streamSvg = d3.select("#tabview_stream")
    .append("svg")
    .attr("width", streamWidth)
    .attr("height", streamHeight)
    .append("g")
    .attr("transform", "translate(" + streamMargin.left + "," + streamMargin.top + ")");

let zoomBackground = streamSvg.append("rect")
    .attr("width", streamWidth)
    .attr("height", streamHeight)
    .style("fill", "none")
    .style("pointer-events", "all")
    .attr("transform", "translate(" + streamMargin.left + "," + streamMargin.top + ")")
    .call(streamZoom);

var streamClipPath = streamSvg.append("defs")
    .append("svg:clipPath")
    .attr("id", "streamClip")
    .append("svg:rect")
    .attr("width", streamClipWidth)
    .attr("height", streamClipHeight)
    .attr("x", 0)
    .attr("y", 0);

let streamXScale = d3.scaleTime()
    // .domain([dateParse('2020-03-24'), dateParse('2020-05-19')])
    .range([0, streamClipWidth])
    .clamp(true);

let streamYScale = d3.scaleLinear()
    .range([streamClipHeight, 0]);

let streamArea = d3.area()
    .x(function (d) {
        return streamXScale(d.data.date);
    })
    .y0(function (d) {
        return streamYScale(d[0]);
    })
    .y1(function (d) {
        return streamYScale(d[1]);
    });

let streamXAxis_g = streamSvg.append("g")
    .attr("class", "axis_x")
    .attr("transform", "translate(0," + streamClipHeight + ")");

let streamYAxis_g = streamSvg.append("g")
    .attr("class", "axis_y");

let stream_g = streamSvg.append("g")
    .attr("class", "stream_g");

let splitline_g = streamSvg.append("g")
    .attr("class", 'splitline_g');


d3.csv("./data/data_processed/american.csv", function (error, data) {
    if (error) throw error;

    originalDataGroupByState = d3.nest()
        .key(d => d.state)
        .rollup(function (values) {
            return {
                sum: d3.sum(values, d => +d.confirmed),
                data: values
            }
        })
        .entries(data)
        .sort((a, b) => b.value.sum - a.value.sum);

    originalDataGroupByDate = d3.nest()
        .key(d => d.date)
        .entries(data);

    console.log(originalDataGroupByDate)

    initHistData = originalDataGroupByDate.map(function (date) {
        return d3.sum(date.values, d => +d.confirmed);
    });

    initDeathRate = originalDataGroupByDate.map(function (date) {
        return {
            date: dateParse(date.key),
            value: d3.sum(date.values, d => +d.death) / d3.sum(date.values, d => +d.confirmed)
        };
    });

    originalGroupByStateForHist = d3.nest()
        .key(d => d.state)
        .key(d => d.date)
        .rollup(function (values) {
            return d3.sum(values, d => +d.confirmed);
        })
        .object(data);

    originalGroupByStateForDeathrate = d3.nest()
        .key(d => d.state)
        .key(d => d.date)
        .rollup(function (values) {
            return d3.sum(values, d => +d.death) / d3.sum(values, d => +d.confirmed);
        })
        .object(data);

    originalDataGroupByCounty = d3.nest()
        .key(d => d.state)
        .key(d => d.county)
        .rollup(function (values) {
            return +values[values.length - 1].confirmed;
        })
        .entries(data);

    initLollipop = originalDataGroupByCounty.map(function (state) {
        return {
            key: state.key,
            value: d3.sum(state.values, d => d.value)
        };
    }).sort((a, b) => b.value - a.value);

    let tmpData = {};
    originalDataGroupByCounty.forEach(function (c) {
        tmpData[c.key] = c.values;
    });
    originalDataGroupByCounty = tmpData;

    updateLollipop(initLollipop, null);
    updateHist(initHistData, histrect_g, null, 20);
    updateDeathRate(initDeathRate, null);

    transformStreamData(d3.keys(zoomMap), 'confirmed');
    renderColumnLayer(originalDataGroupByDate[originalDataGroupByDate.length - 1].values);
    renderHeatmap(originalDataGroupByDate[originalDataGroupByDate.length - 1].values);
});


function buildStream(plotData, keys, container, key) {
    let stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
        // .offset(d3.stackOffsetSilhouette);


    let series = stack(plotData);
    originalSeries = series;

    streamXScale
        .domain(d3.extent(plotData, d => d.date));

    streamYScale
        .domain([
            d3.min(series, function (a) {
                return d3.min(a, function (d) {
                    return d[0]
                })
            }),
            d3.max(series, function (a) {
                return d3.max(a, function (d) {
                    return d[1]
                })
            })
        ]);

    streamXAxis_g
        .transition()
        .duration(1000)
        .call(d3.axisBottom(streamXScale));

    streamYAxis_g
        .transition()
        .duration(1000)
        .call(
            d3.axisLeft(streamYScale)
                .tickSize(2)
                .ticks(6, 's')
        );

    updateStream(series, container, key);
}

function updateStream(data, container, key) {
    let update = container.selectAll(".countryStream").data(data),
        enter = update.enter(),
        exit = update.exit();

    update
        .transition()
        .duration(500)
        .style("fill", d => stateColorMap[d.key])
        .style("opacity", 0.6)
        .attrTween("d", function (d) {
            let previous = d3.select(this).attr("d");
            let current = streamArea(d);
            return d3.interpolatePath(previous, current);
        });

    enter
        .append("path")
        .on("mouseover", onMouseover)
        .on("mouseout", onMouseout)
        .on("click", onClick)
        // .on("mouseup", onMouseUp)
        .attr("class", "countryStream")
        .style("clip-path", "url(#streamClip)")
        .style("opacity", 0.6)
        .transition()
        .duration(500)
        .attrTween("d", function (d) {
            let previous = d3.select(this).attr("d");
            let current = streamArea(d);
            return d3.interpolatePath(previous, current);
        })
        .style("fill", d => stateColorMap[d.key])
        .style("stroke-width", '1px');

    exit
        .style("opacity", 0)
        .remove();

    function onClick(d) {
        if (d3.event.ctrlKey || d3.event.metaKey) {
            if (selectedState.indexOf(d.key) < 0) {
                selectedState.push(d.key);
            }
            d3.select(this).style("opacity", 1);
            if (selectedState.length === 2) {
                streamZoom.on('zoom', null);
                transformStreamData(selectedState, key);
            }
        }
    }


    function onMouseover(d) {
        d3.select(this)
            .style("opacity", 1);

        updateLollipop(originalDataGroupByCounty[d.key], d.key);
        updateHist(d3.values(originalGroupByStateForHist[d.key]), histrect_g, d.key, nBins);
        updateDeathRate(d3.entries(originalGroupByStateForDeathrate[d.key]), d.key);

        d3.select("#streamTooltip")
            .style("display", "block")
            .style("transform", "translate(" + d3.event.x + "px," + d3.event.y + "px)")
            .html(function () {
                return d.key;
            })
    }

    function onMouseout(d) {
        d3.select(this)
            .style("opacity", 0.6);

        updateLollipop(initLollipop, null);
        updateHist(initHistData, histrect_g, null, 20);
        updateDeathRate(initDeathRate, null);

        d3.select("#streamTooltip")
            .style("display", "none")
    }
}

function streamBindDataTransform(countryStream) {
    let key = countryStream.key;
    let eachStream = countryStream.map(function (d) {
        return {
            date: d.data.date,
            originalData: d.data.originalData
                .filter(d => d.state === key)
                .map(d => {
                    return {
                        state: d.state,
                        county: d.county,
                        lat: +d.lat,
                        lon: +d.lon,
                        cases: +d.confirmed
                    }
                })
        };
    });
    eachStream['key'] = key;
    eachStream['color'] = stateColorMap[key];
    return eachStream;
}

function streamZoomed() {
    let transform = d3.event.transform;
    let zoom = Math.round(transform.k);
    let series = zoomFilterStream(zoom);
    let seriesKeys = series.map(d => d.key);
    let plotData = series[0].map(d => d.data);
    zoomUpdateStream(plotData, stream_g, seriesKeys, currentKey);
}

function zoomFilterStream(zoom) {
    let start = (zoom - 1) * 6;
    return originalSeries.slice(start, originalSeries.length);
}

function zoomUpdateStream(plotData, container, keys, key) {
    let stack = d3.stack()
        .keys(keys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    let series = stack(plotData);

    streamYScale
        .domain([
            d3.min(series, function (a) {
                return d3.min(a, function (d) {
                    return d[0]
                })
            }),
            d3.max(series, function (a) {
                return d3.max(a, function (d) {
                    return d[1]
                })
            })
        ]);

    streamYAxis_g
        .transition()
        .duration(500)
        .call(
            d3.axisLeft()
                .scale(streamYScale)
                .tickSize(2)
                .ticks(6, 's')
        );

    updateStream(series, container, key);
}
