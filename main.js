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

// Randomly decide whether to use trails or not
const useTrails = Math.random() > 0.5; // 50% chance for trails
console.log(`Trail mode: ${useTrails ? 'ON' : 'OFF'}`);

// Define trail effect - how fast the trails fade out (only used if useTrails is true)
// Lower values = longer trails, higher values = shorter trails
// const fadeSpeed = minMax(0, 1);
const fadeSpeed = 0.025;
console.log(`fadeSpeed: ${fadeSpeed}`);

const numberOfParticles = minMax(350, 600);

// Define states with different visual and behavioral characteristics
const states = [
    { 
        name: "Organic Swarm", 
        distance: 40,           // Medium connection distance
        lineWidth: 0.25,         // Medium line width
        glowSize: 1,          // Variable glow size
        glowOpacity: 0.5,                  // Medium glow opacity
        particleSize: 3,         // Medium to large particles
        speedMultiplier: 0.1,              // Very slow movement
        centerAttraction: 5, // Almost no center attraction
        // Boids behavior parameters
        separationForce: 0.75,                 // Strong separation
        cohesionForce: 0.3,  // Medium cohesion
        alignmentForce: 0.25,  // Strong alignment
        separationDistance: 40,  // Medium separation distance
        neighborDistance: 120    // Medium neighbor awareness
    },
    { 
        name: "Cosmic Web", 
        distance: 80,           // Longer connection distance
        lineWidth: 0.15,       // Thinner lines
        glowSize: 1,           // Much larger glow
        glowOpacity: 0.5,                  // Lower glow opacity
        particleSize: 3,     // Smaller particles
        speedMultiplier: 0.25,               // Faster movement
        centerAttraction: -0.2, // Strong center attraction
        // Contrasting boids behavior
        separationForce: 1,               // Weaker separation
        cohesionForce: 0.25,    // Much stronger cohesion
        alignmentForce: 0.15,   // Weaker alignment
        separationDistance: minMax(10, 15),   // Smaller separation distance
        neighborDistance: 8    // Much larger neighbor awareness
    }
];

// Easing functions for smoother transitions
const Easing = {
    // Linear (no easing)
    linear: t => t,
    
    // Quadratic
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    // Cubic
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    // Elastic
    easeInElastic: t => t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI),
    easeOutElastic: t => t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1,
    
    // Sine
    easeInSine: t => -Math.cos(t * Math.PI/2) + 1,
    easeOutSine: t => Math.sin(t * Math.PI/2),
    easeInOutSine: t => -0.5 * (Math.cos(Math.PI * t) - 1),
    
    // Bouncing
    easeInBounce: t => 1 - Easing.easeOutBounce(1 - t),
    easeOutBounce: t => {
        if (t < 1/2.75) {
            return 7.5625 * t * t;
        } else if (t < 2/2.75) {
            return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
        } else if (t < 2.5/2.75) {
            return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
        }
    },
    easeInOutBounce: t => t < 0.5 ? Easing.easeInBounce(t * 2) * 0.5 : Easing.easeOutBounce(t * 2 - 1) * 0.5 + 0.5
};

// For continuous morphing, we'll need to track the current morphing progress
let morphProgress = 0; // 0 to 1 represents progress between states
let morphDirection = 1; // 1 for forward, -1 for backward
let currentStateIndex = 0;
let targetStateIndex = 1;
let currentState = {}; // Will be computed by lerping between states

// Choose the easing function to use 
// You can change this to any of the functions defined in the Easing object
const currentEasing = Easing.easeInOutQuad;

// Define the lerp function with easing support
function lerp(start, end, t, easingFn = Easing.linear) {
    // Apply the easing function to the progress value
    const easedT = easingFn(t);
    return start + easedT * (end - start);
}

// Define the transition speed (for continuous morphing)
// Lower = slower morphing, higher = faster morphing
const morphSpeed = 0.003; // Adjust for desired morphing speed

// Create the effect
const effect = new Effect(canvas, ctx, numberOfParticles);

