import { TICK } from "../common/tick";

export async function sleepMs(delayMs: number) {
    return new Promise((resolve) => { setTimeout(resolve, delayMs); });
}

export async function sleepTicks(delayTicks: number) {
    await sleepMs(delayTicks * TICK);
}
