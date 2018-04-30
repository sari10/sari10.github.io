const n = 32
const rectWidth = Math.floor(window.innerWidth * .98 / n)
const rectHeight = Math.floor(window.innerHeight * .7 / 2)
const canvasWidth = n * rectWidth
const canvasHeight = 2 * rectHeight
const time_unit = 100

const values = shuffle()
var sorted = values
var x = current_locs()
var y = Array(n).fill(1)
var size = 2
var i = 0
var j = 2

const colorScale = d3.scaleLinear()
    .domain([-4, n])
    .range(['white', 'green'])

function position(value) {
    return rectWidth * value
}

function height(group) {
    return rectHeight * group / 2
}

function makeCanvas() {
    var canvas = d3.select("body")
        .append("svg") 
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
}

function displayCanvas() {
    var canvas = d3.select("svg")
    var canvasSlots = canvas.selectAll("rect")
        .data(values)
    canvasSlots.enter()
        .append("rect")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", d => position(x[d]))
        .attr("y", d => height(y[d]))
        .attr("fill", (d, i) => colorScale(d))
    canvasSlots.transition()
        .duration(time_unit * size / 2)
        .attr("x", d => position(x[d]))
        .attr("y", d => height(y[d]))
}

function shuffle() {
    shuffled = []
    for (let d = 0; d < n; d++)
        shuffled.push(d)
    for (let d = shuffled.length - 1; d >= 0; d--) {
        k = Math.floor(Math.random() * (d + 1))
        choice = shuffled[k]
        shuffled[k] = shuffled[d]
        shuffled[d] = choice
    }
    return shuffled
}

function current_locs() {
    var locs = Array(n)
    for (let i = 0; i < n; i++)
        locs[sorted[i]] = i
    return locs
}

function current_groups() {
    var mid = (i + j) / 2
    var groups = []
    for (let d = 0; d < n; d++) {
        if (x[d] < i || x[d] >= j)
            groups.push(1)
        else if (x[d] < mid)
            groups.push(0)
        else
            groups.push(2)
    }
    return groups
}

function split() {
    y = current_groups()
    displayCanvas()
    window.setTimeout(arrange, time_unit * size / 2)
}

function arrange() {
    sorted = sorted.slice(0, i)
        .concat(sorted.slice(i, j).sort((a, b) => a - b))
        .concat(sorted.slice(j, n))
    x = current_locs()
    displayCanvas()
    window.setTimeout(merge, time_unit * size / 2)
}

function merge() {
    y = Array(n).fill(1)
    displayCanvas()
    if (j < n) {
        window.setTimeout(split, time_unit * size / 2)
        i += size
        j += size
    } else if (size < n) {
        window.setTimeout(split, time_unit * size / 2)
        size *= 2
        i = 0
        j = size
    }
}

window.onload = function() {
    makeCanvas()
    displayCanvas()
    window.setTimeout(split, time_unit * size / 2)
}