// Modify the Particle class's draw method and other behaviors
effect.particles.forEach(particle => {
    const originalDraw = particle.draw;
    const originalHandleMouseInteraction = particle.handleMouseInteraction;
    const originalLimitSpeed = particle.limitSpeed;
    
    // Save the original values for each particle
    particle.originalCenterAttractionStrength = particle.centerAttractionStrength;
    particle.originalMaxSpeed = particle.maxSpeed;
    particle.originalSize = particle.size;
    
    // Replace with our optimized glow version that responds to state changes
    particle.draw = function(context) {
        // Use lighter composite operation for additive blending (creates natural glow)
        context.globalCompositeOperation = 'lighter';
        
        // Apply current state's glow size and opacity
        const glowSize = currentState.glowSize || 1.8;
        const glowOpacity = currentState.glowOpacity || 0.15;
        
        // Adjust particle size based on current state
        this.size = (currentState.particleSize || 3.15) * (this.originalSize / 3.15);
        
        // Draw a slightly larger, semi-transparent circle for the glow effect
        context.beginPath();
        context.arc(this.x, this.y, this.size * glowSize, 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${glowOpacity})`;
        context.fill();
        
        // Draw a medium-sized glow
        context.beginPath();
        context.arc(this.x, this.y, this.size * (glowSize * 0.8), 0, Math.PI * 2);
        context.fillStyle = `rgba(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]}, ${glowOpacity * 1.2})`;
        context.fill();
        
        // Reset composite operation for the actual particle
        context.globalCompositeOperation = 'source-over';
        
        // Call the original draw method to draw the actual particle
        originalDraw.call(this, context);
    };
    
    // Completely replace the update method with our own implementation
    particle.update = function() {
        // Apply speed multiplier from current state
        this.maxSpeed = this.originalMaxSpeed * (currentState.speedMultiplier || 0);
        
        // Calculate direction to the center of the canvas
        const centerX = this.effect.width / 2;
        const centerY = this.effect.height / 2;
        
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distanceToCenter = Math.hypot(dx, dy);
        
        // Use center attraction from state (can be 0)
        const centerAttractionValue = currentState.centerAttraction || 0;
        
        if (distanceToCenter > 0 && centerAttractionValue !== 0) {
            // Apply force toward center, strength increases with distance
            this.vx += (dx / distanceToCenter) * this.originalCenterAttractionStrength * centerAttractionValue;
            this.vy += (dy / distanceToCenter) * this.originalCenterAttractionStrength * centerAttractionValue;
        }
        
        // Apply YOUR boids behavior (this will use the state values)
        this.applyBoidsBehavior();
        
        // Keep the original mouse interaction - this maintains interactivity
        originalHandleMouseInteraction.call(this);
        
        // Apply movement
        this.x += this.vx;
        this.y += this.vy;

        // Add some friction to gradually slow down particles when no forces are applied
        const friction = 0.99;
        this.vx *= friction;
        this.vy *= friction;

        // Use the original limit speed function
        originalLimitSpeed.call(this);

        // Keep particles within bounds
        this.x = Math.max(Math.min(this.x, this.effect.width - this.size), this.size);
        this.y = Math.max(Math.min(this.y, this.effect.height - this.size), this.size);
        
        // DO NOT call originalUpdate.call(this); - that's what's causing the problem
    };
    
    // Override the boids behavior to implement state-specific flocking parameters
    particle.applyBoidsBehavior = function() {
        let separationForce = { x: 0, y: 0 };
        let cohesionForce = { x: 0, y: 0 };
        let alignmentForce = { x: 0, y: 0 };
        let neighborCount = 0;

        // Get current state's boids parameters (or use defaults)
        const stateSeparationForce = currentState.separationForce || 0;
        const stateCohesionForce = currentState.cohesionForce || 0;
        const stateAlignmentForce = currentState.alignmentForce || 0;
        const stateSeparationDistance = currentState.separationDistance || 0;
        const stateNeighborDistance = currentState.neighborDistance || 0;

        // Skip calculations if all forces are zero or distances are zero
        if ((stateSeparationForce === 0 && stateCohesionForce === 0 && stateAlignmentForce === 0) || 
            (stateSeparationDistance === 0 && stateNeighborDistance === 0)) {
            return;
        }

        for (let other of this.effect.particles) {
            if (other === this || other.organismId !== this.organismId) continue;

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.hypot(dx, dy);
            
            // Apply state-specific separation distance
            if (distance < this.size * stateSeparationDistance && stateSeparationForce !== 0) {
                separationForce.x += dx / distance;
                separationForce.y += dy / distance;
            }

            // Apply state-specific neighbor distance
            if (distance < this.size * stateNeighborDistance && 
                (stateCohesionForce !== 0 || stateAlignmentForce !== 0)) {
                cohesionForce.x += other.x;
                cohesionForce.y += other.y;
                alignmentForce.x += other.vx;
                alignmentForce.y += other.vy;
                neighborCount++;
            }
        }

        if (neighborCount > 0) {
            cohesionForce.x = cohesionForce.x / neighborCount - this.x;
            cohesionForce.y = cohesionForce.y / neighborCount - this.y;
            alignmentForce.x /= neighborCount;
            alignmentForce.y /= neighborCount;
        }

        // Apply state-specific force multipliers to boids behavior
        this.vx += (
            separationForce.x * stateSeparationForce + 
            cohesionForce.x * stateCohesionForce + 
            alignmentForce.x * stateAlignmentForce
        );
        this.vy += (
            separationForce.y * stateSeparationForce + 
            cohesionForce.y * stateCohesionForce + 
            alignmentForce.y * stateAlignmentForce
        );
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
    
    // Update morph progress based on morph direction
    morphProgress += morphDirection * morphSpeed;
    
    // Check if we need to switch direction/states
    if (morphProgress >= 1) {
        // We've reached the target state, now reverse the direction
        morphProgress = 1;
        morphDirection = -1;
        
        // Optional: Log transition for debugging
        console.log(`Reached state: ${states[targetStateIndex].name}, now morphing back to ${states[currentStateIndex].name}`);
    } else if (morphProgress <= 0) {
        // We've gone back to the original state, switch states and direction
        morphProgress = 0;
        morphDirection = 1;
        
        // Move to the next state
        currentStateIndex = (currentStateIndex + 1) % states.length;
        targetStateIndex = (targetStateIndex + 1) % states.length;
        
        // Optional: Log transition for debugging
        console.log(`New morph: ${states[currentStateIndex].name} -> ${states[targetStateIndex].name}`);
    }
    
    // Get current and target states
    const stateA = states[currentStateIndex];
    const stateB = states[targetStateIndex];
    
    // Calculate current state by lerping between stateA and stateB based on progress
    currentState = {};
    for (const key in stateA) {
        if (key === 'name') continue; // Skip name property
        
        // Apply the currently selected easing function to the interpolation
        currentState[key] = lerp(stateA[key], stateB[key], morphProgress, currentEasing);
    }
    
    // Apply the current line width
    ctx.lineWidth = currentState.lineWidth;
    
    // Draw the particles and connections using the current settings
    effect.handleParticles(currentState.distance);
    
    requestAnimationFrame(animate);
}

animate();