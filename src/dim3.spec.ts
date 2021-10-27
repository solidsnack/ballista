import * as dim3 from "./dim3"

describe("3-vector functions", () => {
    test("add()", () => {
        expect(dim3.add([1, 0, 0], [0, 0, 0])).toEqual([1, 0, 0])
        expect(dim3.add([0, 0, 0], [0, 0, 1])).toEqual([0, 0, 1])

        expect(dim3.add([1, 0, 0], [0, 1, 0])).toEqual([1, 1, 0])
        expect(dim3.add([0, 1, 0], [0, 0, 1])).toEqual([0, 1, 1])
        expect(dim3.add([0, 0, 1], [1, 0, 0])).toEqual([1, 0, 1])

        expect(dim3.add([1, 1, 0], [0, 1, 0])).toEqual([1, 2, 0])
        expect(dim3.add([0, 1, 1], [0, 0, 1])).toEqual([0, 1, 2])
        expect(dim3.add([1, 0, 1], [1, 0, 0])).toEqual([2, 0, 1])
    })

    test("multiply()", () => {
        expect(dim3.multiply(2, [0, 0, 0])).toEqual([0, 0, 0])

        expect(dim3.multiply(2, [1, 0, 0])).toEqual([2, 0, 0])
        expect(dim3.multiply(2, [1, 2, 3])).toEqual([2, 4, 6])
    })

    test("magnitude()", () => {
        expect(dim3.magnitude([0, 0, 0])).toEqual(0)

        expect(dim3.magnitude([1, 0, 0])).toEqual(1)
        expect(dim3.magnitude([0, 1, 0])).toEqual(1)
        expect(dim3.magnitude([0, 0, 1])).toEqual(1)

        expect(dim3.magnitude([3, 4, 0])).toEqual(5)
        expect(dim3.magnitude([0, 3, 4])).toEqual(5)
        expect(dim3.magnitude([4, 0, 3])).toEqual(5)
    })

    test("planes", () => {
        const upPlane = new dim3.Plane([0, 0, 0], [0, 1, 0])
        const dnPlane = new dim3.Plane([0, 0, 0], [0, -1, 0])

        expect(upPlane.altitude([1, 1, 1])).toBeGreaterThan(0)
        expect(upPlane.altitude([-1, -1, -1])).toBeLessThan(0)

        expect(dnPlane.altitude([1, 1, 1])).toBeLessThan(0)
        expect(dnPlane.altitude([-1, -1, -1])).toBeGreaterThan(0)
    })

    describe("rotation", () => {
        test("horizontal - up ¼ circle", () => {
            const r = new dim3.Rotation(1600, 0, dim3.NATOMRad)
            const [x, y, z] = r.rotate([1, 0, 0])
            expect(x).toBeCloseTo(0)
            expect(y).toBeCloseTo(1)
            expect(z).toBeCloseTo(0)
        })

        test("horizontal - up ⅛ circle", () => {
            const r = new dim3.Rotation(800, 0, dim3.NATOMRad)

            const [x, y, z] = r.rotate([Math.SQRT2, 0, 0])
            expect(x).toBeCloseTo(1)
            expect(y).toBeCloseTo(1)
            expect(z).toBeCloseTo(0)
        })

        test("horizontal - up 1 MRAD", () => {
            const r = new dim3.Rotation(1, 0, dim3.NATOMRad)
            const [x, y, z] = r.rotate([100, 0, 0])
            expect(x).toBeCloseTo(100) // Should change hardly at all
            expect(y).toBeCloseTo(0.1) // Should elevate by almost 1/1000th
            expect(z).toBeCloseTo(0)
        })

        test("vertical - down 1 MRAD", () => {
            const r = new dim3.Rotation(-1, 0, dim3.NATOMRad)
            const [x, y, z] = r.rotate([0, 100, 0])
            expect(x).toBeCloseTo(0.1) // Should elevate by almost 1/1000th
            expect(y).toBeCloseTo(100) // Should change hardly at all
            expect(z).toBeCloseTo(0)
        })
    })
})
