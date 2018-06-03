function makeCanvas(div, svg, canvasWidth, canvasHeight, start) {
    d3.select('#' + div)
        .append('svg')
        .attr('id', svg)
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
        .on('mouseover', function() {
            d3.select('#' + svg).on('mouseover', undefined)
            start()
        })
}

function shuffle(n) {
    shuffled = Array.from({length: n}, (v, i) => i)
    for (let d = shuffled.length - 1; d >= 0; d--) {
        k = Math.floor(Math.random() * (d + 1))
        choice = shuffled[k]
        shuffled[k] = shuffled[d]
        shuffled[d] = choice
    }
    return shuffled
}

function mergesort() {
    const div = 'mergesort'
    const svg = 'mergesort-svg'
    const n = 32
    const rectWidth = Math.floor(window.innerWidth * .98 / n)
    const rectHeight = Math.floor(window.innerHeight * .7 / 2)
    const canvasWidth = n * rectWidth
    const canvasHeight = 2 * rectHeight
    const time_unit = 70

    const colorScale = d3.scaleLinear()
        .domain([-4, n])
        .range(['white', 'green'])

    var values
    var sorted
    var x
    var y
    var size
    var i
    var j

    init()

    function position(value) {
        return rectWidth * value
    }

    function height(group) {
        return rectHeight * group / 2
    }

    function init() {
        values = shuffle(n)
        sorted = values
        x = current_locs()
        y = Array(n).fill(1)
        size = 2
        i = 0
        j = 2
        makeCanvas(div, svg, canvasWidth, canvasHeight, split)
        displayCanvas()
    }

    function displayCanvas() {
        var canvas = d3.select('#' + svg)
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
        } else {
            d3.select('#' + svg).on('click', function() {
                d3.select('#' + svg).remove()
                init()
            })
        }
    }
}

function heapsort() {
    const div = 'heapsort'
    const svg = 'heapsort-svg'
    const n = 15
    const rectWidth = Math.floor(window.innerWidth * .9 / n)
    const bigRectWidth = (n / 2) * rectWidth
    const rectHeight = Math.floor(window.innerHeight * .7 / n)
    const canvasWidth = n * rectWidth
    const canvasHeight = (2 + n) * rectHeight
    const lineWidth = 1
    const time_unit = 300
    const list_x = Array(n).fill((canvasWidth - bigRectWidth) / 2)
    const list_y = Array.from({length: n}, (v, i) => (2 + i) * rectHeight)
    const heap_x = [7, 3, 11, 1, 5, 9, 13, 0, 2, 4, 6, 8, 10, 12, 14].map(v => v * rectWidth)
    const levels = [[0], [1, 2], [3, 4, 5, 6], [7, 8, 9, 10, 11, 12, 13, 14]]
    var heapify_position
    var position
    var show_branch
    var heapsize
    var values
    var x
    var y
    var width

    const color = d3.scaleLinear()
        .domain([-4, n])
        .range(['white', 'green'])

    init()

    function init() {
        heapify_position = Math.floor(n / 2)
        position = heapify_position
        show_branch = Array(n - 1).fill(false)
        heapsize = n
        values = shuffle(n)
        x = Array(n).fill((canvasWidth - bigRectWidth) / 2)
        y = Array(n)
        for (let i = 0; i < n; i++)
            y[values[i]] = list_y[i]
        width = Array(n).fill(bigRectWidth)
        makeCanvas(div, svg, canvasWidth, canvasHeight, make_tree)
        make_branches()
        displayCanvas()
    }

    function displayCanvas(timer=time_unit) {
        var canvas = d3.select('#' + svg)

        var branchLines = canvas.selectAll("line")
            .data(show_branch)
        branchLines.transition()
            .duration(timer / 2)
            .attr("stroke-width", d => d ? lineWidth : 0)

        var canvasSlots = canvas.selectAll("rect")
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
        var branches = []
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
        var canvas = d3.select('#' + svg)
        var canvasLines = canvas.selectAll("lines")
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
        d3.select('#' + svg).on('click', function() {
            d3.select('#' + svg).remove()
            init()
        })
    }

    function swap(u, v) {
        var temp_x = x[u]
        x[u] = x[v]
        x[v] = temp_x
        var temp_y = y[u]
        y[u] = y[v]
        y[v] = temp_y
        displayCanvas()
    }
}

