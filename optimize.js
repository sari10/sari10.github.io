let ratio = 2
let x_size = .98 * window.innerWidth
let y_size = x_size / ratio
let u_max = 5
let u_min = -u_max
let u_size = u_max - u_min
let v_max = u_max / ratio
let v_min = u_min / ratio
let v_size = u_size / ratio
let gradient_timer = 200
let newton_timer = 2000
let timer = gradient_timer
let height = 10
let width = 10
let lineWidth = 2
let pointRadius = 5
let dashArray = 3
let gradient_color = 'blue'
let newton_color = 'purple'
let box_color = 'black'
let start_x = 2 * pointRadius
let start_y = 2 * pointRadius
let coef = {u: 1, v: 4}
let contours = Array.from({length: 12}, (v, i) => Math.pow(2, i - 5))
let gradient_point = {cx: start_x, cy: start_y, r: pointRadius, color: gradient_color}
let newton_point = {cx: start_x, cy: -start_y, r: pointRadius, color: newton_color}
let points = []
let line_data = []
let step_size = .07
let threshold = .001

function f(u, v) { return coef.u * Math.pow(u, 2) + coef.v * Math.pow(v, 2) }
function grad_f(u, v) { return {u: 2 * coef.u * u, v: 2 * coef.v * v} }
function hess_f(u, v) { return {uu: 2 * coef.u, uv: 0, vu: 0, vv: 2 * coef.v} }
function get_x(u) { return ((u - u_min) / u_size) * x_size }
function get_y(v) { return y_size - ((v - v_min) / v_size) * y_size }
function get_u(x) { return u_min + u_size * (x / x_size) }
function get_v(y) { return v_min + (1 - (y / y_size)) * v_size }

function get_contour(z) {
    return {
        rx: Math.pow(z / coef.u, .5) * (x_size / u_size),
        ry: Math.pow(z / coef.v, .5) * (y_size / v_size)
    }
}
function make_contour_data() { return contours.map(get_contour) }

function makeCanvas() {
    let canvas = d3.select('body')
        .append('svg')
        .attr('width', x_size)
        .attr('height', y_size)
    canvas.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', x_size)
        .attr('height', y_size)
        .attr('stroke', box_color)
        .attr('stroke-width', 2)
        .attr('fill', 'none')
}

function displayCanvas() {
    let canvas = d3.select('svg')
    let contours = canvas.selectAll('ellipse')
        .data(make_contour_data())
    contours.enter()
        .append('ellipse')
        .attr('cx', get_x(0))
        .attr('cy', get_y(0))
        .attr('rx', d => d.rx)
        .attr('ry', d => d.ry)
        .attr('stroke', 'green')
        .attr('stroke-width', lineWidth)
        .attr('fill', 'none')
    let lines = canvas.selectAll('line')
        .data(line_data)
    lines.enter()
        .append('line')
        .attr('x1', d => d.x1)
        .attr('x2', d => d.x2)
        .attr('y1', d => d.y1)
        .attr('y2', d => d.y2)
        .attr('stroke', d => d.color)
        .attr('stroke-width', lineWidth)
        .attr('stroke-dasharray', dashArray)
    lines.transition()
        .duration(timer)
        .attr('x2', d => d.x2)
        .attr('y2', d => d.y2)
    let circles = canvas.selectAll('circle')
        .data(points)
    circles.enter()
        .append('circle')
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
        .attr('r', d => d.r)
        .attr('fill', d => d.color)
    circles.transition() 
        .duration(timer)
        .attr('cx', d => d.cx)
        .attr('cy', d => d.cy)
}

function create_line(point, iterator, next_iterator) {
    line_data.push({
        x1: point.cx,
        x2: point.cx,
        y1: point.cy,
        y2: point.cy,
        color: point.color
    })
    displayCanvas()
    extend_line(point, iterator, next_iterator)
}

function gradient_step(u, v) {
    let direction = grad_f(u, v)
    let step = {
        u: u - direction.u * step_size,
        v: v - direction.v * step_size,
        size: Math.pow(direction.u, 2) + Math.pow(direction.v, 2)
    }
    return step
}

function inverse(matrix) {
    let det = matrix.uu * matrix.vv - matrix.uv * matrix.vu
    return {
        uu: matrix.vv / det,
        uv: -matrix.uv / det,
        vu: -matrix.vu / det,
        vv: matrix.uu / det
    }
}

function product(matrix, vector) {
    return {
        u: matrix.uu * vector.u + matrix.uv * vector.v,
        v: matrix.vu * vector.u + matrix.vv * vector.v
    }
}

function newton_step(u, v) {
    let gradient = grad_f(u, v)
    let hessian = hess_f(u, v)
    let direction = product(inverse(hessian), gradient)
    let step = {
        u: u - direction.u,
        v: v - direction.v,
        size: Math.pow(direction.u, 2) + Math.pow(direction.v, 2)
    }
    return step
}

function extend_line(point, iterator, next_iterator) {
    let current_u = get_u(point.cx)
    let current_v = get_v(point.cy)
    let step = iterator(current_u, current_v)
    let next_x = get_x(step.u)
    let next_y = get_y(step.v)
    line_data[line_data.length - 1].x2 = next_x
    line_data[line_data.length - 1].y2 = next_y
    point.cx = next_x
    point.cy = next_y
    displayCanvas()
    if (step.size > threshold)
        window.setTimeout(create_line, timer, point, iterator, next_iterator)
    else
        window.setTimeout(next_iterator, timer)
}

function newton_init() {
    points.push(newton_point)
    displayCanvas()
    window.setTimeout(newton_enter, timer)
}

function newton_enter() {
    newton_point.cy = start_y
    timer = newton_timer
    displayCanvas()
    window.setTimeout(create_line, timer, newton_point, newton_step)
}

window.onload = function() {
    makeCanvas()
    points.push(gradient_point)
    displayCanvas()
    window.setTimeout(create_line, timer, gradient_point, gradient_step, newton_init)
}
