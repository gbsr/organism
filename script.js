
import { Effect } from '../classes/effect.js';
import { minMax } from './classes/helpers/helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
const mouseAttractOffsetX = minMax(-0.2, 0.2);
const mouseAttractOffsetY = minMax(-0.3, 0.24);
const mouseAttractSpeed = minMax(0.2, 0.4);

canvas.width = card.clientWidth;
canvas.height = card.clientHeight;
ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
// ctx.strokeStyle = 'pink';
ctx.lineWidth = minMax(1, 4);

console.log(ctx);

export let maxDistance = minMax(1, 95);
export let numberOfParticles = minMax(40, 80);
export let perceptionRadius = minMax(40, 80);

// swarming behaviour
export let attractionForce = 0;
export let separationForce = 0.8;
export let alignmentForce = 0;
export let minDistance = 0;

export let maxVelocity = 1.4;
export let minVelocity = 0.9;
export let maxAcceleration = 1.35;
export let mutatedMaxVelocity = 0.1;
export let mutatedMinVelocity = 0.005;
export let particleColor = 'pink';



let particleRepelRadius = [30, 90];
let particleSizeRange = [3, 7];
let targetDistance = maxDistance;
let isRepellingMouse = true;
let isAttractedToMouse = false;
let hasBeenTweaked = false;
let isLeader = false;

let alpha = 0.1;
let blurAmount = 30;
let blurColor = 'lightblue';

// not used for now
const mouseRadiusRange = [10, 80];
const mouseRepelRange = [10, 20];


let attractionSlider = document.getElementById('attractionForce');
let separationSlider = document.getElementById('separationForce');
let alignmentSlider = document.getElementById('alignmentForce');
let minDistanceSlider = document.getElementById('minDistance');
// let particleSizeRangeSlider = document.getElementById('particleSizeRange');
let numberOfParticlesSlider = document.getElementById('particleNumberRange');


const effect = new Effect(
	canvas,
	numberOfParticles,
	particleSizeRange,
	particleRepelRadius,
	particleColor,
	mouseRadiusRange,
	mouseRepelRange,
	isRepellingMouse,
	isAttractedToMouse,
	hasBeenTweaked,
	isLeader,
	perceptionRadius,
);

setupSliderElements();

document.querySelector('.reloadSystem').addEventListener('click', function () {
	effect.handleParticles(ctx, true);
});
/**
 * Sets up slider UI elements and binds them to Boids simulation parameters.
 *
 * Takes an array of slider config objects, each with:
 * - element: The slider DOM element
 * - start: The initial value [current, end]
 * - range: Map of display value => simulation value
 * - variable: The simulation variable to update
 */
function setupSliderElements() {
	const sliders = [
		{
			element: attractionSlider,
			start: [0, 0],
			range: { min: 0.1, "1%": 0.1, "50%": 2.5, max: 10 },
			variable: "attractionForce",
		},
		{
			element: separationSlider,
			start: [0, 0],
			range: { min: 0.1, "1%": 0.1, "50%": 2.5, max: 5 },
			variable: "separationForce",
		},
		{
			element: alignmentSlider,
			start: [0, 0],
			range: { min: 0.1, "1%": 0.1, "50%": 2.5, max: 5 },
			variable: "alignmentForce",
		},
		{
			element: minDistanceSlider,
			start: [0, 0],
			range: { min: 1, "0%": 0, "50%": 50, max: 100 },
			variable: "minDistance",
		},
		// { element: particleSizeRangeSlider, start: [0, 0], range: { 'min': 1, '1%': 0.1, '50%': 13, 'max': 25 }, variable: 'particleSize' },
		{
			element: numberOfParticlesSlider,
			start: [0, 0],
			range: { min: 1, "1%": 1, "50%": 100, max: 200 },
			variable: "numberOfParticles",
		},
	];

	/**
	 * Sets up slider UI elements saved above and binds them to simulation parameters.
	 *
	 * Loops through each slider config object and initializes a noUiSlider,
	 * setting the start value, range, and tooltips.
	 *
	 * Registers an 'update' event listener that gets the new slider values
	 * and updates the corresponding simulation variable.
	 *
	 * If the numberOfParticles variable is updated, calls handleParticlePopulation().
	 * Otherwise calls updateParticles() to update the particle simulation.
	 */
	sliders.forEach((slider) => {
		noUiSlider.create(slider.element, {
			start: slider.start,
			connect: true,
			range: slider.range,
			tooltips: [true, true],
		});

		// Listen for the update event
		slider.element.noUiSlider.on("update", function (values, handle) {
			// Update the variable with the new value
			let minNumber = Number(values[0]);
			let maxNumber = Number(values[1]);

			if (slider.variable === "numberOfParticles") {
				effect.handleParticlePopulation(minNumber, maxNumber);
			} else {
				if (slider.variable === "attractionForce") {
					attractionForce = minMax(minNumber, maxNumber);
				} else if (slider.variable === "separationForce") {
					separationForce = minMax(minNumber, maxNumber);
				} else if (slider.variable === "alignmentForce") {
					alignmentForce = minMax(minNumber, maxNumber);
				} else if (slider.variable === "minDistance") {
					minDistance = minMax(minNumber, maxNumber);
					// } else if (slider.variable === 'particleSize') {
					// 	particleSize = minMax(minNumber, maxNumber);
				}
				effect.updateParticles(slider.variable, minNumber, maxNumber);
			}
		});
	});
}
export function randomizeParticles(particle) {
	particle.size = minMax(particleSizeRange[0], particleSizeRange[1]);
	particle.color = particleColor;
}
// updates max distance particles can connect to each other. Will be a control later.
function updateMaxDistance() {
	targetDistance = minMax(1, 80);
	setTimeout(updateMaxDistance, minMax(5000, 20000));
}
function animate() {
	let fillColor = `rgba(0, 0,255, ${alpha})`;

	ctx.shadowBlur = `${blurAmount}`; // Adjust the level of blur
	ctx.shadowColor = `${blurColor}`; // The color of the blur
	ctx.shadowOffsetX = 0; // Horizontal offset of the blur
	ctx.shadowOffsetY = 0; // Vertical offset of the blur

	// we fill a semitransparent rect each frame to fade out over time. 
	// Adjust alpha value to change the speed of the fade.
	ctx.fillStyle = fillColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	effect.handleParticles(ctx);
	// lerp from old maxDistance to new distance
	maxDistance += (targetDistance - maxDistance) * 0.001;

	requestAnimationFrame(animate);
}

// run loop
updateMaxDistance();
effect.handleParticles(ctx, false);
animate();