function root() {
    const div = 'root'
    const svg = 'root-svg'
    const canvasWidth = .95 * window.innerWidth
    const canvasHeight = .7 * window.innerHeight
    const bisect_time_unit = 500
    const newton_time_unit = 500
    const points = Array.from({length: canvasWidth}, (v, i) => i)
    const radius = 7
    const lineWidth = 3
    const axisWidth = 2
    const zero = canvasHeight * .19
    const threshold = canvasWidth / 1000
    const x_axis = {x1: 0, x2: canvasWidth, y1: canvasHeight - zero, y2: canvasHeight - zero, color: 'black'}

    var lo
    var hi
    var mid
    var newton
    var nextNewton
    var newton_line_visible
    var coefficients

    init()

    function init() {
        lo = radius
        hi = canvasWidth - radius
        mid = lo + (hi - lo) / 2
        newton = - radius
        nextNewton = newton
        newton_line_visible = false
        coefficients = [
            0.0 + Math.random() * .1,
            0.25 + Math.random() * .1,
            0.5 + Math.random() * .05
        ]
        makeCanvas(div, svg, canvasWidth, canvasHeight, bisect_lo_hi)
        makeGraph()
        displayCanvas()
    }

    function f(x) {
        var z = x / canvasWidth
        var y = 0
        for (let i = 0; i < coefficients.length; i++)
            y += coefficients[i] * Math.pow(z, i)
        return 2 * lineWidth + canvasHeight * y
    }

    function f_prime(x) {
        var z = x / canvasWidth
        var y = 0
        for (let i = 1; i < coefficients.length; i++)
            y += i * coefficients[i] * Math.pow(z, i - 1)
        return canvasHeight * y
    }

    function makeGraph() {
        var canvas = d3.select('#' + svg)
        canvas.append('path')
            .attr('d', d3.line().x(d => d).y(d => canvasHeight - f(d))(points))
            .attr('stroke', 'green')
            .attr('stroke-width', lineWidth)
            .attr('fill', 'none')
    }

    function displayCanvas(timer) {
        var canvas = d3.select('#' + svg)
        var circles = canvas.selectAll('circle')
            .data(make_circle_data())
        circles.enter()
            .append('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', radius)
            .attr('fill', d => d.color)
        circles.transition()
            .duration(timer)
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('fill', d => d.color)
        var lines = canvas.selectAll('line')
            .data(make_line_data())
        lines.enter()
            .append('line')
            .attr('x1', d => d.x1)
            .attr('x2', d => d.x2)
            .attr('y1', d => d.y1)
            .attr('y2', d => d.y2)
            .attr('stroke', d => d.color)
            .attr('stroke-width', axisWidth)
        lines.transition()
            .duration(timer)
            .attr('x1', d => d.x1)
            .attr('x2', d => d.x2)
            .attr('y1', d => d.y1)
            .attr('y2', d => d.y2)
    }

    function make_circle_data() {
        return [
            {x: mid, y: canvasHeight - f(mid), color: 'blue'},
            {x: lo, y: canvasHeight - zero, color: 'blue'},
            {x: hi, y: canvasHeight - zero, color: 'blue'},
            {x: nextNewton, y: canvasHeight - zero, color: 'purple'}
        ]
    }

    function bisect_lo_hi() {
        if (hi <= lo + threshold) {
            hi = mid
            lo = mid
        }
        if (f(mid) >= zero)
            hi = mid
        if (f(mid) <= zero)
            lo = mid
        displayCanvas(bisect_time_unit)
        if (lo != hi)
            window.setTimeout(bisect_mid, bisect_time_unit)
        else
            window.setTimeout(init_newton, newton_time_unit)
    }

    function bisect_mid() {
        mid = lo + (hi - lo) / 2
        displayCanvas(bisect_time_unit)
        window.setTimeout(bisect_lo_hi, bisect_time_unit)
    }

    function make_line_data() {
        var newtonLine = {
            x1: newton,
            x2: nextNewton,
            y1: newton_line_visible ? canvasHeight - f(newton) : canvasHeight - zero,
            y2: canvasHeight - zero,
            color: 'purple'
        }
        return [x_axis, newtonLine]
    }

    function init_newton() {
        newton = radius
        nextNewton = newton
        displayCanvas(newton_time_unit)
        window.setTimeout(display_newton_line, newton_time_unit)
    }

    function display_newton_line() {
        newton_line_visible = true
        displayCanvas(newton_time_unit)
        window.setTimeout(get_next_newton, newton_time_unit)
    }

    function get_next_newton() {
        nextNewton = newton - ((f(newton) - zero) / f_prime(newton)) * canvasWidth
        displayCanvas(newton_time_unit)
        window.setTimeout(contract_newton_line, newton_time_unit)
    }

    function contract_newton_line() {
        newton_line_visible = false
        oldNewton = newton
        newton = nextNewton
        displayCanvas(newton_time_unit)
        if (Math.abs(newton - oldNewton) > threshold)
            window.setTimeout(display_newton_line, newton_time_unit)
        else {
            d3.select('#' + svg).on('click', function() {
                d3.select('#' + svg).remove()
                init()
            })
        }
    }
}

