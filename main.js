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
ctx.lineWidth = 0.5;

// Randomly decide whether to use trails or not
const useTrails = Math.random() > 0.5; // 50% chance for trails
console.log(`Trail mode: ${useTrails ? 'ON' : 'OFF'}`);

// Define trail effect - how fast the trails fade out (only used if useTrails is true)
// Lower values = longer trails, higher values = shorter trails
const fadeSpeed = minMax(0.001, 0.1);
console.log(`fadeSpeed: ${fadeSpeed}`);

const numberOfParticles = minMax(350, 600);

// Define distinct "states" for the particle system with dramatically different visuals
const states = [
    { name: "Isolated", distance: 5, lineWidth: 0.2 },       // Very few connections
    { name: "Sparse", distance: 15, lineWidth: 0.5 },        // Some connections
    { name: "Connected", distance: 30, lineWidth: 0.8 },     // Many connections
    { name: "Dense", distance: 50, lineWidth: 0.4 },         // Lots of connections
    { name: "Galactic", distance: 80, lineWidth: 0.2 }       // Nearly all connected
];

// Initialize with a random state
let currentStateIndex = Math.floor(Math.random() * states.length);
let targetStateIndex = currentStateIndex;
let currentState = { ...states[currentStateIndex] };

// Define the transition speed (lower = slower transition)
const transitionSpeed = 0.003; // Adjust this value to control transition speed

function updateState() {
    // Move to a distinctly different state by jumping at least 2 states away
    // This ensures dramatic visual changes between states
    let newStateIndex;
    
    do {
        // Get a new state that's different enough from current
        newStateIndex = Math.floor(Math.random() * states.length);
        
        // Make sure it's not the same as the current state
        // AND ensure it's at least 2 states apart from current
    } while (
        newStateIndex === targetStateIndex || // Prevent same state as current target
        Math.abs(newStateIndex - targetStateIndex) < 2 // Ensure sufficiently different
    );
    
    // Update state index
    targetStateIndex = newStateIndex;
    
    console.log(`Transitioning to new state: ${states[targetStateIndex].name}`);
    
    // Schedule the next update (random time between 8-15 seconds)
    const nextUpdateTime = 8000 + Math.random() * 7000;
    setTimeout(updateState, nextUpdateTime);
}

// Start the state transitions
setTimeout(updateState, 2000);

// Create the effect
const effect = new Effect(canvas, ctx, numberOfParticles);

// Modify the Particle class's draw method for glow effect
effect.particles.forEach(particle => {
    const originalDraw = particle.draw;
    
    particle.draw = function(context) {
        // Use lighter composite operation for additive blending (creates natural glow)
        context.globalCompositeOperation = 'lighter';
        
        // Draw a slightly larger, semi-transparent circle for the glow effect
        context.beginPath();
        context.arc(this.x, this.y, this.size * 1.8, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.25)`;
        context.fill();
        
        // Draw a medium-sized glow
        context.beginPath();
        context.arc(this.x, this.y, this.size * 1.4, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, 0.25)`;
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
    
    // Get target state
    const targetState = states[targetStateIndex];
    
    // Smoothly transition current state values toward target state values
    currentState.distance += (targetState.distance - currentState.distance) * transitionSpeed;
    currentState.lineWidth += (targetState.lineWidth - currentState.lineWidth) * transitionSpeed;
    
    // Apply the current line width
    ctx.lineWidth = currentState.lineWidth;
    
    // Draw the particles and connections using the current (interpolated) settings
    effect.handleParticles(currentState.distance);
    
    requestAnimationFrame(animate);
}

animate();