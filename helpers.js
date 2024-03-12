const min = 0;
const max = 0;

export function minMax(min, max) {
	let value = min + (max - min) * Math.random();
	return value;
}


export function lerp(start, end, factor) {
	let result = start + (end - start) * factor;
	return result;
}