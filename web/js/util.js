function drawSplitLines(extent, xScale, datePadding, g) {
    let dateRange = extent;
    let dateList = getDateList(dateRange[0], dateRange[1], datePadding).map(xScale);
    let splitLines = dateList.map(xScale.invert);
    updateSplitLines(dateList);

    function updateSplitLines(dateList) {
        g.selectAll(".splitine")
            .data(dateList)
            .join(
                enter => enter.append('line')
                    .attr("class", "splitline")
                    .attr("x1", d => d)
                    .attr("x2", d => d)
                    .attr("y1", streamClipHeight)
                    .attr("y2", streamClipHeight)
                    .transition()
                    .duration(500)
                    .delay((d, i) => i * 80)
                    .attr("y2", -streamClipHeight)
                    .style("stroke", "#fff")
                    .style("stroke-dasharray", "2, 2")
                    .selection(),
                update => update
                    .attr("class", "splitline")
                    .attr("x1", d => d)
                    .attr("x2", d => d)
                    .attr("y1", streamClipHeight)
                    .attr("y2", streamClipHeight)
                    .transition()
                    .duration(500)
                    .delay((d, i) => i * 80)
                    .attr("y2", -streamClipHeight)
                    .style("stroke", "#fff")
                    .style("stroke-dasharray", "2, 2")
                    .selection(),
                exit => exit.remove()
            );
    }

    return splitLines;
}

function getDateList(startDate, stopDate, padding = 7) {
    let sd = new Date(startDate);
    let ed = new Date(stopDate);
    let arr;
    for (arr = []; sd <= ed; sd.setDate(sd.getDate() + padding)) {
        arr.push(new Date(sd))
    }
    return arr;
}

function generateSplitData(splitLines, data) {
    splitLines = d3.pairs(splitLines);
    return data.map(function (state) {
        let color = stateColorMap[state[0].state];
        return splitLines.map(function (tr) {
            let period = state.filter(d => tr[0] <= d.date && d.date <= tr[1]);
            let center = d3.polygonCentroid(period.map(d => [d.lon, d.lat]));
            let tmp = []
            d3.group(period, d => d.county).forEach(function (value, key) {
                tmp.push({
                    dateRange: tr,
                    center: center,
                    state: state[0].state,
                    color: color,
                    lat: d3.mean(value, d => d.lat),
                    lon: d3.mean(value, d => d.lon),
                    weight: d3.sum(value, d => d.cases)
                })
            })
            return tmp;
        })
    });
}

function dataTransformForFlowFiled(data, keys) {
    let tmpData = [];
    keys.forEach(function (state) {
        tmpData.push(
            data.filter(d => d.state === state)
                .map(function (d) {
                    return {
                        state: d.state,
                        county: d.county,
                        date: d.date,
                        lat: d.lat,
                        lon: d.lon,
                        cases: d.confirmed
                    }
                })
        )
    });
    return tmpData;
}

function statisticsShow(check) {
    if (check) {
        d3.selectAll('.statistics').style('display', 'grid');
        d3.select('#right')
            .style('grid-template-columns', '100%')
            .style('overflow', 'hidden')
            .style('grid-template-rows', `repeat(auto-fill, ${100 / 3}%)`);
    } else {
        d3.selectAll('.statistics').style('display', 'none');
        d3.select('#right')
            .style('overflow-x', 'hidden')
            .style('overflow-y', 'scroll')
            .style('grid-template-columns', `repeat(2, 50%)`)
            .style('grid-template-rows', `repeat(16, 25%)`);
    }
}

function splitLineClear() {
    splitline_g.selectAll('*').remove();
}

function drawThumbnail(data, container) {
    container.selectAll('.subFlow')
        .data(data)
        .join(
            enter => enter.append('div')
                .attr('class', 'subFlow divborder'),
            update => update
                .attr('class', 'subFlow divborder'),
            exit => exit.remove()
        )
        .each(function (ef) {
            let center = ef.mapCenter;
            let map = L.map(d3.select(this).node(), {
                center: [center[1], center[0]],
                zoom: 5,
                layers: L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=${accessToken}`),
                zoomControl: false,
                attributionControl: false
            });
            eachFlowTitle(ef.dateRange, d3.select(this))
            drawThumbnailFlow(ef.subflow, map);
        })
        .on('click', function (event, d) {
            flowFieldVis.setValue(true);
            let both = d3.selectAll('.subFlow').data()
                .filter(e => e.index === d.index)
                .map(d => d.mainflow);
            drawMainFlow(mapboxSvg, d3.merge(both), map)
        })
}

function subFlowClear() {
    d3.selectAll('.subFlow').remove();
}

function reorderFlowData(data) {
    return d3.merge(d3.transpose(data));
}

function drawThumbnailFlow(data, map) {
    L.geoJSON(data, {
        pointToLayer: function (feature, latlng) {
            let arrow = feature['properties']['html'];
            let icon_anchor = [feature['properties']['anchor_x'],
                feature['properties']['anchor_y']
            ];
            let div_icon = L.divIcon({
                "className": "quiver",
                "html": arrow,
                "iconAnchor": icon_anchor,
            });
            return L.marker(latlng, {
                icon: div_icon
            });
        }
    }).addTo(map);
}

function eachFlowTitle(data, div) {
    div.append('div')
        .attr('class', 'subflowTime')
        .html(`${data[0]} - ${data[1]}`);
}

function drawMainFlow(svg, data, map) {
    svg.style("display", flowFieldVis.getValue() ? "block": "none");
    svg.selectAll('.arrow')
        .data(data)
        .join(
            enter => enter.append('g')
                .attr('class', 'arrow')
                .attr('transform', d => `translate(${project(d.lnglat).x}, ${project(d.lnglat).y})`),
            update => update
                .attr('class', 'arrow')
                .attr('transform', d => `translate(${project(d.lnglat).x}, ${project(d.lnglat).y})`),
            exit => exit.remove()
        )
        .call(g => drawArrow(g))

    // Update on map interaction
    map.on("pitch", updateloc);
    map.on("pitchned", updateloc);
    map.on("move", updateloc);
    map.on("moveend", updateloc);
    map.on("zoom", updateloc);
    map.on("zoomend", updateloc);

    function updateloc() {
        svg.selectAll(".arrow")
            .attr("transform", function (d) {
                return "translate(" + project(d.lnglat).x + "," + project(d.lnglat).y + ')';
            })
    }

    function drawArrow(g) {
        g.selectAll('path')
            .data(d => [d])
            .join(
                enter => enter.append('path')
                    .attr("fill", d => d.fill)
                    .attr("d", d => d.arrowPath),
                update => update
                    .attr("fill", d => d.fill)
                    .attr("d", d => d.arrowPath),
                exit => exit.remove()
            );
    }

    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }
}