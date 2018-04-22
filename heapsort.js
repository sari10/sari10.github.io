let n = 15
let rectWidth = Math.floor(window.innerWidth * .9 / n)
let bigRectWidth = (n / 2) * rectWidth
let rectHeight = Math.floor(window.innerHeight * .7 / n)
let canvasWidth = n * rectWidth
let canvasHeight = (2 + n) * rectHeight
let lineWidth = 1
let time_unit = 500
let list_x = Array(n).fill((canvasWidth - bigRectWidth) / 2)
let list_y = Array.from({length: n}, (v, i) => (2 + i) * rectHeight)
let heap_x = [7, 3, 11, 1, 5, 9, 13, 0, 2, 4, 6, 8, 10, 12, 14].map(v => v * rectWidth)
let levels = [[0], [1, 2], [3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13, 14]]
let heapify_position = Math.floor(n / 2)
let position = heapify_position
let show_branch = Array(n - 1).fill(false)
let heapsize = n

let values = shuffle()
let x = Array(n).fill((canvasWidth - bigRectWidth) / 2)
let y = Array(n)
for (let i = 0; i < n; i++)
    y[values[i]] = list_y[i]
let width = Array(n).fill(bigRectWidth)

let color = d3.scaleLinear()
    .domain([-4, n])
    .range(['white', 'green'])

function makeCanvas() {
    let canvas = d3.select("body")
        .append("svg") 
        .attr("width", canvasWidth)
        .attr("height", canvasHeight)
    make_branches()
}

function displayCanvas(timer=time_unit) {
    let canvas = d3.select("svg")

    let branchLines = canvas.selectAll("line")
        .data(show_branch)
    branchLines.transition()
        .duration(timer / 2)
        .attr("stroke-width", d => d ? lineWidth : 0)

    let canvasSlots = canvas.selectAll("rect")
        .data(values)
    canvasSlots.enter()
        .append("rect")
        .attr("width", d => width[d])
        .attr("height", rectHeight)
        .attr("x", d => x[d])
        .attr("y", d => y[d])
        .attr("fill", color)
    canvasSlots.transition()
        .duration(timer)
        .attr("width", d => width[d])
        .attr("x", d => x[d])
        .attr("y", d => y[d])
        .attr("fill", color)
}

function shuffle() {
    shuffled = Array.from({length: n}, (v, i) => i)
    for (let d = shuffled.length - 1; d >= 0; d--) {
        k = Math.floor(Math.random() * (d + 1))
        choice = shuffled[k]
        shuffled[k] = shuffled[d]
        shuffled[d] = choice
    }
    return shuffled
}

function get_by_row(row) {
    for (let i = 0; i < n; i++) {
        if (y[i] === list_y[row])
            return i
    }
}

function make_tree() {
    for (let i = 0; i < n; i++)
        x[values[i]] = heap_x[i]
    width = Array(n).fill(rectWidth)
    displayCanvas(5 * time_unit)
    window.setTimeout(show_branches, 5 * time_unit)
}

function show_branches() {
    show_branch = Array(n - 1).fill(1)
    displayCanvas()
    window.setTimeout(heapify, time_unit, 0)
}

function get_node(i) {
    return {x: heap_x[i], y: list_y[i]}
}

function make_branches() {
    let branches = []
    for (let j = 0; j + 1 < levels.length; j++) {
        let current = levels[j]
        let next = levels[j + 1]
        for (let i = 0; i < current.length; i++) {
            let node = current[i]
            let left = next[2 * i]
            let right = next[2 * i + 1]
            branches.push({x1: heap_x[node], y1: list_y[node], x2: heap_x[left], y2: list_y[left]})
            branches.push({x1: heap_x[node], y1: list_y[node], x2: heap_x[right], y2: list_y[right]})
        }
    }
    let canvas = d3.select("svg")
    let canvasLines = canvas.selectAll("lines")
        .data(branches)
    canvasLines.enter()
        .append("line")
        .attr("stroke", "black")
        .attr("stroke-width", 0)
        .attr("x1", d => d.x1 + rectWidth / 2)
        .attr("y1", d => d.y1 + rectHeight / 2)
        .attr("x2", d => d.x2 + rectWidth / 2)
        .attr("y2", d => d.y2 + rectHeight / 2)
}

function heapify() {
    left = position * 2 + 1
    right = position * 2 + 2
    value = get_by_row(position)
    left_value = left < heapsize ? get_by_row(left) : -1
    right_value = right < heapsize ? get_by_row(right) : -1
    if (Math.max(left_value, right_value) > value) {
        if (left_value > right_value) {
            swap(value, left_value)
            position = left
        } else {
            swap(value, right_value)
            position = right
        }
        interval = time_unit
    } else if (heapify_position >= 0) {
        heapify_position -= 1
        position = heapify_position
        interval = heapify_position >= 0 ? 0 : 2 * time_unit
    } else {
        swap(get_by_row(0), get_by_row(heapsize - 1))
        heapsize -= 1
        show_branch[heapsize - 1] = false
        position = 0
        interval = time_unit
    }
    if (heapsize > 0)
        window.setTimeout(heapify, interval)
    else
        window.setTimeout(make_array, time_unit)
}

function make_array() {
    for (let i = 0; i < n; i++)
        x[values[i]] = list_x[i]
    width = Array(n).fill(bigRectWidth)
    displayCanvas(5 * time_unit)
}

function swap(u, v) {
    let temp_x = x[u]
    x[u] = x[v]
    x[v] = temp_x
    let temp_y = y[u]
    y[u] = y[v]
    y[v] = temp_y
    displayCanvas()
}

window.onload = function() {
    makeCanvas()
    displayCanvas()
    window.setTimeout(make_tree, time_unit)
}
