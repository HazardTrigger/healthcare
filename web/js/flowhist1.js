let hist1Width = $('.histChart').width(),
    hist1Height = $('.histChart').height(),
    hist1Margin = {left: 35, top: 10, right: 10, bottom: 20},
    hist1ClipWidth = hist1Width - hist1Margin.left - hist1Margin.right,
    hist1ClipHeight = hist1Height - hist1Margin.top - hist1Margin.bottom;

let hist1Title = d3.select('#hist1 .flowTitle');

let hist1Svg = d3.select('#hist1 .histChart').append('svg')
    .attr('width', hist1Width)
    .attr('height', hist1Height)
    .append('g')
    .attr('transform', `translate(${hist1Margin.left}, ${hist1Margin.top})`);

let hist1XScale = d3.scaleBand()
    .range([0, hist1ClipWidth])
    .padding(0.2);

let hist1YScale = d3.scaleLinear()
    .range([hist1ClipHeight, 0])
    .clamp(true);

let hist1_g = hist1Svg.append('g')
    .attr('class', 'hist1_g');

let hist1XAxis = hist1Svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(${0}, ${hist1ClipHeight})`);

let hist1YAxis  =hist1Svg.append('g')
    .attr('class', 'y-axis');

