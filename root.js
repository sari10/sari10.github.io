let canvasWidth = .95 * window.innerWidth
let canvasHeight = .7 * window.innerHeight
let time_unit = 1000
let points = Array.from({length: canvasWidth}, (v, i) => i)
let coefficients = [0, 0.25, 0.5]
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
let nextNewtonLine = newton

function f(x) {
    let z = x / canvasWidth
    return canvasHeight * (coefficients[0] + coefficients[1] * z + coefficients[2] * Math.pow(z, 2))
}

function f_prime(x) {
    let z = x / canvasWidth
    return canvasHeight * (coefficients[1] + 2 * coefficients[2] * z)
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

function displayCanvas(timer=time_unit) {
    let canvas = d3.select('svg')
    let circles = canvas.selectAll('circle')
        .data(
            [
                {x: mid, y: canvasHeight - f(mid), color: 'blue'},
                {x: lo, y: canvasHeight - zero, color: 'blue'},
                {x: hi, y: canvasHeight - zero, color: 'blue'},
                {x: nextNewton, y: canvasHeight - zero, color: 'purple'}
            ]
        )
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
        .data(
            [
                {x1: 0, x2: canvasWidth, y1: canvasHeight - zero, y2: canvasHeight - zero, color: 'black'},
                {x1: 0, x2: canvasWidth, y1: canvasHeight - zero, y2: canvasHeight - zero, color: 'black'},
                {x1: newton, x2: nextNewtonLine, y1: canvasHeight - f(newton), y2: canvasHeight - zero, color: 'purple'}
            ]
        )
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

function bisect_lo_hi() {
    if (hi <= lo + threshold) {
        hi = mid
        lo = mid
    }
    if (f(mid) >= zero)
        hi = mid
    if (f(mid) <= zero)
        lo = mid
    displayCanvas()
    if (lo != hi)
        window.setTimeout(bisect_mid, time_unit)
    else
        window.setTimeout(init_newton, time_unit)
}

function bisect_mid() {
    mid = lo + (hi - lo) / 2
    displayCanvas()
    window.setTimeout(bisect_lo_hi, time_unit)
}

function init_newton() {
    newton = radius
    nextNewton = newton
    nextNewtonLine = newton
    displayCanvas()
    window.setTimeout(get_next_newton, time_unit)
}

function get_next_newton() {
    nextNewtonLine = newton - ((f(newton) - zero) / f_prime(newton)) * canvasWidth
    displayCanvas()
    window.setTimeout(move_newton_point, time_unit)
}

function move_newton_point() {
    nextNewton = nextNewtonLine
    displayCanvas()
    window.setTimeout(move_newton_line, time_unit)
}

function move_newton_line() {
    console.log('inter', newton, nextNewton)
    oldNewton = newton
    newton = nextNewton
    displayCanvas()
    if (Math.abs(newton - oldNewton) > threshold)
        window.setTimeout(get_next_newton, time_unit)
}

window.onload = function() {
    makeCanvas()
    displayCanvas()
    window.setTimeout(bisect_lo_hi, time_unit)
}
