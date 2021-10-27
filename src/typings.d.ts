declare module "ode45-cash-karp" {
    function ode45(
        y0: number[],
        deriv: DerivativeUpdateFunction,
        t0: number,
        dt0: number,
        options?: Partial<Options>
    ): Integrator

    export = ode45

    type DerivativeUpdateFunction = (
        dydt: number[],
        y: number[],
        t: number
    ) => void

    interface Integrator extends Options {
        n: number
        y: number[]
        deriv: DerivativeUpdateFunction
        t: number
        dt: number
        step(tLimit?: number): boolean
        steps(n: number, tLimit?: number): boolean
    }

    interface Options {
        tol: number
        maxIncreaseFactor: number
        maxDecreaseFactor: number
        dtMinMag: number
        dtMaxMag: number
        errorScaleFunction: (
            i: number,
            dt: number,
            y: number[],
            dydt: number[]
        ) => number
        errorReduceFunction: (
            i: number,
            accumulatedError: number,
            errorEstimate: number
        ) => number
        errorPostFunction: (accumulatedError: number) => number
        verbose: boolean
    }
}
