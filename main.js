import { Effect } from './effect.js';
import { minMax, getRandomBrightColor } from './helpers.js';

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

ctx.strokeStyle = getRandomBrightColor();
ctx.lineWidth = 0.05;

const numberOfParticles = minMax(450, 650);

let maxDistance = minMax(2, 10);
let targetDistance = maxDistance;

function updateMaxDistance() {
    targetDistance = minMax(18, 35);
    // targetDistance = 22;
     console.log(`targetDistance: ${targetDistance}`);
    setTimeout(updateMaxDistance, 5000);
}

updateMaxDistance();

const effect = new Effect(canvas, ctx, numberOfParticles);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.width = canvas.width;
    effect.height = canvas.height;
    effect.createParticles();
});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticles(maxDistance);
    maxDistance += (targetDistance - maxDistance) * 0.01;
    requestAnimationFrame(animate);
}

animate();