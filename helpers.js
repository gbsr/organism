export function minMax(min, max) {
    return min + (max - min) * Math.random();
}

export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

export function getRandomBrightColor() {
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * 30) + 70; // 70-100%
    const lightness = Math.floor(Math.random() * 30) + 50; // 50-80%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}