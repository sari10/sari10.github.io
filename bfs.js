const a = 5
const b = 4
const radius = Math.max(window.innerWidth, window.innerHeight) * .01
const thinLineWidth = radius * .03
const thickLineWidth = radius * .5
const minNodeDist = radius * 10
const minEdgeAdds = 3
const canvasWidth = window.innerWidth * .98
const canvasHeight = window.innerHeight * .9
const x_margin = 2 * radius
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
const maxDegree = 3
const radii = [.25, .50, .62, .95]
const angle = 2 * 3.14 / 5
const in_theta = Array.from({length: 5}, (v, i) => i * angle)
const out_theta = Array.from({length: 5}, (v, i) => (i + .5) * angle)
const root_color = 'darkorange'
const original_color = 'black'
const queue_color = 'blue'
const finished_color = 'purple'
const line_color = 'green'
const root_index = 17

function transform(pre, pre_min, pre_max, post_min, post_max) {
    return ((pre - pre_min) / (pre_max - pre_min)) * (post_max - post_min) + post_min
}

var nodes = []
dodecahedron_neighbors.forEach(
    (neighbors, i) => {
        let r = radii[Math.floor(i / 5)]
        let theta = i < 10 ? in_theta[i % 5] : out_theta[i % 5]
        let x = transform(r * Math.cos(theta), -1, 1, x_min, x_max)
        let y = transform(r * Math.sin(theta), -1, 1, y_min, y_max)
        nodes.push({
            neighbors,
            x,
            y,
            parent_index: root_index,
            color: i == root_index ? root_color : original_color
        })
    }
)
var edges = []
nodes.forEach(
    (node, index) => {
        node.neighbors.forEach(
            nbr_index => {
                if (index < nbr_index)
                    edges.push({A: index, B: nbr_index, width: thinLineWidth})
            }
        )
    }
)
var tree = []
nodes.forEach(
    (node, index) => {
        for (let i = 0; i < maxDegree; i++) {
            tree.push({
                A: index,
                B: index,
                width: thickLineWidth
            })
        }
    }
)

var queue = [{index: root_index, node: nodes[root_index]}]

function makeCanvas() {
    var canvas = d3.select('body')
        .append('svg') 
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
}

function displayCanvas(timer=time_unit) {
    var canvas = d3.select('svg')

    var lines = canvas.selectAll('line')
        .data(Array.from(edges).concat(tree))
    lines.enter()
        .append('line')
        .attr('x1', d => nodes[d.A].x)
        .attr('y1', d => nodes[d.A].y)
        .attr('x2', d => nodes[d.B].x)
        .attr('y2', d => nodes[d.B].y)
        .attr('stroke', line_color)
        .attr('stroke-width', d => d.width)
    lines.transition()
        .duration(time_unit)
        .attr('x1', d => nodes[d.A].x)
        .attr('y1', d => nodes[d.A].y)
        .attr('x2', d => nodes[d.B].x)
        .attr('y2', d => nodes[d.B].y)
        .attr('stroke-width', d => d.width)

    var canvasSlots = canvas.selectAll('circle')
        .data(nodes)
    canvasSlots.enter()
        .append('circle')
        .attr('r', radius)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', d => d.color)
    canvasSlots.transition()
        .duration(time_unit)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', d => d.color)
}

function bfs() {
    let current = queue.shift()
    if (!current) {
        return
    }
    for (let i = 0; i < tree.length; i++) {
        edge = tree[i]
        if (edge.A == current.node.parent_index && edge.B == current.node.parent_index) {
            edge.B = current.index
            break
        }
    }
    current.node.color = current.node.color == root_color ? root_color : finished_color
    current.node.neighbors.forEach(
        nbr_index => {
            let neighbor = nodes[nbr_index]
            if (neighbor.color == original_color) {
                neighbor.color = queue_color
                neighbor.parent_index = current.index
                queue.push({
                    index: nbr_index,
                    node: neighbor,
                })
            }
        }
    )
    displayCanvas()
    window.setTimeout(bfs, time_unit)
}

window.onload = function() {
    makeCanvas()
    displayCanvas()
    window.setTimeout(bfs, time_unit)
}
