import ode45 = require("ode45-cash-karp")

import * as dim3 from "./dim3"
import { GModel } from "./g-models/models"
import { meterPlanes1km } from "./planes"

// NB: Internal calculations are assumed to be metric.

export class Solver {
    constructor(
        readonly projectile: {
            area: number
            drag: {
                model: GModel
                bc: number
            }
            mass: number
        },
        readonly density: number = isaSeaLevelDensity,
        readonly mach1: number = isaSeaLevelSoundSpeed,
        readonly gravity: number = standardGravity
    ) {}

    private dragFunction(): (
        dvdt: [number, number, number],
        v: [number, number, number]
    ) => void {
        const { projectile, density, mach1, gravity } = this
        const vectorGravity: [number, number, number] = [0, gravity, 0]

        return (
            dvdt: [number, number, number],
            v: [number, number, number]
        ) => {
            const absV = dim3.magnitude(v)
            const machNumber = absV / mach1

            const dragCoefficient = projectile.drag.model.coefficientOfDrag(
                machNumber
            )

            const absForce =
                (1 / 2) *
                density *
                (absV * absV) *
                dragCoefficient *
                projectile.area

            const absAcceleration = absForce / projectile.mass

            const acceleration = dim3.add(
                // Effectively the same as multiplying `-acceleration` by the
                // unit vector in the direction of `v`.
                dim3.multiply(-absAcceleration / absV, v),
                vectorGravity
            )

            dvdt[0] = acceleration[0]
            dvdt[1] = acceleration[1]
            dvdt[2] = acceleration[2]
        }
    }

    /**
     * Generates the full (infinite) of the projectile, emitting points along
     * the way based on whatever step size the integrator chooses. This is
     * fairly efficient since the integrator can often take quite long steps.
     */
    *path(
        v: [number, number, number],
        p: [number, number, number] = [0, 0, 0],
        t = 0,
        tMaxStep?: number
    ): Iterable<[number, [number, number, number], [number, number, number]]> {
        let lastTime = t
        let lastVelocity = v
        let lastPosition = p

        const baseStep = 1e-6
        const f = this.dragFunction()
        const integrator = ode45([...lastVelocity], f, t, baseStep, {
            dtMaxMag: tMaxStep,
            verbose: false,
        })

        // The initial point is returned as the first point in the path.
        yield [lastTime, [...lastVelocity], [...lastPosition]]

        while (integrator.step()) {
            const velocity = integrator.y as [number, number, number]
            const averageVelocity = dim3.multiply(
                1 / 2,
                dim3.add(velocity, lastVelocity)
            )
            const timePassed = integrator.t - lastTime
            const step = dim3.multiply(timePassed, averageVelocity)
            const position = dim3.add(lastPosition, step)

            lastTime = integrator.t
            lastVelocity = velocity
            lastPosition = position

            yield [lastTime, [...lastVelocity], [...lastPosition]]
        }
    }

    *tabulate(
        v: [number, number, number],
        p: [number, number, number] = [0, 0, 0],
        t = 0,
        planesOfInterest = meterPlanes1km
    ): Iterable<
        [
            typeof planesOfInterest[0],
            [number, [number, number, number], [number, number, number]]
        ]
    > {
        if (planesOfInterest.length <= 0) return
        const planes = [...planesOfInterest]
        let prior:
            | [number, [number, number, number], [number, number, number]]
            | undefined

        // let counter = 0

        for (const state of this.path(v, p, t)) {
            const passed = []
            const [_t, _v, position] = state

            if (planes.length <= 0) break

            while (planes.length > 0 && planes[0].altitude(position) > 0) {
                // console.log(
                //     `At ${position}, passed plane: ${JSON.stringify(
                //         planes[0]
                //     )}`
                // )
                passed.push(planes.shift())
            }

            // counter += 1

            // if (counter > 1) throw new Error("Breakpoint")

            // If there is no prior point, we drop the passed planes.
            if (prior) {
                // Restart the simulation from the prior point, stopping at the
                // current point, taking only very small time steps.
                const [t, v, p] = prior
                const step = 0.00001 // At 1km/s, amounts to 1cm.
                for (const innerState of this.path(v, p, t, step)) {
                    // Step through the simulation till we run out of planes.
                    if (passed.length <= 0) break

                    const [_t, _v, position] = innerState

                    // The first point on a plane or that passes the plane is
                    // the one that we count for that plane.
                    while (passed[0] && passed[0].altitude(position) >= 0) {
                        yield [passed[0], innerState]
                        passed.shift()
                    }
                }
            }

            prior = state
        }
    }
}

/** https://en.wikipedia.org/wiki/Standard_gravity */
export const standardGravity = -9.80665

/**
 * International Standard Atmosphere
 * https://en.wikipedia.org/wiki/International_Standard_Atmosphere
 * http://www.aerodynamics4students.com/properties-of-the-atmosphere/
 */
export const isaSeaLevelDensity = 1.225 // in kg/m3
export const isaSeaLevelSoundSpeed = 340.3