function shortestPaths() {
    const div = 'bfs'
    const svg = 'bfs-svg'
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
    const time_unit = 500
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
    const original_color = 'silver'
    const queue_color = 'blue'
    const finished_color = 'purple'
    const line_color = 'green'

    function transform(pre, pre_min, pre_max, post_min, post_max) {
        return ((pre - pre_min) / (pre_max - pre_min)) * (post_max - post_min) + post_min
    }

    var nodes
    var edges
    var tree
    var queue
    var root_index

    function init() {
        root_index = Math.floor(Math.random() * 20)
        nodes = []
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
        edges = []
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
        tree = []
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
        queue = [{index: root_index, node: nodes[root_index]}]
        makeCanvas(div, svg, canvasWidth, canvasHeight, bfs)
        displayCanvas()
    }

    init()

    function displayCanvas(timer=time_unit) {
        var canvas = d3.select('#' + svg)

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
            d3.select('#' + svg).on('click', function() {
                d3.select('#' + svg).remove()
                init()
            })
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
}

function topologicalSort() {
    const div = 'dfs'
    const svg = 'dfs-svg'
    const a = 5
    const b = 4
    const radius = Math.max(window.innerWidth, window.innerHeight) * .01
    const thinLineWidth = radius * .03
    const thickLineWidth = radius * .2
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
    const time_unit = 500
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
    const finished_color = 'orange'
    const line_color = 'green'

    function transform(pre, pre_min, pre_max, post_min, post_max) {
        return ((pre - pre_min) / (pre_max - pre_min)) * (post_max - post_min) + post_min
    }

    const x_slots = Array.from(
        dodecahedron_neighbors,
        (nbr, i) => transform(i, 0, dodecahedron_neighbors.length - 1, x_max, x_min)
    )

    var x_slot_index
    var nodes
    var edges
    var arrows
    var tree
    var stack
    var order

    init()

    function init() {
        order = shuffle(dodecahedron_neighbors.length)
        x_slot_index = 0
        nodes = []
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
        edges = []
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
        arrows = make_arrows()
        tree = []
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
        stack = []
        makeCanvas(div, svg, canvasWidth, canvasHeight, dfs)
        displayCanvas()
    }

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

    function displayCanvas(timer=time_unit) {
        var canvas = d3.select('#' + svg)

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

    function get_index(node) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].x == node.x && nodes[i].y == node.y)
                return i
        }
    }

    function get_edge(tail, head) {
        for (let i = 0; i < edges.length; i++) {
            if (edges[i].A == tail && edges[i].B == head)
                return edges[i]
        }
    }

    function dfs() {
        let current
        if (stack.length > 0) {
            current = stack[stack.length - 1]
            edge = get_edge(current.node.parent_index, get_index(current.node))
            if (edge)
                edge.width = thickLineWidth
        }
        else {
            search_order = shuffle(nodes.length)
            for (let i = 0; i < nodes.length; i++) {
                let j = search_order[i]
                if (nodes[j].color == original_color) {
                    current = {index: j, node: nodes[j]}
                    current.node.parent_index = j
                    stack.push(current)
                    break
                }
            }
            if (stack.length == 0) {
                window.setTimeout(top_sort, time_unit)
                return
            }
        }
        let old_node = (current.node.color != original_color)
        current.node.color = visited_color
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
        if (finished_flag && old_node) {
            stack.pop()
            current.node.final_x = x_slots[x_slot_index]
            current.node.color = finished_color
            current.node.order = 20 - x_slot_index
            x_slot_index++
        }
        displayCanvas()
        window.setTimeout(dfs, time_unit)
    }

    function top_sort() {
        edges.forEach(edge => edge.width = thinLineWidth)
        nodes.forEach(node => node.x = node.final_x)
        arrows = make_arrows()
        displayCanvas()
        d3.select('#' + svg).on('click', function() {
            d3.select('#' + svg).remove()
            init()
        })
    }
}

window.onload = function() {
    mergesort()
    heapsort()
    root()
    shortestPaths()
    topologicalSort()
}
