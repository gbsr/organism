import { Effect } from '../classes/effect.js';
import { minMax } from './helpers.js';

const canvas = document.getElementById('canvas1');
const card = document.getElementById('card');
const ctx = canvas.getContext('2d');
canvas.width = card.clientWidth;
canvas.height = card.clientHeight;
ctx.strokeStyle = 'white';
ctx.lineWidth = 3;

console.log(ctx);

export let maxDistance = minMax(20, 50);
let numberOfParticles = minMax(100, 200);

let particleRepelRadius = [1, 14];
let particleSizeRange = [1, 4];
let particleColor = 'white';
let targetDistance = maxDistance;

const effect = new Effect(canvas, numberOfParticles, particleSizeRange, particleColor, particleRepelRadius);
export function randomizeParticles(particle) {
	particle.size = minMax(particleSizeRange[0], particleSizeRange[1]);
	particle.color = particleColor;
}

function updateMaxDistance() {
	targetDistance = minMax(20, 50);
	setTimeout(updateMaxDistance, 5000);
}
function animate() {

	// we fill a semitransparent rect each frame to fade out over time. Adjust alpha value to change the speed of the fade.

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	// ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'rgba(5, 5, 7, 0.39)';
	effect.handleParticles(ctx);
	// lerp from old maxDistance to new distance
	maxDistance += (targetDistance - maxDistance) * 0.01;
	requestAnimationFrame(animate);
}


// run loop
updateMaxDistance();
effect.handleParticles(ctx);
animate();





