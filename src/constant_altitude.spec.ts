import * as fs from "fs/promises"

import * as circle from "./circle"
import { Solver } from "./constant_altitude"
import * as dim3 from "./dim3"
import { g1, g7 } from "./g-models"
import { meterPlanes } from "./planes"

describe("9mm NATO test", () => {
    // SB V310492
    const solver = new Solver({
        drag: {
            model: g1,
            bc: 0.089,
        },
        mass: 0.008,
        area: circle.areaFromDiameter(0.00901),
    })

    // Glock configuration for 25m zero.
    const siteHeight = 0.014 // Measured with tape measure
    // Angle of elevation per JBM calculator
    const angle = convertNATOMRadToRadians(1.65)
    const v: dim3.Vec = [360, 0, 0]

    const v0: dim3.Vec = applyElevation(angle, v)
    const p0: dim3.Vec = [0, -siteHeight, 0]

    test("tabulate() produces results", async () => {
        const table = []

        for (const data of solver.tabulate(v0, p0)) {
            const [_plane, state] = data
            const [_t, _v, [x, _y, _z]] = state
            if (x >= 101) break
            table.push(state)
        }

        expect(table[0]).toEqual([0, v0, p0])
        expect(table.length).toBeGreaterThan(10)

        const tenthV = table[9][1]
        expect(tenthV[0]).toBeLessThan(v0[0] - 1)

        await writeTable(table, "tmp/sb-V310492")
    })
})

describe("Mk 262 (5.56mm) test", () => {
    const solver = new Solver({
        drag: {
            model: g7,
            bc: 0.181,
        },
        mass: 0.005,
        area: circle.areaFromDiameter(0.0057),
    })

    // Mk 12 SPR (an AR-15 variant) configuration.
    const siteHeight = 0.066
    // Zero close to 50m.
    const angle = convertNATOMRadToRadians(1.8) //681)
    const v: dim3.Vec = [838, 0, 0]

    const v0: dim3.Vec = applyElevation(angle, v)
    const p0: dim3.Vec = [0, -siteHeight, 0]

    test("tabulate() produces results", async () => {
        const table = []
        const planes: dim3.Plane[] = meterPlanes(0, 50, 100, 200, 400)

        for (const data of solver.tabulate(v0, p0, 0, planes)) {
            const [_plane, state] = data
            table.push(state)
        }

        // expect(table.length).toEqual(3)
        expect(table[0]).toEqual([0, v0, p0])

        const within = (a: number, b: number, absDiff: number) => {
            expect(Math.abs(a - b)).toBeLessThanOrEqual(absDiff)
        }

        // Overall our trajectories are (a) too low and (b) too fast.

        // 50m
        const canonical050m = { t: 0.061, v: 796, y: 0 }
        const result050m = table[1]
        within(t(result050m), canonical050m.t, 0.001)
        within(drop(result050m), canonical050m.y, 0.01)
        within(totalV(result050m), canonical050m.v, 10)

        // 100m
        const canonical100m = { t: 0.126, v: 755, y: 0.027 }
        const result100m = table[2]
        within(t(result100m), canonical100m.t, 0.001)
        within(drop(result100m), canonical100m.y, 0.03)
        within(totalV(result100m), canonical100m.v, 16)

        // 200m
        const canonical200m = { t: 0.266, v: 677, y: -0.052 }
        const result200m = table[3]
        within(t(result200m), canonical200m.t, 0.004)
        within(drop(result200m), canonical200m.y, 0.05)
        within(totalV(result200m), canonical200m.v, 25)

        // 400m
        const canonical400m = { t: 0.598, v: 536, y: -0.911 }
        const result400m = table[4]
        within(t(result400m), canonical400m.t, 0.02)
        within(drop(result400m), canonical400m.y, 0.05)
        within(totalV(result400m), canonical400m.v, 50)

        await writeTable(table, "tmp/mk262")
    })
})

async function writeTable(
    table: Array<[number, [number, number, number], [number, number, number]]>,
    file: string
) {
    const f = await fs.open(file, "w")
    for (const [t, v, p] of table) await f.write(`${t}\t${v}\t${p}\n`)
    await f.close()
}

function convertNATOMRadToRadians(mrad: number): number {
    return 2 * Math.PI * (mrad / 6400)
}

function applyElevation(elevation: number, v: dim3.Vec): dim3.Vec {
    const rotationMatrix: dim3.Matrix = [
        [Math.cos(elevation), -Math.sin(elevation), 0],
        [Math.sin(elevation), Math.cos(elevation), 0],
        [0, 0, 0],
    ]

    return dim3.m_v_multiply(rotationMatrix, v)
}

type State = [number, [number, number, number], [number, number, number]]

function drop(state: State): number {
    const [_t, _v, [_x, y, _z]] = state
    return y
}

function t(state: State): number {
    const [t, _v, _p] = state
    return t
}

function totalV(state: State): number {
    const [_t, v, _p] = state
    return dim3.magnitude(v)
}
