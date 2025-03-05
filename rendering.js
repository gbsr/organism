import { grid, CELL_SIZE } from './helpers.js';

export function drawParticles(ctx, offscreenCtx, offscreenCanvas, particles) {
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    particles.forEach(particle => particle.draw(offscreenCtx));
    ctx.drawImage(offscreenCanvas, 0, 0);
}

export function connectParticles(ctx, color, maxDistance) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    const maxConnections = 500;
    const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    const hue = hslMatch[1];
    const saturation = hslMatch[2];
    const lightness = hslMatch[3];

    for (let key in grid) {
        const cell = grid[key];
        for (let i = 0; i < cell.length; i++) {
            const particle = cell[i];
            let connections = 0;

            for (let offsetX = -1; offsetX <= 1; offsetX++) {
                for (let offsetY = -1; offsetY <= 1; offsetY++) {
                    const neighborKey = `${Math.floor(particle.x / CELL_SIZE) + offsetX},${Math.floor(particle.y / CELL_SIZE) + offsetY}`;
                    const neighborCell = grid[neighborKey];

                    if (neighborCell) {
                        for (let j = 0; j < neighborCell.length; j++) {
                            if (connections >= maxConnections) break;

                            const other = neighborCell[j];
                            if (particle === other) continue;

                            const dx = particle.x - other.x;
                            const dy = particle.y - other.y;
                            const distance = Math.sqrt(dx * dx + dy * dy);

                            if (distance < maxDistance) {
                                const opacity = 1 - (distance / maxDistance);
                                const strokeWidth = 2 - (distance / maxDistance);

                                // Main connection
                                ctx.beginPath();
                                ctx.moveTo(particle.x, particle.y);
                                ctx.lineTo(other.x, other.y);
                                ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
                                ctx.lineWidth = strokeWidth;
                                ctx.stroke();

                                // Glow effect
                                ctx.beginPath();
                                ctx.moveTo(particle.x, particle.y);
                                ctx.lineTo(other.x, other.y);
                                ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity * 0.5})`;
                                ctx.lineWidth = strokeWidth * 2;
                                ctx.stroke();

                                connections++;
                            }
                        }
                    }
                }
            }
        }
    }

    ctx.restore();
}