d3.select("#split")
    .on("click", function () {
        if (selectedState.length === 2) {
            currentDatelist = drawSplitLines(streamXScale.domain(), streamXScale, 7, splitline_g);
            let tmpdata = d3.selectAll('.countryStream').data().map(streamBindDataTransform);
            splitData = generateSplitData(currentDatelist, tmpdata);
            console.log(splitData);
        }
    });

d3.select("#compute")
    .on("click", function () {
        spinner.spin(target);
        eel.processdata(splitData, 'static')(function (data) {
            console.log(data);
            clearSubFlow();
            flowBarStrokeHide();
            statisticsHide();
            rightFlexRow();
            rightOverflowOn();
            flowHistUnitShow();

            let leftHistData = data[0].map(function (d) {
                return {
                    rate: d.rate,
                    index: d.index,
                    state: d.state
                };
            });
            let rightHistData = data[1].map(function (d) {
                return {
                    rate: d.rate,
                    index: d.index,
                    state: d.state
                };
            });

            let maxRateY = d3.max(d3.merge([leftHistData, rightHistData]), d => d.rate);
            flowHistShow();
            updateFLowHist(leftHistData, leftSvg, leftHistXScale, leftHistYScale, leftXAxis, leftYAxis, leftXAxis_g, leftYAxis_g, leftStateTitle_g, 0, maxRateY);
            updateFLowHist(rightHistData, rightSvg, rightHistXScale, rightHistYScale, rightXAxis, rightYAxis, rightXAxis_g, rightYAxis_g, rightStateTitle_g, 1, maxRateY);
            let reOrderData = reOrderFLowData(d3.merge(data));
            renderSnapShot(reOrderData, d3.select('#right'));
            spinner.stop();
        });
    });

d3.select("#tablist")
    .selectAll('.tablinks')
    .on("click", function() {
        currentKey = d3.select(this).attr('id');
        transformStreamData(stateDomain, currentKey);
    });

d3.select("#reset")
    .on("click", function () {
        d3.selectAll(".splitline").remove();
        flowHistHide();
        rightFlexColumn();
        rightOverflowOff();
        resetMapView();
        statisticsShow();
        columnShow();
        flowHistUnitHide();
        // How to reset zoom? https://github.com/d3/d3-zoom/issues/44
        zoomBackground.call(streamZoom.transform, d3.zoomIdentity);
        mapboxSvg.selectAll(".arrow").remove();
        selectedState.splice(0, selectedState.length);
        transformStreamData(d3.keys(zoomMap), 'confirmed');
        streamZoom.on('zoom', streamZoomed);
    });