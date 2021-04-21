d3.select('#reset')
    .on('click', function (event) {
        selectedKeys.splice(0, selectedKeys.length);
        currentDatelist.splice(0, currentDatelist.length);
        flowFieldVis.setValue(false);
        mapboxSvg.selectAll('*').remove();
        statisticsShow(true);
        splitLineClear();
        subFlowClear();
        drawStream(stream_g, streamData_confirmed, streamYScale, streamYAxis, Object.keys(zoomMap))
    });

d3.select('#confirmed')
    .on('click', function (event) {
        zoomSwitch = false;
        drawStream(stream_g, streamData_confirmed, streamYScale, streamYAxis, Object.keys(zoomMap))
    });

d3.select('#death')
    .on('click', function (event) {
        zoomSwitch = true;
        drawStream(stream_g, streamData_death, streamYScale, streamYAxis, Object.keys(zoomMap))
    });

d3.select("#split")
    .on("click", function () {
        if (selectedKeys.length === 2) {
            currentDatelist = drawSplitLines(streamXScale.domain(), streamXScale, 7, splitline_g);
            let tmpData = dataTransformForFlowFiled(dataBackUp, selectedKeys);
            splitData = generateSplitData(currentDatelist, tmpData)
        }
    });

d3.select("#compute")
    .on("click", function () {
        spinner.spin(target);
        eel.processdata(splitData, 'static')(function (data) {
            console.log(data);
            statisticsShow(false);
            // console.log(d3.merge(d3.transpose(data)))
            drawThumbnail(reorderFlowData(data), d3.select('#right'));
            // flowBarStrokeHide();
            // rightFlexRow();
            // rightOverflowOn();
            // flowHistUnitShow();
            //
            // let leftHistData = data[0].map(function (d) {
            //     return {
            //         rate: d.rate,
            //         index: d.index,
            //         state: d.state
            //     };
            // });
            // let rightHistData = data[1].map(function (d) {
            //     return {
            //         rate: d.rate,
            //         index: d.index,
            //         state: d.state
            //     };
            // });
            //
            // let maxRateY = d3.max(d3.merge([leftHistData, rightHistData]), d => d.rate);
            // flowHistShow();
            // updateFLowHist(leftHistData, leftSvg, leftHistXScale, leftHistYScale, leftXAxis, leftYAxis, leftXAxis_g, leftYAxis_g, leftStateTitle_g, 0, maxRateY);
            // updateFLowHist(rightHistData, rightSvg, rightHistXScale, rightHistYScale, rightXAxis, rightYAxis, rightXAxis_g, rightYAxis_g, rightStateTitle_g, 1, maxRateY);
            // let reOrderData = reOrderFLowData(d3.merge(data));
            // renderSnapShot(reOrderData, d3.select('#right'));
            spinner.stop();
        });
    });