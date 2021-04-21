let accessToken = 'pk.eyJ1IjoiaGF6YXJkdHJpZ2dlciIsImEiOiJjanl3d2d0NmQwMmNjM2NxbDhwNmVsYmkzIn0.oap8KJPjiF__xdNVrVPmvQ';
let opts = {
    lines: 11, // The number of lines to draw
    length: 0, // The length of each line
    width: 19, // The line thickness
    radius: 42, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    speed: 1, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-shrink', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    color: '#ffffff', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    top: '46%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    zIndex: 2000000000, // The z-index (defaults to 2e9)
    className: 'spinner', // The CSS class to assign to the spinner
    position: 'absolute', // Element positioning
};
let target = d3.select("#map").node();
let spinner = new Spin.Spinner(opts);

let color_range = [
    [d3.rgb("#fcfdbf").r, d3.rgb("#fcfdbf").g, d3.rgb("#fcfdbf").b],
    [d3.rgb("#febd82").r, d3.rgb("#febd82").g, d3.rgb("#febd82").b],
    [d3.rgb("#f97b5d").r, d3.rgb("#f97b5d").g, d3.rgb("#f97b5d").b],
    [d3.rgb("#bd3977").r, d3.rgb("#bd3977").g, d3.rgb("#bd3977").b],
    [d3.rgb("#842681").r, d3.rgb("#842681").g, d3.rgb("#842681").b],
    [d3.rgb("#2f1163").r, d3.rgb("#2f1163").g, d3.rgb("#2f1163").b],
];

let stateDomain = [
    "New York",
    // "Washington",
    "New Jersey",
    "California",
    "Illinois",
    "Michigan",
    "Florida",
    "Louisiana",
    "Massachusetts",
    "Texas",
    "Georgia",
    "Colorado",
    "Pennsylvania",
    "Tennessee",
    "Wisconsin",
    "Ohio",
    "Connecticut",
    "North Carolina",
    "Maryland",
    "Virginia",
    "Mississippi",
    "Indiana",
    "South Carolina",
    "Nevada",
    "Utah",
    "Minnesota",
    "Arkansas",
    "Oregon",
    "Alabama",
    "Arizona",
    "Kentucky",
    "Missouri",
    "Iowa",
    "Maine",
    // "Rhode Island",
    "New Hampshire",
    "Oklahoma",
    "Kansas",
    "New Mexico",
    // "Hawaii",
    "Delaware",
    "Vermont",
    "Nebraska",
    "Idaho",
    "Montana",
    "North Dakota",
    "Wyoming",
    "South Dakota",
    // "Alaska",
    "West Virginia",
    // "District of Columbia"
];

let stateColorMap = {
    Alabama: '#f16d7a',
    Arizona: '#f55066',
    Kansas: '#ef5464',
    California: '#ae716e',
    Delaware: '#cb8e85',
    Florida: '#cf8878',
    Georgia: '#c86f67',
    Idaho: '#f2debd',
    'New York': '#b7d28d',
    'New Jersey': '#ff9b6a',
    Illinois: '#f1b8e4',
    Michigan: '#d9b8f1',
    Louisiana: '#f1ccb8',
    Massachusetts: '#f1f1b8',
    Texas: '#b8f1ed',
    Colorado: '#b8f1cc',
    Pennsylvania: '#e7dac9',
    Tennessee: '#dcff93',
    Wisconsin: '#fe9778',
    Ohio: '#e1622f',
    Connecticut: '#f3d64e',
    'North Carolina': '#fd7d36',
    Maryland: '#c38e9e',
    Virginia: '#f28860',
    Mississippi: '#de772c',
    Indiana: '#e96a25',
    'South Carolina': '#ca7497',
    Nevada: '#e29e4b',
    Utah: '#edbf2b',
    Minnesota: '#fecf45',
    Arkansas: '#f9b747',
    Oregon: '#c17e61',
    Kentucky: '#ed9678',
    Missouri: '#ffe543',
    Iowa: '#e37c5b',
    Maine: '#ff8240',
    'New Hampshire': '#aa5b71',
    Oklahoma: '#f0b631',
    'New Mexico': '#cf8888',
    Vermont: '#006300',
    Nebraska: '#e27386',
    Montana: '#85fd96',
    'North Dakota': '#e7e7e7',
    Wyoming: '#a52b2a',
    'South Dakota': '#fd6e73',
    'West Virginia': '#f1ccb8',
};

let timeDomain = [
    new Date('2020-03-22 08:00:00'),
    new Date('2020-05-29 08:00:00')
];

const zoomMap = {
    "New York": 1,
    "New Jersey": 1,
    "Illinois": 1,
    "Massachusetts": 1,
    "California": 1,
    "Pennsylvania": 1,
    "Michigan": 2,
    "Florida": 2,
    "Texas": 2,
    "Louisiana": 2,
    "Connecticut": 2,
    "Georgia": 2,
    "Maryland": 3,
    "Ohio": 3,
    "Indiana": 3,
    "Virginia": 3,
    "Colorado": 3,
    "North Carolina": 3,
    "Tennessee": 4,
    "Arizona": 4,
    "Minnesota": 4,
    "Iowa": 4,
    "Wisconsin": 4,
    "Alabama": 4,
    "Missouri": 5,
    "Mississippi": 5,
    "South Carolina": 5,
    "Nebraska": 5,
    "Nevada": 5,
    "Kentucky": 5,
    "Delaware": 6,
    "Kansas": 6,
    "Utah": 6,
    "Oklahoma": 6,
    "New Mexico": 6,
    "Arkansas": 6,
    "Oregon": 7,
    "South Dakota": 7,
    "New Hampshire": 7,
    "Idaho": 7,
    "Maine": 7,
    "North Dakota": 7,
    "West Virginia": 8,
    "Vermont": 8,
    "Wyoming": 8,
    "Montana": 8
};

let selectedState = [],
    selectedKeys = [];

let dataBackUp = [];

let lollipopData = new Map();
let initLollipop = new Map();

let histData = new Map();
let initHist = new Map();

let drData = new Map();
let initDR = new Map();

let originalSeries = null;
let zoomSwitch = false;

let streamData_confirmed;
let streamData_death;

let currentDatelist = [];
let splitData = [];