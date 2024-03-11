const min = 0;
const max = 0;

export function minMax(min, max) {
	let value = min + (max - min) * Math.random();
	return value;
}
