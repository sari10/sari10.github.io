let canvasWidth = .95 * window.innerWidth
let canvasHeight = .7 * window.innerHeight
let bisect_time_unit = 700
let newton_time_unit = 1000
let points = Array.from({length: canvasWidth}, (v, i) => i)
let coefficients = [0, 0.25, 0.5, 0.0]
let radius = 7
let lineWidth = 3
let axisWidth = 2

let lo = radius
let hi = canvasWidth - radius
let mid = lo + (hi - lo) / 2
let zero = canvasHeight * .19
let threshold = canvasWidth / 1000

let newton = - radius
let nextNewton = newton
let newton_line_visible = false

let x_axis = {x1: 0, x2: canvasWidth, y1: canvasHeight - zero, y2: canvasHeight - zero, color: 'black'}

function f(x) {
    let z = x / canvasWidth
    let y = 0
    for (let i = 0; i < coefficients.length; i++)
        y += coefficients[i] * Math.pow(z, i)
    return 2 * lineWidth + canvasHeight * y
}

function f_prime(x) {
    let z = x / canvasWidth
    let y = 0
    for (let i = 1; i < coefficients.length; i++)
        y += i * coefficients[i] * Math.pow(z, i - 1)
    return canvasHeight * y
}

function makeCanvas() {
    let canvas = d3.select('body')
        .append('svg') 
        .attr('width', canvasWidth)
        .attr('height', canvasHeight)
    canvas.append('path')
        .attr('d', d3.line().x(d => d).y(d => canvasHeight - f(d))(points))
        .attr('stroke', 'green')
        .attr('stroke-width', lineWidth)
        .attr('fill', 'none')
}

function displayCanvas(timer) {
    let canvas = d3.select('svg')
    let circles = canvas.selectAll('circle')
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
    let lines = canvas.selectAll('line')
        .data([x_axis, make_newton_line()])
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

function make_newton_line() {
    return {
        x1: newton,
        x2: nextNewton,
        y1: newton_line_visible ? canvasHeight - f(newton) : canvasHeight - zero,
        y2: canvasHeight - zero,
        color: 'purple'
    }
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
}

window.onload = function() {
    makeCanvas()
    displayCanvas()
    window.setTimeout(bisect_lo_hi, bisect_time_unit)
}
