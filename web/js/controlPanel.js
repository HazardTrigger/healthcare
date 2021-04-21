let gui = new dat.GUI({
    autoPlace: false,
    width: 200
});
$('#overlay').append($(gui.domElement));

// ====================distribution
// var heatConfig = {
//     "intensity": 6,
//     "visible": false,
//     "opacity": 1,
//     "radiusPixels": 30,
//     "threshold": 0.05,
// };
//
// var distributionFloder = gui.addFolder("Epidemic Distribution");
// var heatVisible = distributionFloder.add(heatConfig, "visible");
// heatVisible.onChange(function (value) {
//     deckHeatMapLayer.setProps({
//         visible: value
//     });
// });
//
// var heatIntensity = distributionFloder.add(heatConfig, "intensity", 0, 100);
// heatIntensity.onChange(function (value) {
//     deckHeatMapLayer.setProps({
//         intensity: value
//     });
// });
//
// var heatOpacity = distributionFloder.add(heatConfig, "opacity", 0, 1);
// heatOpacity.onChange(function (value) {
//     deckHeatMapLayer.setProps({
//         opacity: value
//     });
// });
//
// var heatRadiusPixels = distributionFloder.add(heatConfig, "radiusPixels", 0, 100);
// heatRadiusPixels.onChange(function (value) {
//     deckHeatMapLayer.setProps({
//         radiusPixels: value
//     });
// });
//
// var heatThr = distributionFloder.add(heatConfig, "threshold", 0, 1, 0.01);
// heatThr.onChange(function (value) {
//     deckHeatMapLayer.setProps({
//         threshold: value
//     });
// });
//
// var columnConfig = {
//     elevationScale: 1,
//     diskResolution: 50,
//     coverage: 1,
//     radius: 20000,
//     opacity: 1,
//     visible: true,
// };
// var columnFolder = gui.addFolder('Epidemic Spatial Statistics');
//
// var columnVis = columnFolder.add(columnConfig, 'visible');
// columnVis.onChange(function (value) {
//     deckColumnMapLayer.setProps({
//         visible: value
//     });
//      mapboxSvg.style("display", value ? "none": "block");
// });
//
// var columnScale = columnFolder.add(columnConfig, 'elevationScale', 1, 10, 1);
// columnScale.onChange(function (value) {
//     deckColumnMapLayer.setProps({
//         elevationScale: value
//     });
// });
//
// var columnDiskResolution = columnFolder.add(columnConfig, 'diskResolution', 1, 100);
// columnDiskResolution.onChange(function (value) {
//     deckColumnMapLayer.setProps({
//         diskResolution: value
//     });
// });
//
// var columnCoverage = columnFolder.add(columnConfig, 'coverage', 0, 1);
// columnCoverage.onChange(function (value) {
//     deckColumnMapLayer.setProps({
//         coverage: value
//     });
// });
//
// var columnRadius = columnFolder.add(columnConfig, 'radius', 5000, 55000);
// columnRadius.onChange(function (value) {
//     deckColumnMapLayer.setProps({
//         radius: value
//     });
// });
//
// var columnOpacity = columnFolder.add(columnConfig, 'opacity', 0, 1);
// columnOpacity.onChange(function (value) {
//     deckColumnMapLayer.setProps({
//         opacity: value
//     });
// });


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
