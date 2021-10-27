import { Plane, Vec } from "./dim3"

export const horizontalNormal: Vec = [1, 0, 0]

export const meterPlanes1km: Plane[] = Array.from(Array(1001).keys()).map(
    (i) => new Plane([i, 0, 0], horizontalNormal)
)

export function meterPlanes(...distances: number[]): Plane[] {
    return distances.map((i) => new Plane([i, 0, 0], horizontalNormal))
}
