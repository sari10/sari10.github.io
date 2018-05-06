const a = 5
const b = 4
const radius = Math.max(window.innerWidth, window.innerHeight) * .01
const thinLineWidth = radius * .03
const thickLineWidth = radius * .5
const minNodeDist = radius * 10
const minEdgeAdds = 3
const canvasWidth = window.innerWidth * .98
const canvasHeight = window.innerHeight * .9
const x_margin = 3 * radius
const y_margin = 2 * radius
const x_min = x_margin
const x_max = canvasWidth - x_margin
const x_range = x_max - x_min
const x_zero = (x_max - x_min) / 2
const y_min = y_margin
const y_max = canvasHeight - y_margin
const y_range = y_max - y_min
const y_zero = (y_max - y_min) / 2
const time_unit = 750
const dodecahedron_neighbors = [
    [1, 4, 5],
    [0, 2, 6],
    [1, 3, 7],
    [2, 4, 8],
    [3, 0, 9],
    [0, 10, 14],
    [1, 10, 11],
    [2, 11, 12],
    [3, 12, 13],
    [4, 13, 14],
    [5, 6, 15],
    [6, 7, 16],
    [7, 8, 17],
    [8, 9, 18],
    [5, 9, 19],
    [10, 16, 19],
    [11, 15, 17],
    [12, 16, 18],
    [13, 17, 19],
    [14, 18, 15]
]
const maxDegree = 4
const radii = [.25, .50, .62, .95]
const angle = 2 * 3.14 / 5
const in_theta = Array.from({length: 5}, (v, i) => i * angle)
const out_theta = Array.from({length: 5}, (v, i) => (i + .5) * angle)
const original_color = 'silver'
const visited_color = 'blue'
const finished_color_low = 'orange'
const finished_color_high = 'orange'
const line_color = 'green'

function shuffle(n) {
    shuffled = Array.from({length: n}, (d, i) => i)
    for (let d = shuffled.length - 1; d >= 0; d--) {
        k = Math.floor(Math.random() * (d + 1))
        choice = shuffled[k]
        shuffled[k] = shuffled[d]
        shuffled[d] = choice
    }
    return shuffled
}

const order = shuffle(dodecahedron_neighbors.length)

function transform(pre, pre_min, pre_max, post_min, post_max) {
    return ((pre - pre_min) / (pre_max - pre_min)) * (post_max - post_min) + post_min
}

const color_scale = d3.scaleLinear()
    .domain([0, 1.2 * x_max])
    .range([finished_color_low, finished_color_high])

const x_slots = Array.from(
    dodecahedron_neighbors,
    (nbr, i) => transform(i, 0, dodecahedron_neighbors.length - 1, x_max, x_min)
)

var x_slot_index = 0

var nodes = []
dodecahedron_neighbors.forEach(
    (neighbors, i) => {
        let r = radii[Math.floor(i / 5)]
        let theta = i < 10 ? in_theta[i % 5] : out_theta[i % 5]
        let x = transform(r * Math.cos(theta), -1, 1, x_min, x_max)
        let y = transform(r * Math.sin(theta), -1, 1, y_min, y_max)
        forward_nbrs = neighbors.filter(nbr_index => order[nbr_index] > order[i])
        nodes.push({
            neighbors: forward_nbrs,
            x,
            y,
            parent_index: 0,
            color: original_color,
            order: ''
        })
    }
)
var edges = []
nodes.forEach(
    (node, index) => {
        node.neighbors.forEach(
            nbr_index => {
                edges.push({
                    type: 'edge',
                    A: index,
                    B: nbr_index,
                    width: thinLineWidth
                })
            }
        )
    }
)
var arrows = make_arrows()
var tree = []
nodes.forEach(
    (node, index) => {
        for (let i = 0; i < maxDegree; i++) {
            tree.push({
                type: 'edge',
                A: index,
                B: index,
                width: thickLineWidth
            })
        }
    }
)

var stack = []

