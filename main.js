import { Effect } from './effect.js';
import { minMax, getRandomBrightColor } from './helpers.js';

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Get a random bright color for particles and connections
const particleColor = getRandomBrightColor();
console.log(`Particle color: ${particleColor}`);

// Extract RGB components for later use in rgba
let rgbValues = particleColor.match(/\d+/g);
if (!rgbValues) {
    rgbValues = [255, 255, 255]; // Default to white if extraction fails
}

ctx.strokeStyle = particleColor;
// ctx.lineWidth = minMax(0.15, 5);
ctx.lineWidth = 0.5;

// Randomly decide whether to use trails or not
const useTrails = Math.random() > 0.5; // 50% chance for trails
console.log(`Trail mode: ${useTrails ? 'ON' : 'OFF'}`);

// Define trail effect - how fast the trails fade out (only used if useTrails is true)
// Lower values = longer trails, higher values = shorter trails
const fadeSpeed = minMax(0.0001, 0.01);
console.log(`fadeSpeed: ${fadeSpeed}`);

const numberOfParticles = minMax(350, 600);

// let maxDistance = minMax(2, 20);
let targetDistance = minMax(2, 20);

function updateMaxDistance() {
    targetDistance = minMax(10, 35);
    console.log(`targetDistance: ${targetDistance}`);
    setTimeout(updateMaxDistance, 5000);
}

updateMaxDistance();

// Create the effect
const effect = new Effect(canvas, ctx, numberOfParticles);

// Modify the Particle class's draw method directly for better performance
// This is a much more efficient approach than using shadowBlur
effect.particles.forEach(particle => {
    // Store the original draw method
    const originalDraw = particle.draw;
    
    // Replace with our optimized glow version
    particle.draw = function(context) {
        // Use lighter composite operation for additive blending (creates natural glow)
        context.globalCompositeOperation = 'lighter';
        
        // Draw a slightly larger, semi-transparent circle for the glow effect
        context.beginPath();
        context.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.15)`;
        context.fill();
        
        // Draw a medium-sized glow
        context.beginPath();
        context.arc(this.x, this.y, this.size * 1.4, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.15)`;
        context.fill();
        
        // Reset composite operation for the actual particle
        context.globalCompositeOperation = 'source-over';
        
        // Call the original draw method to draw the actual particle
        originalDraw.call(this, context);
    };
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effect.width = canvas.width;
    effect.height = canvas.height;
    effect.createParticles();
});

function animate() {
    if (useTrails) {
        // Trail mode: Apply semi-transparent overlay for trail effect
        ctx.fillStyle = `rgba(0, 0, 0, ${fadeSpeed})`;
        
        // Make existing content more transparent while preserving background
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Reset to normal drawing mode
        ctx.globalCompositeOperation = 'source-over';
    } else {
        // No-trail mode: Clear canvas completely each frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw the particles and connections
    effect.handleParticles(targetDistance);
    
    // maxDistance += (targetDistance - maxDistance) * 0.0015;
    requestAnimationFrame(animate);
}

animate();