let n = 32
let rectWidth = Math.floor(window.innerWidth * .98 / n)
let rectHeight = Math.floor(window.innerHeight * .7 / 2)
let canvasWidth = n * rectWidth
let canvasHeight = 3 * rectHeight
let time_unit = 100

let values = shuffle()
let sorted = values
let x = current_locs()
let y = Array(n).fill(1)
let size = 2
let i = 0
let j = 2
let stage = 'select'

let colorScale = d3.scaleLinear()
    .domain([-4, n])
    .range(['white', 'green'])

function current_locs() {
    let locs = Array(n)
    for (let i = 0; i < n; i++)
        locs[sorted[i]] = i
    return locs
}

function current_groups() {
    let mid = (i + j) / 2
    let groups = []
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

function position(value) {
    return rectWidth * value
}

function height(group) {
    return rectHeight * group / 2
}

function makeCanvas() {
    let canvas = d3.select("body")
        .append("svg") 
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
}

function displayCanvas() {
    let canvas = d3.select("svg")
    let canvasSlots = canvas.selectAll("rect")
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

function split() {
    y = current_groups()
    displayCanvas()
    window.setTimeout(arrange, time_unit * size / 2)
}

function arrange() {
    console.log('width', window.width)
    console.log('inner width', window.innerWidth)
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
