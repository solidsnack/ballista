/**
 *  Three-space functions and datatypes.
 *
 * @remarks
 *
 *  Right-handed coordinate system (if the x-axis increases to the right along
 *  the bottom of the screen and the y-axis increases to the top along the
 *  left side of the screen then z-axis increases pointing out of the screen.)
 *
 */

export type Vec = [number, number, number]

export type Matrix = [Vec, Vec, Vec]

export function add(a: Vec, b: Vec): Vec {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

export function multiply(c: number, a: Vec): Vec {
    return [c * a[0], c * a[1], c * a[2]]
}

export function sum(a: Vec): number {
    return a[0] + a[1] + a[2]
}

export function difference(a: Vec, b: Vec): Vec {
    return add(a, multiply(-1, b))
}

export function dot(a: Vec, b: Vec): number {
    return sum([a[0] * b[0], a[1] * b[1], a[2] * b[2]])
}

export function magnitude(a: Vec): number {
    return Math.sqrt(dot(a, a))
}

export function m_v_multiply(m: Matrix, v: Vec): Vec {
    const [row1, row2, row3] = m

    return [dot(row1, v), dot(row2, v), dot(row3, v)]
}

export enum AngularMeasure {
    Radian = 2 * Math.PI,
    NATOMRad = 6400,
    Degree = 360,
}

export const { Radian, NATOMRad, Degree } = AngularMeasure

export class Rotation {
    private readonly radianValues: [number, number]

    constructor(
        readonly elevation: number,
        readonly bearing: number,
        readonly units: AngularMeasure = Radian
    ) {
        let factor = 1
        switch (this.units) {
            case Radian:
                factor = 1
                break
            case NATOMRad:
                factor = Radian.valueOf() / NATOMRad.valueOf()
                break
            case Degree:
                factor = Radian.valueOf() / Degree.valueOf()
                break
        }

        this.radianValues = [factor * elevation, factor * bearing]

        for (const radians of this.radianValues) {
            if (Math.abs(radians) <= Radian.valueOf() / 1) continue

            throw new Error("Rotations must be no greater than half a circle.")
        }
    }

    get radians(): Rotation {
        switch (this.units) {
            case Radian:
                return this
            default:
                return new Rotation(this.radianValues[0], this.radianValues[1])
        }
    }

    get matrix(): Matrix {
        const [elevation, _bearing] = this.radianValues
        const elevationMatrix: Matrix = [
            [Math.cos(elevation), -Math.sin(elevation), 0],
            [Math.sin(elevation), Math.cos(elevation), 0],
            [0, 0, 1],
        ]

        // const bearingMatrix: Matrix = [
        //     [Math.cos(bearing), -Math.sin(bearing), 0],
        //     [Math.sin(bearing), Math.cos(bearing), 0],
        //     [0, 0, 1],
        // ]

        // console.dir({ elevation: elevation, elevationMatrix })

        // const bearing: Matrix = [
        //     [Math.cos(this.bearing), -Math.sin(this.bearing), 0],
        //     [Math.sin(this.bearing), Math.cos(this.bearing), 0],
        //     [0, 0, 0],
        // ]

        return elevationMatrix
    }

    rotate(v: Vec): Vec {
        return m_v_multiply(this.matrix, v)
    }
}

/*
    function convertNATOMRadToRadians(mrad: number): number {
        return 2 * Math.PI * (mrad / 6400)
    }

    // Glock configuration for 25m zero.
    const siteHeight = 0.014 // Measured with tape measure
    // Angle of elevation per JBM calculator
    const angle = convertNATOMRadToRadians(1.65)
    const rotationMatrix: dim3.Matrix = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 0],
    ]

*/

export class Plane {
    constructor(readonly point: Vec, readonly normal: Vec) {
        const mNormal = magnitude(normal)

        if (mNormal != 1) {
            this.normal = multiply(1 / mNormal, normal)
        }
    }

    /// Negative for vectors below the plane, positive for vectors above it.
    altitude(point: Vec): number {
        const diff = difference(point, this.point)
        return dot(diff, this.normal)
    }
}
