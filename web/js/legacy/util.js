function unique(arr) {
    var r = [];
    for (var i = 0, l = arr.length; i < l; i++) {
        for (var j = i + 1; j < l; j++) {
            if (arr[i] === arr[j]) {
                j = ++i;
            }
        }
        r.push(arr[i]);
    }
    return r;
}

function compare(property) {
    return function (a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDateList(startDate, stopDate, padding = 7) {
    let sd = new Date(startDate);
    let ed = new Date(stopDate);
    for (var arr = []; sd <= ed; sd.setDate(sd.getDate() + padding)) {
        arr.push(new Date(sd))
    }
    return arr;
}

function drawSplitLines(extent, xScale, datePadding, g) {
    let dateRange = extent;
    let datelist = getDateList(dateRange[0], dateRange[1], datePadding).map(xScale);
    let splitLines = datelist.map(xScale.invert);

    // g.selectAll(".splitline").remove();

    updateSplitLines(datelist);

    function updateSplitLines(datelist) {
        let update = g.selectAll(".splitline")
                .data(datelist),
            enter = update.enter(),
            exit = update.exit();

        update
            .attr("x1", d => d)
            .attr("y1", streamClipHeight)
            .attr("x2", d => d)
            .attr("y2", 0)
            .style("stroke", "#fff")
            .style("stroke-dasharray", "2, 2");

        enter
            .append("line")
            .attr("class", "splitline")
            .merge(update)
            .attr("x1", d => d)
            .attr("x2", d => d)
            .attr("y1", streamClipHeight)
            .attr("y2", streamClipHeight)
            .transition()
            .duration(500)
            .delay((d, i) => i * 80)
            .attr("y2", -streamClipHeight)
            .style("stroke", "#fff")
            .style("stroke-dasharray", "2, 2");

        exit.remove();
    }

    return splitLines;
}

function generateSplitData(splitLines, data) {
    splitLines = d3.pairs(splitLines);
    return data.map(function (state) {
        let color = state.color;
        return splitLines.map(function (dp) {
            let period = state.filter(function (d) {
                return dp[0] <= d.date && d.date <= dp[1];
            }).map(function (d) {
                return d.originalData
            });

            period = d3.merge(period);

            let center = [
                +period[0].lat,
                +period[0].lon,
            ];

            let nestData = d3.nest()
                .key(d => d.county)
                .rollup(function (values) {
                    return {
                        dateRange: dp,
                        center: center,
                        state: state.key,
                        color: color,
                        lat: d3.mean(values, d => d.lat),
                        lon: d3.mean(values, d => d.lon),
                        weight: d3.sum(values, d => d.cases)
                    }
                })
                .object(period);

            return d3.values(nestData);
        })
    });
}

function drawIndex(d) {
    let div = d3.select(this);
    let timestamp = " (" + d['dateRange'][0] + " - " + d['dateRange'][1] + ")";
    div.html(d.index + timestamp);
}

function renderSnapShot(data, container) {
    let subSnap = container.selectAll(".subflow")
        .data(data);
    let enter = subSnap.enter();
    let exit = subSnap.exit();

    subSnap
        .attr("class", "subflow")
        .on("mousedown", function () {
            if (d3.event.ctrlKey || d3.event.metaKey) {
                mapboxSvg.selectAll("*").remove();
                flowBarStrokeHide();
            }
        })
        .on("mouseup", function (d, i) {
            if (d3.event.ctrlKey || d3.event.metaKey) {
                setMapViewForFlow();
                columnHide();
                flowBarStrokeShow(d.index);
                drawFlowFieldForMap(d3.merge(data.filter(e => e.index === d.index).map(e => e.mainflow)), mapboxSvg, map);
            }
        })
        .append('div')
        .attr("class", "submap")
        .attr("id", (d, i) => "flow_" + i);

    enter
        .append("div")
        .attr("class", "subflow")
        .merge(subSnap)
        .on("mousedown", function () {
            if (d3.event.ctrlKey || d3.event.metaKey) {
                mapboxSvg.selectAll("*").remove();
                flowBarStrokeHide();
            }
        })
        .on("mouseup", function (d, i) {
            if (d3.event.ctrlKey || d3.event.metaKey) {
                setMapViewForFlow();
                columnHide();
                flowBarStrokeShow(d.index);
                drawFlowFieldForMap(d3.merge(data.filter(e => e.index === d.index).map(e => e.mainflow)), mapboxSvg, map);
            }
        })
        .append('div')
        .attr("class", "submap")
        .attr("id", (d, i) => "flow_" + i);

    exit
        .transition()
        .duration(2000)
        .delay((d, i) => i * 100)
        .style("opacity", 0)
        .remove();

    let subIndex = 0;
    let t = d3.timer(function () {
        if (subIndex > data.length - 1) {
            t.stop();
            return;
        }
        let center = data[subIndex].mapCenter;
        let map = L.map('flow_' + subIndex, {
            center: center,
            zoom: 4,
            layers: L.tileLayer.provider("CartoDB.DarkMatter"),
            zoomControl: false,
            attributionControl: false
        });

        drawFlowFieldForSnap(data[subIndex].subflow, map, subIndex);
        subIndex++;
    },400);


    setTimeout(function () {
        container.selectAll('.subflow')
            .append("div")
            .attr("class", 'subflowTime')
            .style("transform", "translate(" + ($(".subflow").width() / 2 - 70) + "px," + (-($(".subflow").height())) + "px)")
            .style("width", "175px")
            .style("height", "20px")
            .each(drawIndex)
    }, 400);

}

function drawFlowFieldForMap(data, svg, map) {
    svg
        .style("display", columnVis.getValue() ? "none": "block");

    var arrowPath = svg.selectAll(".arrow")
        .data(data);
    var enter = arrowPath.enter();
    var exit = arrowPath.exit();

    arrowPath
        .attr("class", "arrow")
        // .style("visibility", flowFieldVis.getValue() ? "visibility": "hidden")
        .attr("transform", function (d) {
            return "translate(" + project(d.lnglat).x + "," + project(d.lnglat).y + ')';
        })
        .style("opacity", flowOpacity.getValue())
        .each(drawArrow);

    enter.append("g")
        .attr("class", "arrow")
        // .style("visibility", flowFieldVis.getValue() ? "visibility": "hidden")
        .attr("transform", function (d) {
            return "translate(" + project(d.lnglat).x + "," + project(d.lnglat).y + ')';
        })
        .style("opacity", flowOpacity.getValue())
        .merge(arrowPath)
        .each(drawArrow);

    exit.remove();

    function drawArrow(d) {
        let g = d3.select(this);

        g.selectAll("*").remove();
        g
            .append("path")
            .attr("fill", d => d.fill)
            .attr("d", d => d.arrowPath)
    }

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

    function project(d) {
        return map.project(new mapboxgl.LngLat(+d[0], +d[1]));
    }
}

function drawFlowFieldForSnap(eachflow, map, id) {
    let subflow = L.geoJSON(eachflow, {
        pointToLayer: function (feature, latlng) {
            var arrow = feature['properties']['html'];
            var icon_anchor = [feature['properties']['anchor_x'],
                feature['properties']['anchor_y']
            ];
            var div_icon = L.divIcon({
                "className": "quiver",
                "html": arrow,
                "iconAnchor": icon_anchor,
            });
            return L.marker(latlng, {
                icon: div_icon
            });
        }
    });
    // subMapflow.push({'map': map, 'gj': subflow});
    subflow.addTo(map);
}


function transformForcastData(stateKeys) {
    let stateData = forecastData.filter(function (d) {
        return stateKeys.indexOf(d.state) >= 0;
    }).map(function (d) {
        let obj = {};
        obj[d.state] = d3.entries(d)
            .filter(d => d.key !== "state")
            .map(function (date) {
                return {
                    'date': dateParse(date.key),
                    'confirmed': +date.value
                }
            });
        return obj;
    });

    buildForcast(stateData, d3.keys(stateData), forecastPath_g);
}

function transformStreamData(stateKeys, key) {
    let stateData = originalDataGroupByState.filter(function (state) {
        return stateKeys.indexOf(state.key) >= 0;
    }).map(d => d.value.data);

    let nestData = d3.nest()
        .key(d => d.date)
        .key(d => d.state)
        .rollup(state => [d3.sum(state, d => d[key]), state])
        .entries(d3.merge(stateData));

    nestData = nestData.map(function (date) {
        date['date'] = dateParse(date.key);
        date['originalData'] = [];
        date.values.forEach(function (state) {
            date[state.key] = state.value[0];
            date['originalData'] = d3.merge([date['originalData'], state.value[1]]);
        });
        delete date['key'];
        delete date['values'];
        return date;
    });

    buildStream(nestData, stateKeys, stream_g, key);
}

function columnHide() {
    columnVis.setValue(false);
    deckColumnMapLayer.setProps({
        visible: columnVis.getValue()
    });
    d3.select("#flow-field").style("z-index", function () {
        return columnVis.getValue() ? -1 : 0;
    });
}

function columnShow() {
    columnVis.setValue(true);
    deckColumnMapLayer.setProps({
        visible: columnVis.getValue()
    });
    d3.select("#flow-field").style("z-index", function () {
        return columnVis.getValue() ? -1 : 0;
    });
}

function flowHistShow() {
    d3.selectAll(".flowhist")
        .style("z-index", 3)
        .style("display", "block");
}

function flowHistHide() {
    d3.selectAll(".flowhist")
        .style("z-index", -1)
        .style("display", "none");
}

function clearSubFlow() {
    d3.select("#right").selectAll('.subflow').remove();
}

function flowBarStrokeShow(i) {
    d3.selectAll("#flowBar" + i)
        .style("stroke", '#bd3977')
        .style("stroke-width", '3px')
}

function flowBarStrokeHide() {
    d3.select("#left-flowhist > svg").selectAll("rect")
        .style("stroke", 'none');
    d3.select("#right-flowhist > svg").selectAll("rect")
        .style("stroke", 'none');
}

function reOrderFLowData(data) {
    let nestData = d3.nest()
        .key(d => d.index)
        .entries(data);

    return d3.merge(nestData.map(d => d.values));
}

function statisticsHide() {
    d3.selectAll('.statistics').style("display", 'none');
}

function statisticsShow() {
    clearSubFlow();
    d3.selectAll('.statistics').style("display", 'block');
}

function rightFlexRow() {
    d3.select('#right')
        .style("flex-direction", 'row')
        .style("flex-wrap", 'wrap')
}

function rightFlexColumn() {
    d3.select('#right')
        .style("flex-direction", 'column')
        .style("flex-wrap", 'nowrap')
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function flowHistUnitShow() {
    d3.selectAll('.flowHistUnit')
        .style("visibility", 'visible');
}

function flowHistUnitHide() {
    d3.selectAll('.flowHistUnit')
        .style("visibility", 'hidden');
}

function rightOverflowOn() {
    d3.select('#right').style("overflow-y", 'auto');
}

function rightOverflowOff() {
    d3.select('#right').style("overflow-y", 'hidden');
}

function setMapViewForFlow() {
    map.setCenter([-98.23, 39.93]);
    map.setZoom(3);
    map.setPitch(0);
}

function resetMapView() {
    map.setCenter([-98.23, 39.93]);
    map.setZoom(3);
    map.setPitch(40);
}
