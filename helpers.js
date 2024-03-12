const min = 0;
const max = 0;

export function minMax(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}



export function lerp(start, end, factor) {
	let result = start + (end - start) * factor;
	return result;
}