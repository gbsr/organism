// Description: This file contains versatile helper functions
let lastTime = Date.now();

export function GetDeltaTime() {
	let currentTime = Date.now();
	let deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
	lastTime = currentTime;
	if (deltaTime < 0.016) { // If deltaTime is less than 16 ms (equivalent to 60 FPS)
		deltaTime = 0.016; // Set it to 16 ms
	}
	return deltaTime;
}
export function minMax(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
export function lerp(start, end, weight) {
	return start * (1 - weight) + end * weight;
}
export function randomBetween(min, max) {
	return Math.random() * (max - min) + min;
}
export function randomIntBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
export function randomColor() {
	const r = Math.floor(Math.random() * 255);
	const g = Math.floor(Math.random() * 255);
	const b = Math.floor(Math.random() * 255);

	return `rgb(${r}, ${g}, ${b})`;
}

export function getRGBA(color, alpha) {
	const colors = {
		'red': '255,0,0',
		'green': '0,255,0',
		'blue': '0,0,255',
		// Add more colors as needed
	};

	return `rgba(${colors[color]},${alpha})`;
}
export function randomFromArray(array) {
	return array[Math.floor(Math.random() * array.length)];
}
export function randomBoolean() {
	return Math.random() < 0.5;
}
export function weightedProbabilityBoolean(weight) {
	return Math.random() < weight;
}


/**
 * Sets up an input slider element to update a variable
 * when the slider value changes.
 *
 * @param {HTMLInputElement} slider - The slider input element.
 * @param {Function} variableSetter - The function to call to update the variable.
 * @param {Function} conversionFunction - Optional function to convert the slider value before updating the variable.
 */
export function setupSlider(slider, variableSetter, conversionFunction = (x) => x) {
	slider.addEventListener("input", function () {
		variableSetter(conversionFunction(this.value));
	});
}

/**
 * Sets up a button to call the given action when clicked.
 * 
 * @param {HTMLButtonElement} button - The button element to attach the click handler to.
 * @param {Function} action - The callback function to run when the button is clicked.
 */
export function setupButton(button, action) {
	button.addEventListener('click', action);
}

/**
 * Sets up a checkbox UI element to update a variable when checked/unchecked.
 *
 * @param {HTMLInputElement} checkbox - The checkbox input element.
 * @param {Function} variableSetter - The function to call to set the variable value.
 */
export function setupCheckbox(checkbox, variableSetter) {
	checkbox.checked = variableSetter();
	checkbox.addEventListener("input", function () {
		variableSetter(this.checked);
		console.log('I am: ' + this.checked);
	});
}
