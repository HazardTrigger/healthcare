d3.csv('./data/american.csv', function (d) {
    let keys = Object.keys(zoomMap);
    if (keys.indexOf(d.state) !== -1) {
        return {
            confirmed: +d.confirmed,
            date: new Date(d.date),
            death: +d.death,
            lat: +d.lat,
            lon: +d.lon,
            state: d.state,
            county: d.county
        }
    }
}).then(function (data) {
    dataBackUp = _.cloneDeep(data);
    streamData_confirmed = streamDataTransform(data, 'confirmed');
    streamData_death = streamDataTransform(data, 'death');
    lollipopData = lollipopDataTransform(_.cloneDeep(data));
    initLollipop = d3.rollup(_.cloneDeep(data), v => d3.sum(v, e => e.confirmed), d => d.state);
    histData = d3.rollup(data, v => d3.sum(v, e => e.confirmed), d => d.state, d => d.date);
    initHist = d3.rollup(data, v => d3.sum(v, e => e.confirmed), d => d.date);
    drData = d3.rollup(data, v => d3.sum(v, e => e.death) / d3.sum(v, e => e.confirmed), d => d.state, d => d.date);
    initDR = d3.rollup(data, v => d3.sum(v, e => e.death) / d3.sum(v, e => e.confirmed), d => d.date);

    drawLollipop(lollipopGs, initLollipop, null, lollipopXScale, lollipopYScale);
    drawHist(histGs, initHist.values(), null, histXScale, histYScale, nBins);
    drawDRArea(drGs, initDR, null, drXScale, drYScale);
    drawStream(stream_g, streamData_confirmed, streamYScale, streamYAxis, Object.keys(zoomMap))
});