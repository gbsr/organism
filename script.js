
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
// ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
ctx.strokeStyle = 'pink';
ctx.lineWidth = minMax(1, 4);

console.log(ctx);

export let maxDistance = minMax(1, 15);
let numberOfParticles = minMax(40, 80);
export let perceptionRadius = minMax(40, 80);

// swarming behaviour
export let cohesionForce = 0;
export let separationForce = 0.8;
export let alignmentForce = 0;

export let maxVelocity = 1.4;
export let minVelocity = 0.9;
export let maxAcceleration = 1.35;
export let mutatedMaxVelocity = 0.1;
export let mutatedMinVelocity = 0.005;



let particleRepelRadius = [30, 90];
let particleSizeRange = [5, 10];
let particleColor = 'pink';
let targetDistance = maxDistance;
let isRepellingMouse = true;
let isAttractedToMouse = false;
let hasBeenTweaked = false;
let isLeader = false;

let alpha = 0.3;
let blurAmount = 10;
let blurColor = 'green';

const mouseRadiusRange = [10, 80];
const mouseRepelRange = [10, 20];


let attractionSlider = document.getElementById('attractionForce');
let separationSlider = document.getElementById('separationForce');
let alignmentSlider = document.getElementById('alignmentForce');

setupSliderElements();

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

// Assuming 'particles' is an array that holds your particles
// and 'spawnParticle' is a function that spawns a new particle

document.querySelector('.reloadSystem').addEventListener('click', function () {
	effect.handleParticles(ctx, true);
});
function setupSliderElements() {
	const sliders = [
		{ element: attractionSlider, start: [0.01, 0.5], range: { 'min': 0, '10%': 0.1, '50%': 0.5, 'max': 10 }, variable: 'attractionForce' },
		{ element: separationSlider, start: [0.01, 0.5], range: { 'min': 0, '10%': 0.1, '50%': 0.5, 'max': 5 }, variable: 'separationForce' },
		{ element: alignmentSlider, start: [0.01, 0.5], range: { 'min': 0, '10%': 0.1, '50%': 0.5, 'max': 5 }, variable: 'alignmentForce' },
	];

	sliders.forEach(slider => {
		noUiSlider.create(slider.element, {
			start: slider.start,
			connect: true,
			range: slider.range,
			tooltips: [true, true],
		});

		// Listen for the update event
		slider.element.noUiSlider.on('update', function (values, handle) {
			// Update the variable with the new value
			if (slider.variable === 'attractionForce') {
				cohesionForce = Number(values[handle]);
			} else if (slider.variable === 'separationForce') {
				separationForce = Number(values[handle]);
			} else if (slider.variable === 'alignmentForce') {
				alignmentForce = Number(values[handle]);
			}
		});
	});
}
export function randomizeParticles(particle) {
	particle.size = minMax(particleSizeRange[0], particleSizeRange[1]);
	particle.color = particleColor;
}

function updateMaxDistance() {
	targetDistance = minMax(1, 80);
	setTimeout(updateMaxDistance, minMax(5000, 20000));
	// console.log('updated max distance: ' + targetDistance);
}
function animate() {
	let fillColor = `rgba(77, 77,77, ${alpha})`;

	ctx.shadowBlur = `${blurAmount}`; // Adjust the level of blur
	ctx.shadowColor = `${blurColor}`; // The color of the blur
	ctx.shadowOffsetX = 0; // Horizontal offset of the blur
	ctx.shadowOffsetY = 0; // Vertical offset of the blur

	// we fill a semitransparent rect each frame to fade out over time. Adjust alpha value to change the speed of the fade.
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





