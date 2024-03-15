import { Effect } from '../classes/effect.js';
import { minMax } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
const mouseAttractOffsetX = minMax(-0.2, 0.2);
const mouseAttractOffsetY = minMax(-0.3, 0.24);
const mouseAttractSpeed = minMax(0.2, 0.4);

canvas.width = card.clientWidth;
canvas.height = card.clientHeight;
ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
ctx.lineWidth = minMax(1, 6);

console.log(ctx);

export let maxDistance = minMax(1, 15);
let numberOfParticles = minMax(200, 600);

let alpha = 0.4;
let particleRepelRadius = [2, 2];
let particleSizeRange = [1, 5];
let particleColor = 'pink';
let targetDistance = maxDistance;
let isRepellingMouse = true;
let isAttractedToMouse = false;
let hasBeenTweaked = false;
export let maxVelocity = 3;
export let minVelocity = 1;

const mouseRadiusRange = [10, 80];
const mouseRepelRange = [10, 20];


const effect = new Effect(
	canvas,
	numberOfParticles,
	particleSizeRange,
	particleColor,
	particleRepelRadius,
	mouseRadiusRange,
	mouseRepelRange,
	isRepellingMouse,
	isAttractedToMouse,
	hasBeenTweaked,
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





