mapboxgl.accessToken = 'pk.eyJ1IjoiaGF6YXJkdHJpZ2dlciIsImEiOiJjanl3d2d0NmQwMmNjM2NxbDhwNmVsYmkzIn0.oap8KJPjiF__xdNVrVPmvQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-98.23, 39.93],
    pitch: 40, // pitch in degrees
    attributionControl: false,
    // bearing: -10, // bearing in degrees
    zoom: 3
});

const mapWidth = $("#map").width();
const mapHeight = $("#map").height();

d3.select("#left-flowhist")
    .style("transform", "translate(0px," + (mapHeight - $("#left-flowhist").height()) + "px)");

d3.select("#right-flowhist")
    .style("transform", "translate(" + (mapWidth - $("#right-flowhist").width()) + "px," + (mapHeight - $("#right-flowhist").height()) + "px)");

map.addControl(new mapboxgl.NavigationControl(), 'top-left');

// map.on("click", function (e) {
//     console.log(e.lngLat);
// });

var mapbox_canvas = map.getCanvasContainer();
var mapboxSvg = d3.select(mapbox_canvas).append("svg")
    .attr("id", "flow-field")
    .style("position", "absolute")
    .style("z-index", "0")
    .style("display", "none")
    .style("width", "100%")
    .style("height", "100%");


function renderHeatmap(data) {
    deckHeatMapLayer = new deck.MapboxLayer({
        id: "epidemic-heat",
        type: deck.HeatmapLayer,
        data: data,
        colorRange: color_range,
        getPosition: d => [+d.lon, +d.lat],
        getWeight: d => +d.confirmed,
        intensity: 20,
        threshold: 0.01,
        visible: false
    });
    map.addLayer(deckHeatMapLayer);
}

function renderColumnLayer(data) {
    deckColumnMapLayer = new deck.MapboxLayer({
        id: "epidemic-column",
        type: deck.ColumnLayer,
        data: data,
        autoHighlight: true,
        extruded: true,
        diskResolution: 50,
        elevationScale: 1,
        radius: 20000,
        coverage: 1,
        opacity: 1,
        // highlightColor: [241, 250, 44],
        getElevation: d => +d.confirmed * columnScaleMap[d.state],
        getPosition: d => [+d.lon, +d.lat],
        getFillColor: function (d) {
            let stateColor = stateColorMap[d.state];
            let stateRgb = d3.rgb(stateColor);
            return [stateRgb.r, stateRgb.g, stateRgb.b];
        },
        visible: true,
        pickable: true,
        onHover: columnTooltip
    });
    map.addLayer(deckColumnMapLayer);
}

function columnTooltip(info, evented) {
    if (info.picked) {
        d3.select(".deck-tooltip")
            .style("display", "block")
            .style("background-color", "#222222")
            .style("color", "#fff")
            .style("border-radius", '5px')
            .style("padding", '5px 10px')
            .style("transform", "translate(" + info.x + "px," + info.y + "px)")
            .html(function () {
                return "State: " + info.object.state + "<br>" +
                        "County: " + info.object.county + "<br>" +
                        "Confirmed: " + info.object.confirmed + "<br>" +
                        "Death: " + info.object.death + "<br>";
            });
    } else {
        d3.select(".deck-tooltip")
            .style("display", "none");
    }
}