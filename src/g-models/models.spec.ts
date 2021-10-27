import { GModel, tabular } from "./models"

describe("tabular G models", () => {
    const linearTable: Array<[number, number]> = [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
    ]
    const linearModel: GModel = tabular(linearTable)

    const unaryModel: GModel = tabular([[1, 1]])

    test("entries() provides exact entry when available", () => {
        expect(linearModel.entries(1)).toEqual([linearTable[1]])
        expect(unaryModel.entries(1)).toEqual([[1, 1]])
    })

    test("entries() provides neighbouring entries", () => {
        const entries = linearModel.entries(2.5)
        expect(entries).toEqual([linearTable[2], linearTable[3]])
    })

    test("entries() errors when requests are out of range", () => {
        expect(() => linearModel.entries(-1)).toThrow()
        expect(() => linearModel.entries(5)).toThrow()
        expect(() => unaryModel.entries(0)).toThrow()
        expect(() => unaryModel.entries(2)).toThrow()
    })

    test("empty models can not be constructed", () => {
        expect(() => tabular([])).toThrow()
    })

    test("coefficientOfDrag() provides exact value when available", () => {
        expect(linearModel.coefficientOfDrag(1)).toEqual(1)
        expect(unaryModel.coefficientOfDrag(1)).toEqual(1)
    })

    test("coefficientOfDrag() interpolates linearly", () => {
        expect(linearModel.coefficientOfDrag(2.5)).toBeCloseTo(2.5)
    })
})
