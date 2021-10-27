export interface GModel {
    entries(
        machNumber: number
    ): [[number, number]] | [[number, number], [number, number]]

    coefficientOfDrag(machNumber: number): number
}

export function tabular(table: Array<[number, number]>): GModel {
    return new Tabular(table)
}

class Tabular implements GModel {
    constructor(readonly table: Array<[number, number]>) {
        if (!(table.length > 0))
            throw new Error(
                "Please provide a non-empty table of coefficients."
            )
    }

    coefficientOfDrag(machNumber: number): number {
        const data = this.entries(machNumber)

        if (data.length == 1) {
            const [[_, cd]] = data
            return cd
        } else {
            const [[lesserMach, lesserCD], [greaterMach, greaterCD]] = data
            const distance = greaterMach - lesserMach
            const difference = greaterCD - lesserCD
            const offset = (machNumber - lesserMach) / distance
            const interpolation = difference * offset

            return lesserCD + interpolation
        }
    }

    entries(
        machNumber: number
    ): [[number, number]] | [[number, number], [number, number]] {
        if (!(this.table.length > 0)) throw new Error("Empty BC table??")

        if (this.table.length == 1) {
            const [[mach, cd]] = this.table
            if (mach == machNumber) return [[mach, cd]]
            throw new TableRangeError(
                `Mach ${machNumber} isn't covered by single entry table ` +
                    `(lone entry is for ${mach}).`
            )
        }

        let i = 0
        let j = this.table.length - 1

        while (j - i > 1) {
            const midpoint = i + Math.ceil((j - i) / 2)
            const mach = this.table[midpoint][0]

            if (mach >= machNumber) j = midpoint
            if (mach <= machNumber) i = midpoint
        }

        if (i == j) return [[...this.table[i]]]

        const [lesserMach, lesserBC] = this.table[i]
        const [greaterMach, greaterBC] = this.table[j]

        if (lesserMach < machNumber && greaterMach > machNumber)
            return [
                [lesserMach, lesserBC],
                [greaterMach, greaterBC],
            ]

        const [min, max] = [
            this.table[0][0],
            this.table[this.table.length - 1][0],
        ]

        throw new TableRangeError(
            `Mach ${machNumber} isn't covered by table (${min} to ${max}).`
        )
    }
}

export class TableRangeError extends Error {}