function make_arrows() {
    let arrows = []
    edges.forEach(
        edge => {
            let start = order[edge.A] < order[edge.B] ? nodes[edge.A] : nodes[edge.B]
            let end = order[edge.A] < order[edge.B] ? nodes[edge.B] : nodes[edge.A]
            let mid = {x: .5 * start.x + .5 * end.x, y: .5 * start.y + .5 * end.y}
            let tangent = {x: end.x - start.x, y: end.y - start.y}
            tangent.length = Math.pow(Math.pow(tangent.x, 2) + Math.pow(tangent.y, 2), .5)
            tangent.x = tangent.x * radius / tangent.length
            tangent.y = tangent.y * radius / tangent.length
            let normal = {x: -tangent.y, y: tangent.x}
            let left = {x: mid.x - tangent.x + normal.x, y: mid.y - tangent.y + normal.y}
            let right = {x: mid.x - tangent.x - normal.x, y: mid.y - tangent.y - normal.y}
            arrows.push({type: 'arrow', x1: mid.x, y1: mid.y, x2: left.x, y2: left.y, width: thinLineWidth})
            arrows.push({type: 'arrow', x1: mid.x, y1: mid.y, x2: right.x, y2: right.y, width: thinLineWidth})
        }
    )
    return arrows
}

function makeCanvas() {
    var canvas = d3.select('body')
        .append('svg') 
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
}

function displayCanvas(timer=time_unit) {
    var canvas = d3.select('svg')

    var lines = canvas.selectAll('line')
        .data(Array.from(edges).concat(arrows).concat(tree))
    lines.enter()
        .append('line')
        .attr('x1', d => d.x1 || nodes[d.A].x)
        .attr('y1', d => d.y1 || nodes[d.A].y)
        .attr('x2', d => d.x2 || nodes[d.B].x)
        .attr('y2', d => d.y2 || nodes[d.B].y)
        .attr('stroke', line_color)
        .attr('stroke-width', d => d.width)
    lines.transition()
        .duration(time_unit)
        .attr('x1', d => d.x1 || nodes[d.A].x)
        .attr('y1', d => d.y1 || nodes[d.A].y)
        .attr('x2', d => d.x2 || nodes[d.B].x)
        .attr('y2', d => d.y2 || nodes[d.B].y)
        .attr('stroke-width', d => d.width)

    var circles = canvas.selectAll('circle')
        .data(nodes)
    circles.enter()
        .append('circle')
        .attr('r', radius)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', d => d.color)
    circles.transition()
        .duration(time_unit)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', d => d.color)

    var text = canvas.selectAll('text')
        .data(nodes)
    text.enter()
        .append('text')
        .attr('x', d => d.x + radius)
        .attr('y', d => d.y - radius)
        .text(d => d.order)
    text.transition()
        .duration(time_unit)
        .attr('x', d => d.x + radius)
        .attr('y', d => d.y - radius)
        .text(d => d.order)
}

function dfs() {
    let current
    if (stack.length > 0)
        current = stack[stack.length - 1]
    else {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].color == original_color) {
                current = {index: i, node: nodes[i]}
                current.node.parent_index = i
                stack.push(current)
                break
            }
        }
        if (stack.length == 0) {
            window.setTimeout(top_sort, time_unit)
            return
        }
    }
    current.node.color = visited_color
    for (let i = 0; i < tree.length; i++) {
        edge = tree[i]
        if (edge.A == current.node.parent_index && edge.B == current.node.parent_index) {
            edge.B = current.index
            break
        }
    }
    let finished_flag = true
    for (let i = 0; i < current.node.neighbors.length; i++) {
        let nbr_index = current.node.neighbors[i]
        let neighbor = nodes[nbr_index]
        if (neighbor.color == original_color) {
            neighbor.parent_index = current.index
            stack.push({
                index: nbr_index,
                node: neighbor,
            })
            finished_flag = false
            break
        }
    }
    if (finished_flag) {
        stack.pop()
        current.node.final_x = x_slots[x_slot_index]
        current.node.color = color_scale(current.node.final_x)
        current.node.order = 20 - x_slot_index
        x_slot_index++
    }
    displayCanvas()
    window.setTimeout(dfs, time_unit)
}

function top_sort() {
    tree.forEach(edge => edge.width = 0)
    nodes.forEach(node => node.x = node.final_x)
    arrows = make_arrows()
    displayCanvas()
}

window.onload = function() {
    makeCanvas()
    displayCanvas()
    window.setTimeout(dfs, time_unit)
}
