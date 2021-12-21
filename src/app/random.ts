export function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
}

export function getRandomItemFromSet<T>(set: Set<T>): T {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}
