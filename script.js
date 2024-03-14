import { Effect } from '../classes/effect.js';
import { minMax } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
let alpha = 0.15;
const mouseAttractOffsetX = minMax(-0.2, 0.2);
const mouseAttractOffsetY = minMax(-0.3, 0.24);
const mouseAttractSpeed = minMax(0.2, 0.4);

canvas.width = card.clientWidth;
canvas.height = card.clientHeight;
ctx.strokeStyle = 'white';
ctx.lineWidth = minMax(1, 3);

console.log(ctx);

export let maxDistance = minMax(20, 50);
let numberOfParticles = minMax(100, 200);

let particleRepelRadius = [1, 14];
let particleSizeRange = [1, 4];
let particleColor = 'white';
let targetDistance = maxDistance;

const mouseRadiusRange = [10, 80];
const mouseRepelRange = [0.1, 2];


const effect = new Effect(canvas, numberOfParticles, particleSizeRange, particleColor, particleRepelRadius, mouseRadiusRange, mouseRepelRange);
export function randomizeParticles(particle) {
	particle.size = minMax(particleSizeRange[0], particleSizeRange[1]);
	particle.color = particleColor;
}

function updateMaxDistance() {
	targetDistance = minMax(20, 50);
	setTimeout(updateMaxDistance, 5000);
}
function animate() {
	let fillColor = `rgba(77, 77,77, ${alpha})`;
	console.log('alpha adj:' + alpha);
	// we fill a semitransparent rect each frame to fade out over time. Adjust alpha value to change the mouseAttractSpeed of the fade.
	ctx.fillStyle = fillColor;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	effect.handleParticles(ctx);
	// lerp from old maxDistance to new distance
	maxDistance += (targetDistance - maxDistance) * 0.0001;
	requestAnimationFrame(animate);
}


// run loop
updateMaxDistance();
effect.handleParticles(ctx);
animate();





