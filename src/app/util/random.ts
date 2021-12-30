export function randomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function randomFromSet<T>(set: Set<T>): T {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}
