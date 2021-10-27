import g1data from "./g1.json"
import g7data from "./g7.json"

import { GModel, tabular } from "./models"

export { tabular } from "./models"
export type { GModel, TableRangeError } from "./models"

function machSortedTable(data: typeof g1data): Array<[number, number]> {
    return data
        .map(({ mach, cd }) => [mach, cd] as [number, number])
        .sort((a, b) => a[0] - b[0])
}

export const g1: GModel = tabular(machSortedTable(g1data))
export const g7: GModel = tabular(machSortedTable(g7data))
