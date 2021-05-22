d3.select('#reset')
    .on('click', function (event) {
        selectedKeys.splice(0, selectedKeys.length);
        currentDatelist.splice(0, currentDatelist.length);
        flowFieldVis.setValue(false);
        mapboxSvg.selectAll('*').remove();
        flowHistShow(false);
        statisticsShow(true);
        splitLineClear();
        subFlowClear();
        columnShow(true)
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
            flowHistShow(true);
            columnShow(false);

            let bothData = _.cloneDeep(data);
            let flowHistData = bothData.map(function (d) {
                return d.map(function (e) {
                    return {
                        index: e.index,
                        rate: e.rate,
                        state: e.state
                    }
                })
            });
            let maxRateY = d3.max(d3.merge(flowHistData), d => d.rate);
            drawFlowHist(hist1_g, hist1Title, flowHistData[0], hist1XScale, hist1YScale, hist1XAxis, hist1YAxis, maxRateY);
            drawFlowHist(hist2_g, hist2Title, flowHistData[1], hist2XScale, hist2YScale, hist2XAxis, hist2YAxis, maxRateY);

            drawThumbnail(reorderFlowData(data), d3.select('#right'));
            // flowBarStrokeHide();
            // flowHistUnitShow();
            // flowHistShow();
            spinner.stop();
        });
    });