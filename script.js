
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
export let perceptionRadius = minMax(20, 50);

// swarming behaviour
export let attractionForce = 1.35;
export let separationForce = 0.8;
export let alignmentForce = 0.75;

export let maxVelocity = 1;
export let minVelocity = 0.5;
export let maxAcceleration = 1.35;
export let mutatedMaxVelocity = 0.1;
export let mutatedMinVelocity = 0.005;



let particleRepelRadius = [2, 2];
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


let slider = document.getElementById('slider');

noUiSlider.create(slider, {
	start: [20, 80],
	connect: true,
	range: {
		'min': 0,
		'max': 100
	}
});

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
effect.handleParticles(ctx);
animate();





