mapboxgl.accessToken = accessToken;
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

map.addControl(new mapboxgl.NavigationControl(), 'top-left');

let mapbox_canvas = map.getCanvasContainer();
let mapboxSvg = d3.select(mapbox_canvas).append("svg")
    .attr("id", "flow-field")
    .style("position", "absolute")
    .style("z-index", "0")
    .style("display", "none")
    .style("width", "100%")
    .style("height", "100%");