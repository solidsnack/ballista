import ode45 = require("ode45-cash-karp")

function vanderpol(dydt: number[], y: number[], _t: number) {
    dydt[0] = y[1]
    dydt[1] = 4 * (1 - y[0] * y[0]) * y[1] - y[0]
}

export function go(): void {
    const y0 = [2, 0]
    const t0 = 0
    const dt0 = 1e-3
    const integrator = ode45(y0, vanderpol, t0, dt0)

    const tmax = 10
    const results = []

    while (integrator.step(tmax)) {
        results.push([integrator.t, ...integrator.y])
    }

    for (const result of results) {
        console.log(result)
    }
}
