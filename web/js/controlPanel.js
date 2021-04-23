let gui = new dat.GUI({
    autoPlace: false,
    width: 200
});
$('#overlay').append($(gui.domElement));

// ====================distribution
let heatConfig = {
    "intensity": 6,
    "visible": false,
    "opacity": 1,
    "radiusPixels": 30,
    "threshold": 0.05,
};

let distributionFloder = gui.addFolder("Epidemic Distribution");
let heatVisible = distributionFloder.add(heatConfig, "visible");
heatVisible.onChange(function (value) {
    deckHeatMapLayer.setProps({
        visible: value
    });
});

let heatIntensity = distributionFloder.add(heatConfig, "intensity", 0, 100);
heatIntensity.onChange(function (value) {
    deckHeatMapLayer.setProps({
        intensity: value
    });
});

let heatOpacity = distributionFloder.add(heatConfig, "opacity", 0, 1);
heatOpacity.onChange(function (value) {
    deckHeatMapLayer.setProps({
        opacity: value
    });
});

let heatRadiusPixels = distributionFloder.add(heatConfig, "radiusPixels", 0, 100);
heatRadiusPixels.onChange(function (value) {
    deckHeatMapLayer.setProps({
        radiusPixels: value
    });
});

let heatThr = distributionFloder.add(heatConfig, "threshold", 0, 1, 0.01);
heatThr.onChange(function (value) {
    deckHeatMapLayer.setProps({
        threshold: value
    });
});

let columnConfig = {
    elevationScale: 1,
    diskResolution: 50,
    coverage: 1,
    radius: 20000,
    opacity: 1,
    visible: true,
};
let columnFolder = gui.addFolder('Epidemic Spatial Statistics');

let columnVis = columnFolder.add(columnConfig, 'visible');
columnVis.onChange(function (value) {
    deckColumnMapLayer.setProps({
        visible: value
    });
     mapboxSvg.style("display", value ? "none": "block");
});

let columnScale = columnFolder.add(columnConfig, 'elevationScale', 1, 10, 1);
columnScale.onChange(function (value) {
    deckColumnMapLayer.setProps({
        elevationScale: value
    });
});

let columnDiskResolution = columnFolder.add(columnConfig, 'diskResolution', 1, 100);
columnDiskResolution.onChange(function (value) {
    deckColumnMapLayer.setProps({
        diskResolution: value
    });
});

let columnCoverage = columnFolder.add(columnConfig, 'coverage', 0, 1);
columnCoverage.onChange(function (value) {
    deckColumnMapLayer.setProps({
        coverage: value
    });
});

let columnRadius = columnFolder.add(columnConfig, 'radius', 5000, 55000);
columnRadius.onChange(function (value) {
    deckColumnMapLayer.setProps({
        radius: value
    });
});

let columnOpacity = columnFolder.add(columnConfig, 'opacity', 0, 1);
columnOpacity.onChange(function (value) {
    deckColumnMapLayer.setProps({
        opacity: value
    });
});


// ==============flow-field
let flowFieldFolder = gui.addFolder("Epidemic Shift");
let flowConfig = {
    visible: false,
    opacity: 1
};

let flowFieldVis = flowFieldFolder.add(flowConfig, "visible");
flowFieldVis.onChange(function (value) {
   mapboxSvg.style("display", value ? "block": "none");
});

let flowOpacity = flowFieldFolder.add(flowConfig, 'opacity', 0, 1);
flowOpacity.onChange(function (value) {
    mapboxSvg.selectAll(".arrow").style("opacity", value);
});
