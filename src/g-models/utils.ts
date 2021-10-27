const pound = 0.454 // Definition
const inch = 0.0254 // Definition

// Ballistic coefficients expressed in customary are pounds/inch².
const customaryBC = pound / (inch * inch)

export const bcConversions = {
    customary: {
        toMGS: customaryBC,
        // Ballistic coefficients in metric are expressed as kg/m².
        fromMGS: 1 / customaryBC,
    },
}

// Convert textual, tab-separated, customary data to numeric, metric data.
export function readCustomaryTSV(text: string): Array<[number, number]> {
    return text
        .split(/\n+/g)
        .map((line) => line.split(/\t/, 2))
        .map((array) => [array[0], array[1]])
        .filter(([mach, customaryBC]) => !!mach && !!customaryBC)
        .map(([mach, customaryBC]) => [
            parseFloat(mach),
            parseFloat(customaryBC),
        ])
        .map(([mach, customaryBC]) => [
            mach,
            customaryBC * bcConversions.customary.toMGS,
        ])
}
