let hist2Width = $('.histChart').width(),
    hist2Height = $('.histChart').height(),
    hist2Margin = {left: 35, top: 10, right: 10, bottom: 20},
    hist2ClipWidth = hist2Width - hist2Margin.left - hist2Margin.right,
    hist2ClipHeight = hist2Height - hist2Margin.top - hist2Margin.bottom;

let hist2Title = d3.select('#hist2 .flowTitle');

let hist2Svg = d3.select('#hist2 .histChart').append('svg')
    .attr('width', hist2Width)
    .attr('height', hist2Height)
    .append('g')
    .attr('transform', `translate(${hist2Margin.left}, ${hist2Margin.top})`);

let hist2XScale = d3.scaleBand()
    .range([0, hist2ClipWidth])
    .padding(0.2);

let hist2YScale = d3.scaleLinear()
    .range([hist2ClipHeight, 0])
    .clamp(true);

let hist2_g = hist2Svg.append('g')
    .attr('class', 'hist2_g');

let hist2XAxis = hist2Svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${0}, ${hist2ClipHeight})`);

let hist2YAxis  =hist2Svg.append('g')
    .attr('class', 'y-axis');

